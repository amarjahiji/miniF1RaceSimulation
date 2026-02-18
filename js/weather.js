import * as THREE from 'three';
import { core, car, lights, weather } from './state.js';

/**
 * Creates the rain particle system
 * Rain is initially invisible, toggled with L key
 */
export function createRainParticles() {
    const rainCount = 5000;
    const rainGeometry = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 3);

    for (let i = 0; i < rainCount * 3; i += 3) {
        rainPositions[i] = (Math.random() - 0.5) * 200;
        rainPositions[i + 1] = Math.random() * 100;
        rainPositions[i + 2] = (Math.random() - 0.5) * 200;
    }

    rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));

    const rainMaterial = new THREE.PointsMaterial({
        color: 0xaaaaaa,
        size: 0.2,
        transparent: true,
        opacity: 0.6
    });

    weather.rainParticles = new THREE.Points(rainGeometry, rainMaterial);
    weather.rainParticles.visible = false;
    core.scene.add(weather.rainParticles);
}

/**
 * Toggles rain mode on/off
 * Changes: particle visibility, sky color, fog, light intensity
 */
export function toggleRainMode() {
    if (weather.isRaining) {
        weather.rainParticles.visible = true;
        core.scene.background = new THREE.Color(0x4a5568);
        core.scene.fog = new THREE.Fog(0x4a5568, 30, 150);
        lights.sun.intensity = 0.4;
        lights.sun.color.setHex(0x9999aa);
        lights.hemisphere.intensity = 0.3;
        lights.hemisphere.color.setHex(0x6688aa);
    } else {
        weather.rainParticles.visible = false;
        core.scene.background = new THREE.Color(0x87ceeb);
        core.scene.fog = new THREE.Fog(0x87ceeb, 100, 400);
        lights.sun.intensity = 1.2;
        lights.sun.color.setHex(0xffffcc);
        lights.hemisphere.intensity = 0.6;
        lights.hemisphere.color.setHex(0x87ceeb);
    }
}

/**
 * Updates rain particle positions each frame
 * Particles fall and respawn near the car
 */
export function updateRain() {
    if (!weather.rainParticles || !weather.isRaining) return;

    const positions = weather.rainParticles.geometry.attributes.position.array;

    for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= 1.5; // Fall speed

        // Respawn at top when hitting ground
        if (positions[i + 1] < 0) {
            positions[i + 1] = 100;
            positions[i] = (Math.random() - 0.5) * 200 + (car.group ? car.group.position.x : 0);
            positions[i + 2] = (Math.random() - 0.5) * 200 + (car.group ? car.group.position.z : 0);
        }
    }

    weather.rainParticles.geometry.attributes.position.needsUpdate = true;
}
