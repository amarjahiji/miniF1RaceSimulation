import * as THREE from 'three';
import { CAMERA_CONFIG } from './config.js';
import { core, car, cameraState } from './state.js';

export function updateCamera() {
    if (!car.group) return;

    if (cameraState.mode === 'chase') {
        // Chase camera - behind and above
        const { offset, lookOffset, lerpFactor } = CAMERA_CONFIG.chase;
        const cameraOffset = new THREE.Vector3(offset.x, offset.y, offset.z);
        cameraOffset.applyQuaternion(car.group.quaternion);
        const targetPosition = car.group.position.clone().add(cameraOffset);

        core.camera.position.lerp(targetPosition, lerpFactor);

        const lookTarget = car.group.position.clone();
        lookTarget.y += lookOffset.y;
        core.camera.lookAt(lookTarget);

    } else {
        // First-person - rigidly attached
        car.group.updateMatrixWorld();

        const { offset, lookAhead } = CAMERA_CONFIG.firstPerson;
        const driverOffset = new THREE.Vector3(offset.x, offset.y, offset.z);
        driverOffset.applyMatrix4(car.group.matrixWorld);
        core.camera.position.copy(driverOffset);

        const lookTarget = new THREE.Vector3(lookAhead.x, lookAhead.y, lookAhead.z);
        lookTarget.applyMatrix4(car.group.matrixWorld);
        core.camera.lookAt(lookTarget);
    }
}
