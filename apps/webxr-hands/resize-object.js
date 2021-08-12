
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

        const geometry = new THREE.SphereBufferGeometry(0.1, 30, 30);
        const material = new THREE.MeshStandardMaterial({ color: 0xfdffbf });
        this.sphere = new THREE.Mesh(geometry, material);
        this.sphere.position.set(0, 0.6, -0.2);
        this.scene.add(this.sphere)

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

        this.rightHandSelection = false;
        this.leftHandSelection = false;
        this.initialDistance = 0;

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
                    if (name === 'right'){
                        theHand = this.rightHand;
                        let indexTip = theHand.joints['index-finger-tip'];
                        let thumbTip = theHand.joints['thumb-tip'];
                        this.checkSelection(indexTip, thumbTip, name)
                    } 
                    else if (name === 'left'){
                        theHand = this.leftHand;
                        let indexTip = theHand.joints['index-finger-tip'];
                        let thumbTip = theHand.joints['thumb-tip'];
                        this.checkSelection(indexTip, thumbTip, name)
                    }
                    else{
                        console.log('Hands not being tracked...')
                    }
                }
            }
        }
    }

    checkSelection(thumbTip, indexTip, hand) {
        // Calculate the distance between positions of Index Tip and Thubm Tip
        let diffX = Math.abs(indexTip.position.x - thumbTip.position.x)
        let diffY = Math.abs(indexTip.position.y - thumbTip.position.y)
        let diffZ = Math.abs(indexTip.position.z - thumbTip.position.z)

        // First check for pinching...
        if (diffX!=0 || diffY!=0 || diffZ!=0){
            // When hands are not seen, the diffs initialize at zeroes. Stops once hands are seen.
            if (diffX < 0.02 && diffY < 0.02 && diffZ < 0.02) {

                // Check for selection
                let distance = indexTip.getWorldPosition(tmpVector1).distanceTo(this.sphere.getWorldPosition(tmpVector2));
                if (distance < this.sphere.geometry.boundingSphere.radius * this.sphere.scale.x) {
                    // console.log(distance)
                    // console.log(this.sphere.geometry.boundingSphere.radius * this.sphere.scale.x)
                    if(hand == 'right'){
                        this.rightHandSelection = true;
                    }
                    if(hand == 'left'){
                        this.leftHandSelection = true;
                    }
                }
                else{
                    this.rightHandSelection = false;
                    this.leftHandSelection = false;
                }
            }
            else{
                this.rightHandSelection = false;
                this.leftHandSelection = false;
            }
        }
    }

    resizeObject(){
        if (this.rightHandSelection == true && this.leftHandSelection == true){
            console.log('Double Touch Detected...');
            let rightIndexTip = this.rightHand.joints['index-finger-tip'];
            let leftIndexTip = this.leftHand.joints['index-finger-tip'];

            let dx = rightIndexTip.position.x - leftIndexTip.position.x; 
            let dy = rightIndexTip.position.y - leftIndexTip.position.y; 
            let dz = rightIndexTip.position.z - leftIndexTip.position.z; 
            let distance = Math.sqrt(dx*dx+dy*dy+dz*dz);

            this.initialDistance = this.initialDistance != 0 ? this.initialDistance : distance;
            
            let theRatio = distance / this.initialDistance;

            this.sphere.scale.set(theRatio, theRatio, theRatio)
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
        this.resizeObject();
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
