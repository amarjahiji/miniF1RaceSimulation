# miniF1RaceSimulation

A browser-based 3D F1 racing simulator implemented in JavaScript and Three.js.

## Overview

This project is built as part of a computer graphics course and demonstrates a simple F1-style racing simulation in the browser.
It uses a procedural race track, dynamic weather, and basic car physics to create a playable lap-based driving demo.

## Key Features

- Procedural race track generated from a `CatmullRomCurve3` spline.
- F1-style track details including kerbs, checkered start/finish line, grass, sand runoff, and impact barriers.
- Player-controlled car physics with acceleration, braking, steering, drag, and grip.
- Weather system with rain toggle that changes handling and adds particle rain effects.
- Lap timing, best lap tracking, and crash detection when hitting barriers at speed.
- Camera system with chase view, first-person view, and a free orbit view while paused.
- Overlay HUD showing speed, camera mode, weather state, current lap time, and best lap.

## Gameplay Details

- `W` / `S`: accelerate and brake
- `A` / `D`: steer left and right
- `C`: toggle between chase camera and first-person cockpit view
- `L`: toggle rain mode on and off
- `V`: pause simulation and enable free orbit camera controls

### Simulation mechanics

- Tire grip, acceleration, braking, and steering response depend on whether the track is dry or wet.
- Driving off the track onto sand causes lower friction and a brief forced turning drift.
- Colliding with barriers at moderate or high speed triggers a crash state and stops the car.
- Completing a lap across the start/finish line records lap time and updates best lap.

## Project Structure

- `index.html` - main application container and HUD overlay.
- `css/style.css` - overlay and page styling.
- `js/main.js` - Three.js scene setup, animation loop, and initialization.
- `js/game.js` - lap timing, crash detection, and restart logic.
- `js/car.js` - car movement, physics, steering, and surface-based handling.
- `js/camera.js` - chase and first-person camera behavior.
- `js/input.js` - keyboard controls and viewport resizing.
- `js/environment.js` - track and environment creation.
- `js/weather.js` - rain particle generation and animation.
- `js/loaders.js` - texture and car model loading.
- `js/state.js` - shared runtime state for the scene and gameplay.
- `js/config.js` - physics, track, and camera configuration parameters.
- `models/` - imported 3D model assets.
- `textures/` - texture assets used for ground, grass, and track elements.

## Running Locally

Open `index.html` in a WebGL-compatible browser.

If the browser blocks local file loading, run a simple local server from the project folder:

```bash
python3 -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

## Notes

- This project is intended as a computer graphics course demonstration, not a finished game.
- Use a browser that supports WebGL and ES module imports.
