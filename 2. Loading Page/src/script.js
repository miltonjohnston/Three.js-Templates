import * as THREE from "three";
import * as dat from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

import { gsap } from "gsap";

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
const ambientLight = new THREE.AmbientLight(0x161e33, 0.8);
scene.add(ambientLight);

// MODELVIEWER
let pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(
    new RoomEnvironment(),
    0.04
).texture;

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
let model;

/**
 * Models
 */
// Loading Bar
const manager = new THREE.LoadingManager();
manager.onProgress = function (url, itemsLoaded, itemsTotal) {
    document.querySelector(".progressbar").style.width =
        (itemsLoaded / itemsTotal) * 100 + "%";
    if (itemsLoaded === itemsTotal) {
        document.querySelector(".progress").style.opacity = 1;
        document.querySelector("#blocker").style.opacity = 1;
        gsap.to(document.querySelector(".progress").style, {
            opacity: 0,
            duration: 2,
            delay: 0.5,
        });
        gsap.to(document.querySelector("#blocker").style, {
            opacity: 0,
            duration: 2,
            delay: 0.5,
            onComplete: () => {
                document.querySelector(".progress").remove();
                document.querySelector("#blocker").remove();
            },
        });
    }
};

// Draco
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

// GLTF Loader
const gltfLoader = new GLTFLoader(manager);
gltfLoader.setDRACOLoader(dracoLoader);

// Load main model
gltfLoader.load("/models/model.glb", (gltf) => {
    model = gltf.scene;
    scene.add(model);
});

/**
 * Action
 */
window.addEventListener("click", (event) => {
    console.log("clicked!");
    testfunction();
});

/**
 * Functioins
 */
function testfunction() {
    console.log("testfunction!");
}

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
    // Update controls
    orbitControls.update();

    // Render Scene
    renderer.render(scene, camera);

    // Call animate again on the next frame
    window.requestAnimationFrame(animate);
};

animate();
