import * as THREE from 'three';
import { TRACK_CONFIG, TRACK_POINTS, TREE_POSITIONS } from './config.js';
import { core, track, textures } from './state.js';
import { gltfLoader } from './loaders.js';

/**
 * Creates the complete environment
 * @param {Object} materials - Materials from scene.js
 */
export function createEnvironment(materials) {
    createSkyDome(materials);
    createGround();
    createProceduralTrack(materials);
    createKerbs(materials);
    createStartFinishLine();
    createCrashBarriers(materials);
    createOuterGrass();
    createTrees();
}

/**
 * Creates sky dome
 */
function createSkyDome(materials) {
    const skyGeo = new THREE.SphereGeometry(500, 32, 32);
    const sky = new THREE.Mesh(skyGeo, materials.sky);
    core.scene.add(sky);
}

/**
 * Creates base ground with sand texture
 */
function createGround() {
    const groundTexture = textures.sand.clone();
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(20, 20);
    groundTexture.needsUpdate = true;

    const groundMat = new THREE.MeshLambertMaterial({ map: groundTexture });
    const groundGeo = new THREE.PlaneGeometry(400, 400);
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    core.scene.add(ground);
}

/**
 * Creates the race track using CatmullRomCurve3
 */
function createProceduralTrack(materials) {
    const points = TRACK_POINTS.map(p => new THREE.Vector3(p.x, p.y, p.z));
    const curve = new THREE.CatmullRomCurve3(points, true);

    const trackGeo = new THREE.TubeGeometry(curve, 200, 5, 8, true);

    // Flatten the tube
    const positions = trackGeo.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] = positions[i + 1] < 0 ? 0 : 0.2;
    }
    trackGeo.attributes.position.needsUpdate = true;
    trackGeo.computeVertexNormals();

    const trackMesh = new THREE.Mesh(trackGeo, materials.track);
    trackMesh.receiveShadow = true;
    core.scene.add(trackMesh);

    // Store curve reference
    track.curve = curve;
    window.trackCurve = curve;
}

/**
 * Creates F1-style kerbs (red/white stripes)
 */
function createKerbs(materials) {
    const curve = track.curve;
    if (!curve) return;

    const { trackRadius, kerbWidth } = TRACK_CONFIG;
    const kerbHeight = 0.08;
    const numSegments = 160;

    for (let i = 0; i < numSegments; i++) {
        const t = i / numSegments;
        const point = curve.getPoint(t);
        const tangent = curve.getTangent(t);
        const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

        const kerbLength = (2 * Math.PI * 50) / numSegments * 1.15;
        const kerbGeo = new THREE.BoxGeometry(kerbWidth, kerbHeight, kerbLength);

        const isRed = Math.floor(i / 2) % 2 === 0;
        const kerbMat = isRed ? materials.kerbRed : materials.kerbWhite;
        const yOffset = isRed ? 0 : 0.01;

        // Outer kerb
        const outerKerb = new THREE.Mesh(kerbGeo, kerbMat);
        outerKerb.position.set(
            point.x + normal.x * (trackRadius + kerbWidth / 4),
            kerbHeight / 2 + 0.25 + yOffset,
            point.z + normal.z * (trackRadius + kerbWidth / 4)
        );
        outerKerb.rotation.y = Math.atan2(tangent.x, tangent.z);
        outerKerb.receiveShadow = true;
        core.scene.add(outerKerb);

        // Inner kerb
        const innerKerb = new THREE.Mesh(kerbGeo, kerbMat);
        innerKerb.position.set(
            point.x - normal.x * (trackRadius + kerbWidth / 4),
            kerbHeight / 2 + 0.25 + yOffset,
            point.z - normal.z * (trackRadius + kerbWidth / 4)
        );
        innerKerb.rotation.y = Math.atan2(tangent.x, tangent.z);
        innerKerb.receiveShadow = true;
        core.scene.add(innerKerb);
    }
}

/**
 * Creates checkered start/finish line
 */
function createStartFinishLine() {
    const curve = track.curve;
    if (!curve) return;

    const startPoint = curve.getPoint(0);
    const tangent = curve.getTangent(0);
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

    const checkerSize = 0.8;
    const checkerGroup = new THREE.Group();

    for (let i = -5; i <= 5; i++) {
        for (let j = 0; j < 2; j++) {
            const isWhite = (i + j) % 2 === 0;
            const checkerMat = new THREE.MeshBasicMaterial({
                color: isWhite ? 0xffffff : 0x000000
            });
            const checkerGeo = new THREE.PlaneGeometry(checkerSize, checkerSize);
            const checker = new THREE.Mesh(checkerGeo, checkerMat);
            checker.rotation.x = -Math.PI / 2;

            const posX = startPoint.x + normal.x * i * checkerSize + tangent.x * j * checkerSize;
            const posZ = startPoint.z + normal.z * i * checkerSize + tangent.z * j * checkerSize;
            checker.position.set(posX, 0.22, posZ);

            checkerGroup.add(checker);
        }
    }

    core.scene.add(checkerGroup);
}

/**
 * Creates grass areas outside the fences
 */
function createOuterGrass() {
    const curve = track.curve;
    if (!curve) return;

    const grassMat = new THREE.MeshLambertMaterial({
        map: textures.grass,
        color: 0x88aa88
    });

    const { trackRadius, kerbWidth, sandWidth, fenceOffset } = TRACK_CONFIG;
    const grassStart = trackRadius + kerbWidth + sandWidth + fenceOffset;
    const outerGrassWidth = 30;
    const innerGrassWidth = 25;
    const numSegments = 80;

    for (let i = 0; i < numSegments; i++) {
        const t = i / numSegments;
        const point = curve.getPoint(t);
        const tangent = curve.getTangent(t);
        const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
        const grassLength = (2 * Math.PI * 100) / numSegments * 1.5;

        // Outer grass
        const outerGrassGeo = new THREE.PlaneGeometry(outerGrassWidth, grassLength);
        const outerGrass = new THREE.Mesh(outerGrassGeo, grassMat);
        outerGrass.rotation.x = -Math.PI / 2;
        outerGrass.position.set(
            point.x + normal.x * (grassStart + outerGrassWidth / 2),
            -0.05,
            point.z + normal.z * (grassStart + outerGrassWidth / 2)
        );
        outerGrass.rotation.z = -Math.atan2(tangent.x, tangent.z);
        outerGrass.receiveShadow = true;
        core.scene.add(outerGrass);

        // Inner grass
        const innerGrassGeo = new THREE.PlaneGeometry(innerGrassWidth, grassLength);
        const innerGrass = new THREE.Mesh(innerGrassGeo, grassMat);
        innerGrass.rotation.x = -Math.PI / 2;
        innerGrass.position.set(
            point.x - normal.x * (grassStart + innerGrassWidth / 2),
            -0.05,
            point.z - normal.z * (grassStart + innerGrassWidth / 2)
        );
        innerGrass.rotation.z = -Math.atan2(tangent.x, tangent.z);
        innerGrass.receiveShadow = true;
        core.scene.add(innerGrass);
    }

    // Center grass circle
    const centerGrassMat = new THREE.MeshLambertMaterial({
        map: textures.grass,
        color: 0x99bb99
    });
    const centerGrassGeo = new THREE.CircleGeometry(15, 32);
    const centerGrass = new THREE.Mesh(centerGrassGeo, centerGrassMat);
    centerGrass.rotation.x = -Math.PI / 2;
    centerGrass.position.y = -0.05;
    centerGrass.receiveShadow = true;
    core.scene.add(centerGrass);
}

/**
 * Creates F1-style crash barriers
 */
function createCrashBarriers(materials) {
    const curve = track.curve;
    if (!curve) return;

    const { trackRadius, kerbWidth, sandWidth } = TRACK_CONFIG;
    const barrierDistance = trackRadius + kerbWidth + sandWidth;
    track.barrierDistance = barrierDistance;
    window.barrierDistance = barrierDistance;

    const numSegments = 48;

    for (let i = 0; i < numSegments; i++) {
        const t = i / numSegments;
        const point = curve.getPoint(t);
        const tangent = curve.getTangent(t);
        const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
        const angle = Math.atan2(tangent.x, tangent.z);
        const segmentLength = (2 * Math.PI * 50) / numSegments * 1.15;

        // TecPro barriers (3 rows)
        const tecproWidth = 1.0;
        const tecproHeight = 0.9;

        for (let row = 0; row < 3; row++) {
            const tecproGeo = new THREE.BoxGeometry(tecproWidth, tecproHeight, segmentLength);
            const colorMat = row === 0 ? materials.tecproBlue :
                            (row === 1 ? materials.tecproRed : materials.tecproYellow);

            // Outer
            const tecpro = new THREE.Mesh(tecproGeo, colorMat);
            tecpro.position.set(
                point.x + normal.x * barrierDistance,
                tecproHeight / 2 + row * tecproHeight,
                point.z + normal.z * barrierDistance
            );
            tecpro.rotation.y = angle;
            tecpro.castShadow = true;
            tecpro.receiveShadow = true;
            core.scene.add(tecpro);

            // Inner
            const innerTecpro = new THREE.Mesh(tecproGeo, colorMat);
            innerTecpro.position.set(
                point.x - normal.x * barrierDistance,
                tecproHeight / 2 + row * tecproHeight,
                point.z - normal.z * barrierDistance
            );
            innerTecpro.rotation.y = angle;
            innerTecpro.castShadow = true;
            innerTecpro.receiveShadow = true;
            core.scene.add(innerTecpro);
        }

        // Concrete wall
        const concreteGeo = new THREE.BoxGeometry(0.4, 1.5, segmentLength);

        const concrete = new THREE.Mesh(concreteGeo, materials.concrete);
        concrete.position.set(
            point.x + normal.x * (barrierDistance + 0.8),
            0.75,
            point.z + normal.z * (barrierDistance + 0.8)
        );
        concrete.rotation.y = angle;
        concrete.castShadow = true;
        concrete.receiveShadow = true;
        core.scene.add(concrete);

        const innerConcrete = new THREE.Mesh(concreteGeo, materials.concrete);
        innerConcrete.position.set(
            point.x - normal.x * (barrierDistance + 0.8),
            0.75,
            point.z - normal.z * (barrierDistance + 0.8)
        );
        innerConcrete.rotation.y = angle;
        innerConcrete.castShadow = true;
        innerConcrete.receiveShadow = true;
        core.scene.add(innerConcrete);

        // Fence posts and panels
        const fenceDistance = barrierDistance + 1.5;
        const postHeight = 5;

        const postGeo = new THREE.CylinderGeometry(0.06, 0.08, postHeight, 8);

        const outerPost = new THREE.Mesh(postGeo, materials.fenceGreen);
        outerPost.position.set(
            point.x + normal.x * fenceDistance,
            postHeight / 2,
            point.z + normal.z * fenceDistance
        );
        outerPost.castShadow = true;
        core.scene.add(outerPost);

        const innerPost = new THREE.Mesh(postGeo, materials.fenceGreen);
        innerPost.position.set(
            point.x - normal.x * fenceDistance,
            postHeight / 2,
            point.z - normal.z * fenceDistance
        );
        innerPost.castShadow = true;
        core.scene.add(innerPost);

        // Horizontal rails
        for (let h = 0; h < 3; h++) {
            const railGeo = new THREE.BoxGeometry(0.05, 0.08, segmentLength);
            const railHeight = 1.2 + h * 1.6;

            const outerRail = new THREE.Mesh(railGeo, materials.fenceGreen);
            outerRail.position.set(point.x + normal.x * fenceDistance, railHeight, point.z + normal.z * fenceDistance);
            outerRail.rotation.y = angle;
            core.scene.add(outerRail);

            const innerRail = new THREE.Mesh(railGeo, materials.fenceGreen);
            innerRail.position.set(point.x - normal.x * fenceDistance, railHeight, point.z - normal.z * fenceDistance);
            innerRail.rotation.y = angle;
            core.scene.add(innerRail);
        }

        // Wire mesh
        const meshPanelGeo = new THREE.PlaneGeometry(segmentLength, postHeight - 0.5);

        const outerMeshPanel = new THREE.Mesh(meshPanelGeo, materials.meshPanel);
        outerMeshPanel.position.set(point.x + normal.x * fenceDistance, postHeight / 2 + 0.25, point.z + normal.z * fenceDistance);
        outerMeshPanel.rotation.y = angle + Math.PI / 2;
        core.scene.add(outerMeshPanel);

        const innerMeshPanel = new THREE.Mesh(meshPanelGeo, materials.meshPanel);
        innerMeshPanel.position.set(point.x - normal.x * fenceDistance, postHeight / 2 + 0.25, point.z - normal.z * fenceDistance);
        innerMeshPanel.rotation.y = angle + Math.PI / 2;
        core.scene.add(innerMeshPanel);

        // Top rail
        const topRailGeo = new THREE.BoxGeometry(0.08, 0.08, segmentLength);

        const outerTopRail = new THREE.Mesh(topRailGeo, materials.fenceGreen);
        outerTopRail.position.set(point.x + normal.x * fenceDistance, postHeight, point.z + normal.z * fenceDistance);
        outerTopRail.rotation.y = angle;
        core.scene.add(outerTopRail);

        const innerTopRail = new THREE.Mesh(topRailGeo, materials.fenceGreen);
        innerTopRail.position.set(point.x - normal.x * fenceDistance, postHeight, point.z - normal.z * fenceDistance);
        innerTopRail.rotation.y = angle;
        core.scene.add(innerTopRail);
    }
}

/**
 * Loads and places trees around the track
 */
async function createTrees() {
    const gltf = await new Promise((resolve, reject) => {
        gltfLoader.load('../models/tree.glb', resolve, undefined, reject);
    });

    const treeModel = gltf.scene;
    treeModel.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    TREE_POSITIONS.forEach((pos, index) => {
        const tree = treeModel.clone();
        tree.name = `Tree_${index}`;
        tree.position.set(pos.x, 0, pos.z);
        const scale = 2 + Math.random() * 1;
        tree.scale.set(scale, scale, scale);
        core.scene.add(tree);
    });
}


