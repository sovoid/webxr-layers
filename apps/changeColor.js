
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

        let controllerRight, controllerLeft;
        let controllerRightGrip, controllerLeftGrip;

        this.drawFlag = false;

        /*Creating Camera, Scene and Renderer */
        this.camera = this.createCamera();
        this.scene = this.createScene();
        this.renderer = this.createRenderer();
        container.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, container);
        this.controls.target.set(0, 1.6, 0);
        this.controls.update();

        /*Initialising controllerModelFactory and handModelFactory from Three.js */
        const controllerModelFactory = new XRControllerModelFactory();
        const handModelFactory = new XRHandModelFactory().setPath(
            "/hand-models"
        );;

        /* Setting up Right Hand from POV */
        controllerRight = this.renderer.xr.getController(0);
        this.scene.add(controllerRight);
        controllerRightGrip = this.renderer.xr.getControllerGrip(0);
        controllerRightGrip.add(controllerModelFactory.createControllerModel(controllerRightGrip));
        this.scene.add(controllerRightGrip);

        this.rightHand = this.renderer.xr.getHand(0);
        this.rightHand.add(handModelFactory.createHandModel(this.rightHand));
        this.scene.add(this.rightHand);

        /* Setting up Left Hand from POV */
        controllerLeft = this.renderer.xr.getController(1);
        this.scene.add(controllerLeft);
        controllerLeftGrip = this.renderer.xr.getControllerGrip(1);
        controllerLeftGrip.add(controllerModelFactory.createControllerModel(controllerLeftGrip));
        this.scene.add(controllerLeftGrip);

        this.leftHand = this.renderer.xr.getHand(1);
        this.leftHand.add(handModelFactory.createHandModel(this.leftHand));
        this.scene.add(this.leftHand);

        this.session;
        this.renderer.xr.addEventListener("sessionstart", (event) => {
            this.session = this.renderer.xr.getSession();

        });
        this.renderer.xr.addEventListener("sessionend", (event) => {
            this.session = null;
        });

        this.addLight();

        const geometry = new THREE.SphereBufferGeometry(0.4, 30, 30);
        const material = new THREE.MeshStandardMaterial({ color: 0xfdffbf });

        this.sphere = new THREE.Mesh(geometry, material);
        this.sphere.position.set(0, 0.6, -0.45);

        this.scene.add(this.sphere)

        const room = new THREE.LineSegments(
            new BoxLineGeometry(6, 6, 6, 10, 10, 10),
            new THREE.LineBasicMaterial({
                color: "#151515",
            })
        );

        room.geometry.translate(0, 3, 0);

        this.scene.add(room);

        this.setupVR();

        this.renderer.setAnimationLoop(this.render.bind(this));
        window.addEventListener('resize', this.resize.bind(this));

    }

    getHandVisibilityStatus() {
        // if (this.session) {
        //     for (let i = 0; i < this.session.inputSources.length; i++) {
        //         if (this.session.inputSources[i].hand) {
        //             let wrist = this.session.inputSources[i].hand.get("wrist");
        //             if (!wrist) {
        //                 return;
        //             }
        //             // let wristPose = getJointPose(wrist, this.renderer.referenceSpace);
        //         }
        //     }
        // }
        if (this.session) {
            for (const inputSource of this.session.inputSources) {
                if (inputSource.hand) {
                    let name = inputSource.handedness;
                    let theHand;
                    if (name === 'right'){
                        theHand = this.rightHand;
                        let indexTip = theHand.joints['index-finger-tip'];
                        this.checkTouch(indexTip, name)
                    } else {
                        theHand = this.leftHand;
                        let indexTip = theHand.joints['index-finger-tip'];
                        this.checkTouch(indexTip, name)
                    }
                }
            }
        }
    }
    checkTouch( indexTip, hand) {
        // let diffX = Math.abs(indexTip.position.x - thumbTip.position.x)
        // let diffY = Math.abs(indexTip.position.y - thumbTip.position.y)
        // let diffZ = Math.abs(indexTip.position.z - thumbTip.position.z)
        // if (diffX!=0 || diffY!=0 || diffZ!=0){// When hands are not seen, the diffs initialize at zeroes. Stops once hands are seen.
        //     if (diffX < 0.02 && diffY < 0.02 && diffZ < 0.02) {
        //         console.log(diffX, diffY, diffZ)
        //         console.log(hand + "PINCHING")
        //         let geometryPinch = new THREE.SphereBufferGeometry(0.01, 30, 30);
        //         let materialPinch = new THREE.MeshStandardMaterial({ color: 0xfdffbf });
    
        //         let spherePinch = new THREE.Mesh(geometryPinch, materialPinch);
        //         spherePinch.position.set(indexTip.position.x, indexTip.position.y, indexTip.position.z);
        //         this.scene.add(spherePinch);
        //     }
        // }
        
        const distance = indexTip.getWorldPosition(tmpVector1).distanceTo(this.sphere.getWorldPosition(tmpVector2));
        if (distance < this.sphere.geometry.boundingSphere.radius * this.sphere.scale.x) {

            console.log('Touch')
            if(hand == 'right'){
                this.sphere.material.color.setHex( 0x00ffaa );
            }
            if(hand == 'left'){
                this.sphere.material.color.setHex( 0xb983de );
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
