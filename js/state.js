import * as THREE from 'three';

/**
 * Core Three.js Objects
 */
export const core = {
    scene: null,
    camera: null,
    renderer: null,
    orbitControls: null,
    clock: new THREE.Clock(),
};

/**
 * Car State
 */
export const car = {
    group: null,           // Parent group for world transform
    model: null,           // Loaded 3D model
    speed: 0,              // Current speed
    rotationSpeed: 0,      // Current steering
};

/**
 * Lighting References
 */
export const lights = {
    sun: null,             // Directional light
    hemisphere: null,      // Hemisphere light
};

/**
 * Weather State
 */
export const weather = {
    isRaining: false,
    rainParticles: null,
};

/**
 * Camera State
 */
export const cameraState = {
    mode: 'chase',         // 'chase' or 'firstperson'
    isPaused: false,
};

/**
 * Off-Road State
 */
export const offRoad = {
    wasOnSand: false,
    turnDirection: 0,
    turnTimer: 0,
};

/**
 * Game State
 */
export const game = {
    state: 'running',      // 'running', 'crashed', 'finished'
    lapStartTime: 0,
    currentLapTime: 0,
    bestLapTime: null,
    hasStartedLap: false,
    lastTrackT: 0,
    currentSurface: 'track',
};

/**
 * Input State
 */
export const input = {
    keys: {},
};

/**
 * Track Reference (set during environment creation)
 */
export const track = {
    curve: null,
    barrierDistance: 0,
};

/**
 * Textures (loaded at startup)
 */
export const textures = {
    grass: null,
    sand: null,
};

/**
 * Reset game state to initial values
 */
export function resetGameState() {
    car.speed = 0;
    car.rotationSpeed = 0;
    game.state = 'running';
    game.hasStartedLap = false;
    game.currentLapTime = 0;
    game.lastTrackT = 0;
    offRoad.wasOnSand = false;
    offRoad.turnTimer = 0;
}
