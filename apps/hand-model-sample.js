import randomColor from "randomcolor";
import * as THREE from "three";
import { BoxLineGeometry } from "three/examples/jsm/geometries/BoxLineGeometry";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { VRButton } from "three/examples/jsm/webxr/VRButton";

class App {
    constructor() {
        const container = document.createElement("div");
        document.body.appendChild(container);

        this.clock = new THREE.Clock();

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            100
        );
        this.camera.position.set(0, 1.6, 3);

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color("#505050");

        // Ambient Light
        const ambientLight = new THREE.HemisphereLight("#606060", "#040404");
        this.scene.add(ambientLight);

        // Directional Light
        const light = new THREE.DirectionalLight("#ffffff");
        light.position.set(1, 1, 1).normalize();
        this.scene.add(light);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        // Make the renderer to occupy the entire window
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        container.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(
            this.camera,
            this.renderer.domElement
        );
        this.controls.target.set(0, 1.6, 0);
        this.controls.update();

        this.initScene();
        this.setupVR();

        // We need to bind `this` so that we can refer to the App object inside these methods
        window.addEventListener("resize", this.resize.bind(this));
        this.renderer.setAnimationLoop(this.render.bind(this));
    }

    /**
     * Generates a random number between `min` and `max`
     * @param {number} min Min value
     * @param {number} max Max value
     */
    random(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * Initializes a three.js scene
     */
    initScene() {
        this.radius = 0.08;

        this.room = new THREE.LineSegments(
            new BoxLineGeometry(6, 6, 6, 10, 10, 10),
            new THREE.LineBasicMaterial({
                color: "#808080",
            })
        );
        this.scene.add(this.room);

        const objectGeometry = new THREE.IcosahedronBufferGeometry(
            this.radius,
            2
        );

        for (let i = 0; i < 200; i++) {
            const objectMaterial = new THREE.MeshLambertMaterial({
                color: randomColor(),
            });
            const object = new THREE.Mesh(objectGeometry, objectMaterial);
            object.position.x = this.random(-2, 2);
            object.position.y = this.random(-2, 2);
            object.position.z = this.random(-2, 2);

            this.room.add(object);
        }
    }

    /**
     * Adds a button to enable VR for supported devices
     */
    setupVR() {
        this.renderer.xr.enabled = true;
        document.body.appendChild(VRButton.createButton(this.renderer));
    }

    /**
     * Handles scene on resizing the window
     */
    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Renders the scene on the renderer
     */
    render() {
        this.renderer.render(this.scene, this.camera);
    }
}

export default App;
