import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { CAR_MODELS } from './config.js';
import { textures, car } from './state.js';

// Configure loaders
const textureLoader = new THREE.TextureLoader();
const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();

dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/');
gltfLoader.setDRACOLoader(dracoLoader);

// Export loader for use in other modules
export { gltfLoader };

/**
 * Loads all textures needed for the scene
 */
export function loadTextures() {
    

    // Grass texture
    textures.grass = textureLoader.load('../textures/grass.jpg');
    textures.grass.wrapS = THREE.RepeatWrapping;
    textures.grass.wrapT = THREE.RepeatWrapping;
    textures.grass.repeat.set(4, 4);

    // Sand texture
    textures.sand = textureLoader.load('../textures/sand.jpg');
    textures.sand.wrapS = THREE.RepeatWrapping;
    textures.sand.wrapT = THREE.RepeatWrapping;
    textures.sand.repeat.set(8, 8);

}

/**
 * Loads the car model
 * @returns {Promise<THREE.Group>} The loaded car model
 */
export async function loadCarModel() {
    const gltf = await new Promise((resolve, reject) => {
        gltfLoader.load(
            CAR_MODELS,
            (gltf) => resolve(gltf),
            (progress) => {
                // progress reporting intentionally silent
            },
            (error) => reject(error)
        );
    });

    return gltf.scene;
}

/**
 * Sets up the car model
 * @param {THREE.Group} loadedCarModel - The loaded GLTF model
 */
export function setupCarModel(loadedCarModel) {
    // Create parent group for world transform
    car.group = new THREE.Group();
    car.group.name = 'CarGroup';

    // Store model reference
    car.model = loadedCarModel;
    car.model.name = 'CarModel';

    // Scale and flip model (it's modeled facing wrong direction)
    car.model.scale.set(0.8, 0.8, 0.8);
    car.model.rotation.y = Math.PI;

    // Enable shadows on all meshes
    car.model.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    // Add model to group
    car.group.add(car.model);
}
