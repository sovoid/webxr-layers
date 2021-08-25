
import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import { XRHandModelFactory } from 'three/examples/jsm/webxr/XRHandModelFactory.js';

const tmpVector1 = new THREE.Vector3();
const tmpVector2 = new THREE.Vector3();

let App = class App {
    constructor() {
        const container = document.createElement('div');
        document.body.appendChild(container);

        /*Creating Camera, Scene and Renderer */
        this.camera = this.createCamera();
        this.scene = this.createScene();
        this.renderer = this.createRenderer();
        container.appendChild(this.renderer.domElement);

        // Adding Lights
        this.addLight();

        const room = new THREE.LineSegments(
            new BoxLineGeometry(6, 6, 6, 10, 10, 10),
            new THREE.LineBasicMaterial({
                color: "#151515",
            })
        );
        room.geometry.translate(0, 3, 0);
        this.scene.add(room);

        this.controls = new OrbitControls(this.camera, container);
        this.controls.target.set(0, 1.6, 0);
        this.controls.update();

        this.session;
        this.renderer.xr.addEventListener("sessionstart", (event) => {
            this.session = this.renderer.xr.getSession();
        });
        this.renderer.xr.addEventListener("sessionend", (event) => {
            this.session = null;
        });

        // Build Hands
        this.rightHand;
        this.leftHand;
        this.buildHands(0); // Right Hand
        this.buildHands(1); // Left Hand

        this.midAndThumbReady = false;
        this.didSnap = false;
        this.rightPinch = false;

        this.spheres = []

        this.setupVR();
        this.renderer.setAnimationLoop(this.render.bind(this));
        window.addEventListener('resize', this.resize.bind(this));

    }

    buildHands(thehand){
        let controller;
        let controllerGrip;

        /*Initialising controllerModelFactory and handModelFactory from Three.js */
        const controllerModelFactory = new XRControllerModelFactory();
        const handModelFactory = new XRHandModelFactory().setPath(
            "../hand-models"
        );
        /* Setting up Hand from POV */
        controller = this.renderer.xr.getController(thehand);
        this.scene.add(controller);
        controllerGrip = this.renderer.xr.getControllerGrip(thehand);
        controllerGrip.add(controllerModelFactory.createControllerModel(controllerGrip));
        this.scene.add(controllerGrip);
        if (thehand == 0){
            this.rightHand = this.renderer.xr.getHand(0);
            this.rightHand.add(handModelFactory.createHandModel(this.rightHand));
            this.scene.add(this.rightHand);
        }
        else{
            this.leftHand = this.renderer.xr.getHand(1);
            this.leftHand.add(handModelFactory.createHandModel(this.leftHand));
            this.scene.add(this.leftHand);
        }
    }

    getHandVisibilityStatus() {
        if (this.session) {
            for (const inputSource of this.session.inputSources) {
                if (inputSource.hand) {
                    let name = inputSource.handedness;
                    let theHand;
                    if (name == 'right'){
                        theHand = this.rightHand;
                        let rightIndexTip = theHand.joints['index-finger-tip'];
                        let rightThumbTip = theHand.joints['thumb-tip'];
                        this.checkPinch(rightIndexTip, rightThumbTip, name)
                    } 
                    else if (name == 'left'){
                        theHand = this.leftHand;
                        let leftThumbTip = theHand.joints['thumb-tip'];
                        let leftIndexTip = theHand.joints['index-finger-tip']
                        let leftMiddleTip = theHand.joints['middle-finger-tip']
                        let leftRingTip = theHand.joints['ring-finger-tip'];
                        let leftPinkyTip = theHand.joints['pinky-finger-tip']
                        this.checkTouch(leftThumbTip, leftIndexTip, leftMiddleTip, leftRingTip, leftPinkyTip, name)
                    }
                    else{
                        console.log('Hands not being tracked...')
                    }
                }
            }
        }
    }

    checkPinch(thumbTip, indexTip, hand) {
        // Calculate the distance between positions of Index Tip and Thumb Tip
        let diffMidThumbX = Math.abs(indexTip.position.x - thumbTip.position.x)
        let diffMidThumbY = Math.abs(indexTip.position.y - thumbTip.position.y)
        let diffMidThumbZ = Math.abs(indexTip.position.z - thumbTip.position.z)

        if (diffMidThumbX!=0 || diffMidThumbY!=0 || diffMidThumbZ!=0){
            // When hands are not seen, the diffs initialize at zeroes. Stops once hands are seen.
            if (diffMidThumbX < 0.02 && diffMidThumbY < 0.02 && diffMidThumbZ < 0.02) {
                console.log(hand + "PINCHING")

                this.rightPinch = this.rightPinch == true ? false : true

                // Add Sphere when left pinched
                if (this.rightPinch == true){
                    console.log(this.rightPinch)
                    let geometryPinch = new THREE.SphereBufferGeometry(0.01, 30, 30);
                    let materialPinch = new THREE.MeshStandardMaterial({
                        color: 0xffffff 
                    });
                    let spherePinch = new THREE.Mesh(geometryPinch, materialPinch);
                    spherePinch.position.set(indexTip.position.x, indexTip.position.y, indexTip.position.z);
                    this.spheres.push(spherePinch);
                    this.scene.add(spherePinch);
                }
                // Not to add spheres on loop
                this.rightPinch = true;
            }
            else{
                this.rightPinch = false;
            }
        }
    }

    checkTouch(thumbTip, indexTip, middleTip, ringTip, pinkyTip, name) {
        console.log(this.spheres)
        if (this.spheres.length > 0){
            for (let i = 0; i < this.spheres.length; i++) {

                const distanceThumb = thumbTip.getWorldPosition(tmpVector1).distanceTo(this.spheres[i].getWorldPosition(tmpVector2));
                if (distanceThumb < this.spheres[i].geometry.parameters.radius * this.spheres[i].scale.x) {
                    console.log('Touch')
                        this.spheres[i].material.color.setHex(0x6feb10);
                }

                const distanceIndex = indexTip.getWorldPosition(tmpVector1).distanceTo(this.spheres[i].getWorldPosition(tmpVector2));
                if (distanceIndex < this.spheres[i].geometry.parameters.radius * this.spheres[i].scale.x) {
                    console.log('Touch')
                        this.spheres[i].material.color.setHex(0x00ffaa);
                }

                const distanceMid = middleTip.getWorldPosition(tmpVector1).distanceTo(this.spheres[i].getWorldPosition(tmpVector2));
                if (distanceMid < this.spheres[i].geometry.parameters.radius * this.spheres[i].scale.x) {
                    console.log('Touch')
                        this.spheres[i].material.color.setHex(0x1838d9);
                }

                const distanceRing = ringTip.getWorldPosition(tmpVector1).distanceTo(this.spheres[i].getWorldPosition(tmpVector2));
                if (distanceRing < this.spheres[i].geometry.parameters.radius * this.spheres[i].scale.x) {
                    console.log('Touch')
                        this.spheres[i].material.color.setHex(0x834ad4);
                }

                const distancePinky = pinkyTip.getWorldPosition(tmpVector1).distanceTo(this.spheres[i].getWorldPosition(tmpVector2));
                if (distancePinky < this.spheres[i].geometry.parameters.radius * this.spheres[i].scale.x) {
                    console.log('Touch')
                        this.spheres[i].material.color.setHex(0xc72f14);
                }
            }
        }
    }

    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    render() {
        this.renderer.render(this.scene, this.camera);
        this.getHandVisibilityStatus();
    }

    createCamera() {
        const camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            100
        );
        camera.position.set(0, 1.6, 3);
        return camera;
    }

    createScene() {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x808080);
        return scene;
    }

    createRenderer() {
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.xr.enabled = true;
        return renderer;
    }

    addLight() {
        const ambient = new THREE.HemisphereLight(0x606060, 0x404040);
        this.scene.add(ambient);
        const light = new THREE.DirectionalLight(0xffffff);
        light.position.set(1, 1, 1).normalize();
        this.scene.add(light);
    }
    setupVR() {
        this.renderer.xr.enabled = true;
        document.body.appendChild(VRButton.createButton(this.renderer));
    }
} 

export default App;
