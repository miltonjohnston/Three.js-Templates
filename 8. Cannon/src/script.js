import * as THREE from 'three';
import { GUI } from 'lil-gui';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger';

const scene = new THREE.Scene();
scene.add(new THREE.AxesHelper(5));

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 50, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);


const radius = 1;
const sphereGeometry = new THREE.SphereGeometry(radius, 32, 32);
const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);

const sphereShape = new CANNON.Sphere(radius);
const sphereBody = new CANNON.Body({ mass: 5 });
sphereBody.addShape(sphereShape);
sphereBody.position.set(Math.random() * 20 - 10, 10, Math.random() * 20 - 10);
world.addBody(sphereBody);

const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");
gltfLoader.setDRACOLoader(dracoLoader);

gltfLoader.load("/models/temp.glb", (gltf) => {
    const model = gltf.scene;
    scene.add(model);

    street.traverse(function (node) {
        if (node.isMesh) {
            const geometry = node.geometry;
            const positionAttribute = geometry.attributes.position;

            const scale = node.scale; // Get the scale of the mesh node

            // Apply the scale to the position attribute during trimesh creation
            const scaledPositionArray = [];
            const positionArray = positionAttribute.array;
            for (let i = 0; i < positionArray.length; i += 3) {
                const x = positionArray[i] * scale.x;
                const y = positionArray[i + 1] * scale.y;
                const z = positionArray[i + 2] * scale.z;
                scaledPositionArray.push(x, y, z);
            }

            // Create the trimesh with the scaled position array
            const trimesh = new CANNON.Trimesh(
                scaledPositionArray,
                geometry.index ? geometry.index.array : undefined
            );

            const body = new CANNON.Body({ mass: 0 }); // Adjust the mass as needed
            body.addShape(trimesh);
            // Set the initial position, rotation, or other properties of the body
            body.position.copy(node.position);
            body.quaternion.copy(node.quaternion);

            // Add the body to your Cannon.js world
            world.addBody(body);
        }
    });
}
)

window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

const stats = new Stats()
document.body.appendChild(stats.dom)

const gui = new GUI();
const physicsFolder = gui.addFolder('Physics');
physicsFolder.add(world.gravity, 'x', -10.0, 10.0, 0.1);
physicsFolder.add(world.gravity, 'y', -10.0, 10.0, 0.1);
physicsFolder.add(world.gravity, 'z', -10.0, 10.0, 0.1);
physicsFolder.open();

const cannonDebugger = new CannonDebugger(scene, world);

const clock = new THREE.Clock();
let delta;

function animate() {
    requestAnimationFrame(animate);

    controls.update();

    sphere.position.copy(sphereBody.position);

    delta = Math.min(clock.getDelta(), 0.1);
    world.step(delta);

    cannonDebugger.update();

    render();

    stats.update();
}

function render() {
    renderer.render(scene, camera);
}

animate();