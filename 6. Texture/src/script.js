import * as THREE from 'three';
import * as dat from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
// import {} from 'three/examples/jsm/loaders/'

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

// Texture
const texture = new THREE.TextureLoader().load( "images/1.png" );
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
// texture.repeat.set( 4, 1 );

// Plane
const gPlane = new THREE.PlaneGeometry(10, 10);
const mPlane = new THREE.MeshBasicMaterial({map: texture});
const plane = new THREE.Mesh(gPlane, mPlane);
plane.rotation.x = - Math.PI / 2;
scene.add(plane);

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

    texture.offset.x += 0.01;

    // Render Scene
    renderer.render(scene, camera);

    // Call animate again on the next frame
    window.requestAnimationFrame(animate);
};

animate();
