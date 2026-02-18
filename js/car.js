import * as THREE from 'three';
import { PHYSICS } from './config.js';
import { car, weather, offRoad, input } from './state.js';

/**
 * Processes keyboard input and updates car physics
 * @param {number} delta - Time since last frame in seconds
 */
export function handleCarControls(delta) {
    if (!car.group) return;

    // Get current surface type for physics modifications
    const surface = window.currentSurface || 'track';

    // Select physics parameters based on weather
    const params = weather.isRaining ? PHYSICS.rain : PHYSICS.dry;
    let { maxSpeed, accelRate, brakeRate, friction, steerResponse, grip } = params;

    // --- Off-Road Behavior ---
    if (surface === 'sand') {
        friction = PHYSICS.sand.friction;

        // Trigger random turn when first entering sand
        if (!offRoad.wasOnSand) {
            offRoad.turnDirection = (Math.random() > 0.5 ? 1 : -1) * PHYSICS.sand.turnStrength;
            offRoad.turnTimer = PHYSICS.sand.turnDuration;
            offRoad.wasOnSand = true;
        }

        // Apply forced turn while timer active
        if (offRoad.turnTimer > 0) {
            car.rotationSpeed = offRoad.turnDirection;
            offRoad.turnTimer -= delta;
        }
    } else {
        // Reset when back on track
        offRoad.wasOnSand = false;
        offRoad.turnTimer = 0;
    }

    if (input.keys['w']) {
        car.speed = Math.min(car.speed + accelRate * delta, maxSpeed);
    }
    if (input.keys['s']) {
        car.speed = Math.max(car.speed - brakeRate * delta, -15);
    }
    if (!input.keys['w'] && !input.keys['s']) {
        car.speed *= friction;
    }

    // --- Steering (A/D keys) ---
    // Skip normal steering if sand turn is active
    if (offRoad.turnTimer <= 0) {
        if (input.keys['a']) {
            car.rotationSpeed = steerResponse;
        } else if (input.keys['d']) {
            car.rotationSpeed = -steerResponse;
        } else {
            // Center steering when no input
            car.rotationSpeed *= weather.isRaining ? 0.92 : 0;
        }
    }

    // --- Apply Rotation ---
    if (Math.abs(car.speed) > 0.5) {
        const steerAmount = car.rotationSpeed * delta * (car.speed / 35) * grip;
        car.group.rotation.y += steerAmount;

        // Random sliding in rain
        if (weather.isRaining && Math.abs(car.speed) > 20) {
            car.group.rotation.y += (Math.random() - 0.5) * 0.01;
        }
    }

    // --- Apply Forward Movement ---
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(car.group.quaternion);
    car.group.position.addScaledVector(forward, car.speed * delta);

    // --- Update Speed Display ---
    const speedKmh = Math.abs(car.speed * 3.6).toFixed(0);
    document.getElementById('speed-display').textContent = speedKmh;
}

