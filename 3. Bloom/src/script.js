import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

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
camera.position.set(5, 5, 5);
scene.add(camera);

/**
 * Addition
 */
// Controls
const orbitControls = new OrbitControls(camera, canvas);
orbitControls.enableDamping = true;

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
// scene.add(ambientLight);

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
let model_1, model_2, model_3;

/**
 * Bloom
 */

const params = {
    threshold: 3,
    strength: 2,
    radius: 1,
    exposure: 1,
};

const renderScene = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
);
bloomPass.threshold = params.threshold;
bloomPass.strength = params.strength;
bloomPass.radius = params.radius;

const target = new THREE.WebGLRenderTarget(1024, 1024, {
    type: THREE.HalfFloatType,
    format: THREE.RGBAFormat,
  })

const bloomComposer = new EffectComposer(renderer, target);
bloomComposer.renderToScreen = true;
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

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
gltfLoader.load("/models/1.glb", (gltf) => {
    model_1 = gltf.scene;
    model_1.traverse((child) => {
        if (child.name == "Sphere_3") {
            console.log(child.material);
            // child.material.toneMapped = false;
            child.material.emissive.set("green");
            child.material.emissiveIntensity = 10;
        }
    });
    scene.add(model_1);
});
gltfLoader.load("/models/2.glb", (gltf) => {
    model_2 = gltf.scene;
    model_2.position.y = 1;
    console.log(model_2);
    model_2.children[0].material.emissive.set("blue");
    model_2.children[0].material.emissiveIntensity = 40;
    scene.add(model_2);
});
gltfLoader.load("/models/3.glb", (gltf) => {
    model_3 = gltf.scene;
    model_3.position.y = -1;
    scene.add(model_3);
});

/**
 * Action
 */
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

    // Bloom
    bloomComposer.render();

    // Call animate again on the next frame
    window.requestAnimationFrame(animate);
};

animate();
