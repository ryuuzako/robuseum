import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(2, 2, 4);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
light.position.set(0, 1, 0);
scene.add(light);

// Store loaded models and their states
const models = {
    current: null,
    loaded: {}
};

const loader = new GLTFLoader();

// Function to load a model
function loadModel(modelPath, isInitial = false) {
    return new Promise((resolve, reject) => {
        loader.load(
            modelPath,
            (gltf) => {
                // Store the loaded model
                models.loaded[modelPath] = gltf.scene;

                // If this is the initial model, display it
                if (isInitial) {
                    displayModel(modelPath);
                    // Load the rest in the background
                    for (let i = 1; i < modelPaths.length; i++) {
                        loadModel(modelPaths[i]);
                    }
                }

                resolve(gltf);
            },
            (progress) => {
                console.log(`Loading ${modelPath}: ${(progress.loaded / progress.total * 100).toFixed(2)}%`);
            },
            (error) => {
                console.error(`Error loading model ${modelPath}:`, error);
                reject(error);
            }
        );
    });
}
// Create an array of model paths for cycling
const modelPaths = Array.from({ length: 13 }, (_, i) => `roboGlb/robo${i}.glb`);
let currentModelIndex = 0;

// Add double-click event listener to switch models
renderer.domElement.addEventListener('dblclick', () => {
    // Move to the next model in the list
    currentModelIndex = (currentModelIndex + 1) % modelPaths.length;
    const nextModelPath = modelPaths[currentModelIndex];

    // Switch to the next model
    switchToModel(nextModelPath);
    console.log(`Switched to model: ${nextModelPath}`);
});

// Function to display a specific model
function displayModel(modelPath) {
    // Remove current model if there is one
    if (models.current) {
        scene.remove(models.current);
    }

    // Add the new model to the scene
    scene.add(models.loaded[modelPath]);
    models.current = models.loaded[modelPath];

    // Set up lighting for the model
    // Clear existing lights (except your base hemisphere light)
    scene.children.forEach(child => {
        if (child instanceof THREE.AmbientLight || child instanceof THREE.DirectionalLight) {
            scene.remove(child);
        }
    });

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
    sunLight.position.set(5, 10, 7.5);
    scene.add(sunLight);
}

// Load the first model and show it
loadModel(modelPaths[0], true);


// Example function to switch to another model
function switchToModel(modelPath) {
    if (models.loaded[modelPath]) {
        displayModel(modelPath);
    } else {
        console.warn(`Model ${modelPath} not loaded yet`);
    }
}

// You can call this to switch models
// Example: switchToModel('roboGlb/robo1.glb');

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});