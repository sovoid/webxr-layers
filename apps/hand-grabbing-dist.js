
import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import { XRHandModelFactory } from 'three/examples/jsm/webxr/XRHandModelFactory.js';

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

        this.spheres = [];

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
        if (this.session) {
            for (const inputSource of this.session.inputSources) {
                if (inputSource.hand) {

                    let name = inputSource.handedness;
                    let theHand;
                    if (name === 'right'){
                        theHand = this.rightHand;
                        let indexTip = theHand.joints['index-finger-tip'];
                        let thumbTip = theHand.joints['thumb-tip'];
                        this.checkPinch(indexTip, thumbTip, name)
                    } else {
                        theHand = this.leftHand;
                        let indexTip = theHand.joints['index-finger-tip'];
                        let thumbTip = theHand.joints['thumb-tip'];
                        let middleFingerTip = theHand.joints['middle-finger-tip'];
                        let ringFingerTip = theHand.joints['ring-finger-tip'];
                        let pinkyFingerTip = theHand.joints['pinky-finger-tip'];
                        let fingerTips = [indexTip, thumbTip, middleFingerTip, pinkyFingerTip, ringFingerTip];
                        this.erase(fingerTips, name);
                    }

                    

                    // let leftIndexTip = this.leftHand.joints['index-finger-tip'];
                    // let leftThumbTip = this.leftHand.joints['thumb-tip'];
                    // this.checkPinch(leftThumbTip, leftIndexTip, 'LEFT')
                }
            }
        }
    }
    checkPinch(thumbTip, indexTip, hand) {
        let diffX = Math.abs(indexTip.position.x - thumbTip.position.x)
        let diffY = Math.abs(indexTip.position.y - thumbTip.position.y)
        let diffZ = Math.abs(indexTip.position.z - thumbTip.position.z)
        if (diffX!=0 || diffY!=0 || diffZ!=0){// When hands are not seen, the diffs initialize at zeroes. Stops once hands are seen.
            if (diffX < 0.02 && diffY < 0.02 && diffZ < 0.02) {
               if(hand=="right"){
                    console.log(diffX, diffY, diffZ);
                    console.log(hand + "draw");
                    //sphere to be "drawn"
                    let geometryPinch = new THREE.SphereBufferGeometry(0.01, 30, 30);
                    let materialPinch = new THREE.MeshStandardMaterial({ color: 0x000000 });
                    let spherePinch = new THREE.Mesh(geometryPinch, materialPinch);
                    spherePinch.position.set(indexTip.position.x, indexTip.position.y, indexTip.position.z);
                    this.spheres.push(spherePinch);
                    this.scene.add(spherePinch);
               } 
            }
        }
    }

    erase(fingerTips, hand){
        if(hand=="left"){
            for (var i = 0; i < fingerTips.length; i++) {
                const sphereInProximity = this.checkProximity(fingerTips[i]);
                if(sphereInProximity) {
                    this.currentSphere = sphereInProximity;
                    this.scene.remove(sphereInProximity);
                }   
            }
       }
    }

    checkProximity(indexTip){
        for(let i = 0; i< this.spheres.length; i++){
            const sphere = this.spheres[ i ];
            var dx = indexTip.position.x - sphere.position.x; 
            var dy = indexTip.position.y - sphere.position.y; 
            var dz = indexTip.position.z - sphere.position.z; 
            const distance = Math.sqrt(dx*dx+dy*dy+dz*dz);
            if(distance <= 0.04 ){
                console.log("move");
                return sphere;
            } 
        }
        return null;
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
