import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { core, car, lights, cameraState, game, track } from './state.js';

import { loadTextures, loadCarModel, setupCarModel } from './loaders.js';

import { configureShadows, setupLighting, createMaterials } from './scene.js';

import { createEnvironment } from './environment.js';

import { handleCarControls } from './car.js';

import { updateGameLogic, getCarTrackPosition } from './game.js';

import { createRainParticles, updateRain } from './weather.js';

import { updateCamera } from './camera.js';

import { setupInteractivity, onWindowResize } from './input.js';


//ANIMATION LOOP
function animate() {
    requestAnimationFrame(animate);
    const delta = core.clock.getDelta();

    // --- Pause Mode ---
    if (cameraState.isPaused) {
        core.orbitControls.update();
        core.renderer.render(core.scene, core.camera);
        return;
    }

    // --- Car Controls ---
    if (game.state === 'running') {
        handleCarControls(delta);
    }

    // --- Game Logic ---
    updateGameLogic(delta);

    // --- Animation 1: Rain ---
    updateRain();

    // --- Animation 2: Camera ---
    updateCamera();

    // --- Render ---
    core.renderer.render(core.scene, core.camera);
}

/**
 * Initializes the entire application
 * Sets up scene, loads models, and starts animation loop
 */
async function init() {

    // --- Create Scene ---
    core.scene = new THREE.Scene();
    core.scene.background = new THREE.Color(0x87ceeb);
    core.scene.fog = new THREE.Fog(0x87ceeb, 100, 400);

    // --- Create Camera ---
    core.camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    core.camera.position.set(0, 10, -20);

    // --- Create Renderer ---
    core.renderer = new THREE.WebGLRenderer({ antialias: true });
    core.renderer.setSize(window.innerWidth, window.innerHeight);
    core.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.body.appendChild(core.renderer.domElement);

    // --- Initialize Orbit Controls (for pause mode) ---
    core.orbitControls = new OrbitControls(core.camera, core.renderer.domElement);
    core.orbitControls.enableDamping = true;
    core.orbitControls.dampingFactor = 0.05;
    core.orbitControls.enabled = false;

    // --- Load Textures ---
    loadTextures();

    // --- Configure Systems ---
    configureShadows();
    setupLighting();
    const materials = createMaterials();
    createEnvironment(materials);
    createRainParticles();

    // --- Load Car Model ---
    try {
        const loadedCarModel = await loadCarModel();
        setupCarModel(loadedCarModel);
        core.scene.add(car.group);

        // Position at start line
        car.group.position.set(0, 0.25, -40);

        if (track.curve) {
            const tangent = track.curve.getTangent(0);
            car.group.rotation.y = Math.atan2(tangent.x, tangent.z);

            const { t } = getCarTrackPosition();
            game.lastTrackT = t;
        }

        

    } catch (error) {
        console.error('CRITICAL:', error.message);
        document.getElementById('error-overlay').style.display = 'flex';
        return;
    }

    // --- Setup Input ---
    setupInteractivity();

    // --- Handle Window Resize ---
    window.addEventListener('resize', onWindowResize);

    // --- Log Controls ---

    // --- Start Game Loop ---
    animate();
}

init();
