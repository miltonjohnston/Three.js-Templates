import * as THREE from "three";
import * as dat from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";

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
const ambientLight = new THREE.AmbientLight(0x161e33, 0.8);
scene.add(ambientLight);

// MODELVIEWER
let pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(
    new RoomEnvironment(),
    0.04
).texture;

// Raycaster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let pointedObject;

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
 * Outline
 */
const renderScene = new RenderPass(scene, camera);

const outlinePass = new OutlinePass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    scene,
    camera
);
outlinePass.edgeStrength = 3;
outlinePass.edgeGlow = 0.5;
outlinePass.edgeThickness = 3;
outlinePass.pulsePeriod = 2;
outlinePass.visibleEdgeColor = new THREE.Color(0xa020f0);
outlinePass.hiddenEdgeColor = new THREE.Color(0x000000);
outlinePass.pulseSpeed = 1;

const finalComposer = new EffectComposer(renderer);
finalComposer.addPass(renderScene); // Must be above!!!
finalComposer.addPass(outlinePass);

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
    scene.add(model_1);
});

gltfLoader.load("/models/2.glb", (gltf) => {
    model_2 = gltf.scene;
    scene.add(model_2);
});

gltfLoader.load("/models/3.glb", (gltf) => {
    model_3 = gltf.scene;
    model_3.position.y = 3;
    scene.add(model_3);
});

/**
 * Action
 */
window.addEventListener("pointermove", (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    outlinePass.selectedObjects = [];

    if (intersects.length > 0) {
        pointedObject = intersects[0].object;
        const result = untilParent(pointedObject, "Sphere_4");
        if (result) {
            console.log("on!");
            outlinePass.selectedObjects = [result[1]];
        }
    }
});

/**
 * Functioins
 */
function untilParent(obj, name) {
    let parent = obj;
    let flag = false;
    while (true) {
        if (parent == null) break;
        else if (parent.name == name) {
            flag = true;
            break;
        }

        parent = parent.parent;
    }

    return flag ? [flag, parent] : false;
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

    finalComposer.render();

    // Render Scene
    // renderer.render(scene, camera);

    // Call animate again on the next frame
    window.requestAnimationFrame(animate);
};

animate();
