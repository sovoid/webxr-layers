import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory";

import panoVideo from "../media/pano.mp4";
import buttonClickSound from "../media/audio/button-click.mp3";
import { CanvasUI } from "../util/CanvasUI";
import { WebGLRenderer } from "../util/WebGLRenderer";
import { VRButton } from "../util/webxr/VRButton";

class App {
    constructor(videoIn = panoVideo) {
        const container = document.createElement("div");
        document.body.appendChild(container);

        // Create Camera
        this.camera = this.createCamera();

        // Create Scene
        this.scene = this.createScene();

        // Create Renderer
        this.renderer = this.createRenderer();
        container.appendChild(this.renderer.domElement);

        // Create Orbit Controls
        this.controls = this.createOrbitControls();

        // Track which objects are hit
        this.raycaster = new THREE.Raycaster();

        // Create Canvas UI
        this.ui = this.createUI();
        this.progressBar = this.createProgressBar();

        this.toolbarGroup = new THREE.Group();
        this.toolbarGroup.add(this.ui.mesh);
        this.toolbarGroup.add(this.progressBar);

        // Hide the toolbar initially
        this.scene.userData.isToolbarVisible = false;

        // Create Video
        this.video = this.createVideo(videoIn);

        this.setupVR();

        // We need to bind `this` so that we can refer to the App object inside these methods
        window.addEventListener("resize", this.resize.bind(this));
        this.renderer.setAnimationLoop(this.render.bind(this));
    }

    /**
     * Renders the scene on the renderer
     */
    render() {
        const xr = this.renderer.xr;
        const session = xr.getSession();

        if (xr.isPresenting) {
            this.ui.update();
        }

        if (
            session &&
            session.renderState.layers &&
            !session.hasMediaLayer &&
            this.video.readyState
        ) {
            session.hasMediaLayer = true;
            session.requestReferenceSpace("local").then((refSpace) => {
                const mediaFactory = new XRMediaBinding(session);
                const equirectLayer = mediaFactory.createEquirectLayer(
                    this.video,
                    {
                        space: refSpace,
                        layout: "stereo-top-bottom",
                    }
                );
                session.updateRenderState({
                    layers: [equirectLayer, session.renderState.layers[0]],
                });
                this.video.play();
            });
        }
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Builds controllers to show in VR World
     */
    buildControllers() {
        const controllerModelFactory = new XRControllerModelFactory();

        const controllers = [];

        const ray = this.buildRay();

        const onSelectStart = (event) => {
            // Ftech the controller
            const controller = event.target;

            // Play sound effect and ray effect
            const sound = new Audio(buttonClickSound);
            sound.play();

            this.handleToolbarIntersection(controller);
        };

        for (let i = 0; i <= 1; i++) {
            const controller = this.renderer.xr.getController(i);
            controller.add(ray.clone());
            controller.userData.selectPressed = false;
            this.scene.add(controller);

            controller.addEventListener("selectstart", onSelectStart);

            controllers.push(controller);

            const grip = this.renderer.xr.getControllerGrip(i);
            const controllerModel = controllerModelFactory.createControllerModel(
                grip
            );
            grip.add(controllerModel);
            this.scene.add(grip);
        }

        return controllers;
    }

    /**
     * Creates a ray for ray casting
     */
    buildRay() {
        const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, -1),
        ]);

        const line = new THREE.Line(geometry);
        line.name = "line";
        line.scale.z = 10;

        return line;
    }

    /**
     * Creates a three.js PerspectiveCamera
     */
    createCamera() {
        const camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            100
        );
        // Place the camera at the height of an average person
        camera.position.set(0, 1.6, 0);

        return camera;
    }

    /**
     * Creates Orbit Controls
     */
    createOrbitControls() {
        const controls = new OrbitControls(
            this.camera,
            this.renderer.domElement
        );
        controls.target.set(0, 1.6, 0);
        controls.update();

        return controls;
    }

    /**
     * Creates a three.js Renderer
     */
    createRenderer() {
        const renderer = new WebGLRenderer({
            antialias: true,
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.outputEncoding = THREE.sRGBEncoding;

        return renderer;
    }

    /**
     * Creates a three.js scene
     */
    createScene() {
        const scene = new THREE.Scene();

        return scene;
    }

    /**
     * Creates a toolbar with playback controls
     */
    createUI() {
        const onRestart = () => {
            this.video.currentTime = 0;
        };

        const onSkip = (val) => {
            this.video.currentTime += val;
        };

        const onPlayPause = () => {
            const paused = this.video.paused;
            console.log(paused);

            if (paused) {
                this.video.play();
            } else {
                this.video.pause();
            }

            const label = paused ? "||" : "►";
            this.ui.updateElement("pause", label);
        };

        const colors = {
            blue: {
                light: "#1bf",
                lighter: "#3df",
            },
            red: "#f00",
            white: "#fff",
            yellow: {
                bright: "#ff0",
                dark: "#bb0",
            },
        };

        const config = {
            panelSize: { width: 2, height: 0.5 },
            opacity: 1,
            height: 128,
            prev: {
                type: "button",
                position: { top: 32, left: 0 },
                width: 64,
                fontColor: colors.yellow.dark,
                hover: colors.yellow.bright,
                onSelect: () => onSkip(-5),
            },
            pause: {
                type: "button",
                position: { top: 35, left: 64 },
                width: 128,
                height: 52,
                fontColor: colors.white,
                backgroundColor: colors.red,
                hover: colors.yellow.bright,
                onSelect: onPlayPause,
            },
            next: {
                type: "button",
                position: { top: 32, left: 192 },
                width: 64,
                fontColor: colors.yellow.dark,
                hover: colors.yellow.bright,
                onSelect: () => onSkip(5),
            },
            restart: {
                type: "button",
                position: { top: 35, right: 10 },
                width: 200,
                height: 52,
                fontColor: colors.white,
                backgroundColor: colors.blue.light,
                hover: colors.blue.lighter,
                onSelect: onRestart,
            },
            renderer: this.renderer,
        };

        const content = {
            prev: "<path>M 10 32 L 54 10 L 54 54 Z</path>",
            pause: "||",
            next: "<path>M 54 32 L 10 10 L 10 54 Z</path>",
            restart: "Restart",
        };

        const ui = new CanvasUI(content, config);
        ui.mesh.position.set(0, -1, -3);
        ui.mesh.rotateX(-Math.PI / 4);

        return ui;
    }

    createProgressBar() {
        const barGeometry = new THREE.PlaneGeometry(2, 0.01);
        const barMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const barMesh = new THREE.Mesh(barGeometry, barMaterial);
        return barMesh;
    }

    /**
     * Creates an HTML video using `videoIn` as src attribute
     * @param {} videoIn video.src
     */
    createVideo(videoIn) {
        const video = document.createElement("video");
        video.loop = true;
        video.src = videoIn;

        return video;
    }

    /**
     * Gets an array of hits on the UI toolbar
     * @param {*} controller controller to detect hits from
     */
    handleToolbarIntersection(controller) {
        // If toolbar not in view, display it
        if (!this.scene.userData.isToolbarVisible) {
            this.scene.userData.isToolbarVisible = true;
            this.scene.add(this.toolbarGroup);
        } else {
            // Make toolbar disappear if no interaction with toolbar
            const worldMatrix = new THREE.Matrix4();
            worldMatrix.identity().extractRotation(controller.matrixWorld);

            this.raycaster.ray.origin.setFromMatrixPosition(
                controller.matrixWorld
            );
            this.raycaster.ray.direction
                .set(0, 0, -1)
                .applyMatrix4(worldMatrix);

            const intersections = this.raycaster.intersectObjects([
                this.toolbarGroup,
            ]);

            if (intersections.length === 0) {
                this.scene.userData.isToolbarVisible = false;
                this.scene.remove(this.toolbarGroup);
            }
        }
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
     * Adds a button to enable VR for supported devices
     */
    setupVR() {
        this.renderer.xr.enabled = true;

        this.controllers = this.buildControllers();
        for (let controller of this.controllers) {
            controller.addEventListener("disconnected", () => {
                this.scene.remove(this.toolbarGroup);
            });
        }

        const vrButton = new VRButton(this.renderer, {
            requiredFeatures: ["layers"],
            optionalFeatures: ["local-floor", "bounded-floor"],
        });
        document.body.appendChild(vrButton.domElement);
    }
}

export default App;
