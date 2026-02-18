export const CAR_MODELS = '../models/f1.glb';

/**
 * Track Dimensions
 */
export const TRACK_CONFIG = {
    trackRadius: 5,      // Half-width of the road
    kerbWidth: 0.8,      // Width of red/white kerbs
    sandWidth: 12,       // Run-off area width
    fenceOffset: 2,      // Distance from sand to fence
};

/**
 * Car Physics Parameters
 */
export const PHYSICS = {
    dry: {
        maxSpeed: 50,
        accelRate: 30,
        brakeRate: 60,
        friction: 0.995,
        steerResponse: 2.5,
        grip: 1.0,
    },
    rain: {
        maxSpeed: 40,
        accelRate: 22,
        brakeRate: 40,
        friction: 0.998,
        steerResponse: 6,
        grip: 0.6,
    },
    sand: {
        friction: 0.98,
        turnStrength: 3.5,
        turnDuration: 2.0,
    }
};

/**
 * Camera Settings
 */
export const CAMERA_CONFIG = {
    chase: {
        offset: { x: 0, y: 5, z: 12 },
        lookOffset: { x: 0, y: 1, z: 0 },
        lerpFactor: 0.08,
    },
    firstPerson: {
        offset: { x: 0, y: 1.0, z: 0 },
        lookAhead: { x: 0, y: 0.3, z: -20 },
    }
};

/**
 * Weather Settings
 */
export const WEATHER_CONFIG = {
    rainCount: 5000,
    rainFallSpeed: 1.5,
    rainSpread: 200,
    clearSky: 0x87ceeb,
    stormySky: 0x4a5568,
};

/**
 * Track control points for CatmullRomCurve3
 */
export const TRACK_POINTS = [
    { x: 0, y: 0, z: -40 },
    { x: 40, y: 0, z: -30 },
    { x: 50, y: 0, z: 0 },
    { x: 40, y: 0, z: 30 },
    { x: 0, y: 0, z: 40 },
    { x: -40, y: 0, z: 30 },
    { x: -50, y: 0, z: 0 },
    { x: -40, y: 0, z: -30 },
];

/**
 * Tree placement positions
 */
export const TREE_POSITIONS = [
    // Outer ring
    { x: 90, z: 0 }, { x: -90, z: 0 }, { x: 0, z: 90 }, { x: 0, z: -90 },
    { x: 80, z: 40 }, { x: -80, z: 40 }, { x: 80, z: -40 }, { x: -80, z: -40 },
    { x: 65, z: 65 }, { x: -65, z: 65 }, { x: 65, z: -65 }, { x: -65, z: -65 },
    { x: 40, z: 80 }, { x: -40, z: 80 }, { x: 40, z: -80 }, { x: -40, z: -80 },
    // Middle ring
    { x: 75, z: 20 }, { x: -75, z: 20 }, { x: 75, z: -20 }, { x: -75, z: -20 },
    { x: 20, z: 75 }, { x: -20, z: 75 }, { x: 20, z: -75 }, { x: -20, z: -75 },
    { x: 55, z: 55 }, { x: -55, z: 55 }, { x: 55, z: -55 }, { x: -55, z: -55 },
    // Additional scattered
    { x: 85, z: 15 }, { x: -85, z: 15 }, { x: 85, z: -15 }, { x: -85, z: -15 },
    { x: 15, z: 85 }, { x: -15, z: 85 }, { x: 15, z: -85 }, { x: -15, z: -85 },
    { x: 70, z: 50 }, { x: -70, z: 50 }, { x: 70, z: -50 }, { x: -70, z: -50 },
    { x: 50, z: 70 }, { x: -50, z: 70 }, { x: 50, z: -70 }, { x: -50, z: -70 },
    { x: 95, z: 30 }, { x: -95, z: 30 }, { x: 95, z: -30 }, { x: -95, z: -30 },
    { x: 30, z: 95 }, { x: -30, z: 95 }, { x: 30, z: -95 }, { x: -30, z: -95 },
];
