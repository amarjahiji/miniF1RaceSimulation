import { core, car, weather, cameraState, input } from './state.js';
import { toggleRainMode } from './weather.js';

export function setupInteractivity() {
    

    window.addEventListener('keydown', (e) => {
        input.keys[e.key.toLowerCase()] = true;

        // Camera mode toggle (C)
        if (e.key.toLowerCase() === 'c') {
            cameraState.mode = cameraState.mode === 'chase' ? 'firstperson' : 'chase';
            document.getElementById('camera-display').textContent =
                cameraState.mode === 'chase' ? 'Chase' : 'First-Person';
        }

        // Rain toggle (L)
        if (e.key.toLowerCase() === 'l') {
            weather.isRaining = !weather.isRaining;
            toggleRainMode();
            document.getElementById('weather-display').textContent =
                weather.isRaining ? 'Rain' : 'Clear';
        }

        // Pause toggle (V)
        if (e.key.toLowerCase() === 'v') {
            cameraState.isPaused = !cameraState.isPaused;
            core.orbitControls.enabled = cameraState.isPaused;

            if (cameraState.isPaused) {
                if (car.group) {
                    core.orbitControls.target.copy(car.group.position);
                }
                document.getElementById('camera-display').textContent = 'Free View (PAUSED)';
            } else {
                document.getElementById('camera-display').textContent =
                    cameraState.mode === 'chase' ? 'Chase' : 'First-Person';
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        input.keys[e.key.toLowerCase()] = false;
    });

    
}

/**
 * Handles browser window resize
 * Updates camera aspect ratio and renderer size
 */
export function onWindowResize() {
    core.camera.aspect = window.innerWidth / window.innerHeight;
    core.camera.updateProjectionMatrix();
    core.renderer.setSize(window.innerWidth, window.innerHeight);
}
