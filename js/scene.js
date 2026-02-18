import * as THREE from 'three';
import { core, lights, textures } from './state.js';

/**
 * Configures shadow mapping on the renderer
 */
export function configureShadows() {
    core.renderer.shadowMap.enabled = true;
    core.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}

/**
 * Sets up lighting for the scene
 * 2 light types: Directional (sun) and Hemisphere (ambient)
 */
export function setupLighting() {

    // Directional Light (Sun) - main shadow-casting light
    lights.sun = new THREE.DirectionalLight(0xffffcc, 1.2);
    lights.sun.position.set(50, 100, 50);
    lights.sun.castShadow = true;
    lights.sun.shadow.mapSize.width = 2048;
    lights.sun.shadow.mapSize.height = 2048;
    lights.sun.shadow.camera.left = -100;
    lights.sun.shadow.camera.right = 100;
    lights.sun.shadow.camera.top = 100;
    lights.sun.shadow.camera.bottom = -100;
    lights.sun.shadow.camera.near = 0.5;
    lights.sun.shadow.camera.far = 500;
    lights.sun.shadow.bias = -0.0001;
    core.scene.add(lights.sun);

    // Hemisphere Light - sky/ground ambient fill
    lights.hemisphere = new THREE.HemisphereLight(0x87ceeb, 0x545454, 0.6);
    core.scene.add(lights.hemisphere);

}

/**
 * Creates all materials used in the scene
 * @returns {Object} Collection of materials
 */
export function createMaterials() {

    const materials = {
        // Car Paint (PBR metallic)
        carPaint: new THREE.MeshStandardMaterial({
            color: 0x2A0000,
            metalness: 0.9,
            roughness: 0.1,
            emissive: 0x220000,
            emissiveIntensity: 0.2
        }),

        // Rubber Tires (Phong)
        tire: new THREE.MeshPhongMaterial({
            color: 0x1a1a1a,
            specular: 0x111111,
            shininess: 5
        }),

        // Track Asphalt (PBR matte)
        track: new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.95,
            metalness: 0.0
        }),

        // Grass (Lambert with texture)
        grass: new THREE.MeshLambertMaterial({
            map: textures.grass,
            color: 0x88aa88
        }),

        // Sky Dome (Basic unlit)
        sky: new THREE.MeshBasicMaterial({
            color: 0x87ceeb,
            side: THREE.BackSide
        }),

        // Barriers (PBR with emission)
        barrier: new THREE.MeshStandardMaterial({
            color: 0xff0000,
            emissive: 0x330000,
            emissiveIntensity: 0.3,
            roughness: 0.6,
            metalness: 0.2
        }),

        // Kerbs
        kerbRed: new THREE.MeshStandardMaterial({
            color: 0xcc0000,
            roughness: 0.7,
            metalness: 0.1
        }),
        kerbWhite: new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.7,
            metalness: 0.1
        }),

        // Barriers materials
        tecproBlue: new THREE.MeshStandardMaterial({ color: 0x0066cc, roughness: 0.6, metalness: 0.1 }),
        tecproRed: new THREE.MeshStandardMaterial({ color: 0xcc0000, roughness: 0.6, metalness: 0.1 }),
        tecproYellow: new THREE.MeshStandardMaterial({ color: 0xffcc00, roughness: 0.6, metalness: 0.1 }),
        concrete: new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.95, metalness: 0.0 }),
        fenceGreen: new THREE.MeshStandardMaterial({ color: 0x2d5a27, roughness: 0.4, metalness: 0.6 }),
        meshPanel: new THREE.MeshStandardMaterial({
            color: 0x444444, roughness: 0.5, metalness: 0.6,
            side: THREE.DoubleSide, transparent: true, opacity: 0.7
        }),
    };

    return materials;
}
