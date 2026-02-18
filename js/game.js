import { TRACK_CONFIG } from './config.js';
import { car, game, weather, offRoad, track } from './state.js';
import { toggleRainMode } from './weather.js';

/**
 * Finds the closest point on the track curve to the car
 * @returns {{ t: number, distance: number }} Track parameter and distance
 */
export function getCarTrackPosition() {
    if (!car.group || !track.curve) return { t: 0, distance: 0 };

    const curve = track.curve;
    let closestT = 0;
    let closestDist = Infinity;

    // Sample curve to find closest point
    for (let i = 0; i <= 200; i++) {
        const t = i / 200;
        const point = curve.getPoint(t);
        const dist = car.group.position.distanceTo(point);
        if (dist < closestDist) {
            closestDist = dist;
            closestT = t;
        }
    }

    return { t: closestT, distance: closestDist };
}

/**
 * Detects when car crosses the finish line
 * Finish line is at t=0 (where the curve starts)
 * @param {number} currentT - Current track position parameter
 * @returns {boolean} True if finish line was crossed
 */
function checkFinishLineCrossing(currentT) {
    const previousT = game.lastTrackT;
    game.lastTrackT = currentT;

    // Detect wrap-around crossing
    const crossedForward = previousT > 0.9 && currentT < 0.1;
    const crossedBackward = previousT < 0.1 && currentT > 0.9;

    // Ignore if standing still
    let tDelta = Math.abs(currentT - previousT);
    if (tDelta > 0.5) tDelta = 1 - tDelta;
    if (tDelta < 0.005) return false;

    return crossedForward || crossedBackward;
}

/**
 * Determines which surface the car is on
 * @param {number} distance - Distance from track center
 * @returns {'track' | 'sand' | 'barrier'} Surface type
 */
function getCarSurface(distance) {
    const { trackRadius, kerbWidth, sandWidth } = TRACK_CONFIG;
    const barrierDistance = track.barrierDistance || (trackRadius + kerbWidth + sandWidth);

    if (distance <= trackRadius + kerbWidth) {
        return 'track';
    } else if (distance <= barrierDistance - 0.5) {
        return 'sand';
    } else {
        return 'barrier';
    }
}

/**
 * Updates game state each frame
 * Handles lap timing and crash detection
 * @param {number} delta - Time since last frame
 */
export function updateGameLogic(delta) {
    if (game.state !== 'running') return;

    const { t, distance } = getCarTrackPosition();
    const surface = getCarSurface(distance);

    // Update lap timer
    if (game.hasStartedLap) {
        game.currentLapTime = (Date.now() - game.lapStartTime) / 1000;
        document.getElementById('lap-time-display').textContent = game.currentLapTime.toFixed(2);
    }

    // Check finish line crossing
    if (checkFinishLineCrossing(t)) {
        if (game.hasStartedLap) {
            if (!game.bestLapTime || game.currentLapTime < game.bestLapTime) {
                game.bestLapTime = game.currentLapTime;
                document.getElementById('best-time-display').textContent = game.bestLapTime.toFixed(2);
            }
            showLapComplete(game.currentLapTime);
        }
        game.hasStartedLap = true;
        game.lapStartTime = Date.now();
    }

    // Check for barrier crash
    if (surface === 'barrier' && Math.abs(car.speed) > 3) {
        game.state = 'crashed';
        showCrashScreen();
    }

    // Store surface for physics
    game.currentSurface = surface;
    window.currentSurface = surface;
}

/**
 * Shows lap completion notification
 * @param {number} lapTime - Completed lap time in seconds
 */
function showLapComplete(lapTime) {
    const overlay = document.getElementById('lap-complete-overlay');
    document.getElementById('completed-lap-time').textContent = lapTime.toFixed(2);
    overlay.style.display = 'flex';

    setTimeout(() => {
        overlay.style.display = 'none';
    }, 2000);
}

/**
 * Shows crash screen and stops car
 */
function showCrashScreen() {
    car.speed = 0;
    car.rotationSpeed = 0;
    document.getElementById('crash-overlay').style.display = 'flex';
}

/**
 * Resets the game to initial state
 * Called when player clicks restart button
 */
export function restartGame() {
    game.state = 'running';
    car.speed = 0;
    car.rotationSpeed = 0;
    game.hasStartedLap = false;
    game.currentLapTime = 0;
    game.lastTrackT = 0;

    // Reset off-road state
    offRoad.wasOnSand = false;
    offRoad.turnTimer = 0;
    offRoad.turnDirection = 0;

    // Reset car position
    if (car.group && track.curve) {
        car.group.position.set(0, 0.25, -40);
        const tangent = track.curve.getTangent(0);
        car.group.rotation.y = Math.atan2(tangent.x, tangent.z);

        const { t } = getCarTrackPosition();
        game.lastTrackT = t;
    }

    // Reset weather
    weather.isRaining = false;
    toggleRainMode();
    document.getElementById('weather-display').textContent = 'Clear';

    // Hide overlays
    document.getElementById('crash-overlay').style.display = 'none';
    document.getElementById('lap-complete-overlay').style.display = 'none';
    document.getElementById('lap-time-display').textContent = '0.00';
}

// Make restart accessible from HTML button
window.restartGame = restartGame;
