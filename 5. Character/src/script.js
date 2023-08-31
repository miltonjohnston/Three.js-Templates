import * as THREE from "three";
import * as dat from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/**
 ******************************
 ****** Three.js Initial ******
 ******************************
 */

/**
 * Init
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(5, 5, -5);
scene.add(camera);

/**
 * Addition
 */
// Controls
const orbitControls = new OrbitControls(camera, canvas);
orbitControls.enableDamping = true;

// Lights
// const ambientLight = new THREE.AmbientLight(0x161e33, 0.8);
// scene.add(ambientLight);

// MODELVIEWER
let pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(
    new RoomEnvironment(),
    0.04
).texture;

// Clock
const clock = new THREE.Clock();

// Axes
const axes = new THREE.AxesHelper(10);
scene.add(axes);

/**
 ******************************
 ************ Main ************
 ******************************
 */

/**
 * Definitions
 */

// Main Model
let animations, model, skeleton, mixer;

/**
 * Models
 */
// Draco
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

// GLTF Loader
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

// Load main model
gltfLoader.load("/models/Fox.glb", (gltf) => {
    model = gltf.scene;
    scene.add(model);
    animations = gltf.animations;

    // Skeleton
    skeleton = new THREE.SkeletonHelper(model);
    skeleton.visible = true;
    scene.add(skeleton);

    // Animation
    mixer = new THREE.AnimationMixer(gltf.scene);
    const action = mixer.clipAction(animations[2]);
    action.play();
});

/**
 * Functioins
 */
// Switch to another animation
function switchAnimation() {
    // Get the current action
    const currentAction = mixer._actions[0];
    // Get the new action
    const newAction = mixer.clipAction(animations[0]);
    // Crossfade to the new action
    currentAction.crossFadeTo(newAction, 1, true);
    newAction.play();
}

/**
 * Action
 */
window.addEventListener("click", (event) => {
    console.log("clicked!");
    switchAnimation();
});

// Auto Resize
window.addEventListener("resize", () => {
    // Update camera
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Animate
 */
const animate = () => {
    // Delta Time
    const deltaTime = clock.getDelta();

    // Update controls
    orbitControls.update();

    // Render Scene
    renderer.render(scene, camera);

    // Animation
    if (mixer) {
        mixer.update(deltaTime);
    }

    // Call animate again on the next frame
    window.requestAnimationFrame(animate);
};

animate();
