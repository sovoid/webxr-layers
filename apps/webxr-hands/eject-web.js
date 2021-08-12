
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

        //this.midAndThumbReady = false;
        //this.didSnap = false;
        this.spiderManPoseActive = false;
        this.leftPinch = false;

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
                    if (name === 'right'){
                        theHand = this.rightHand;
                        let middleFingerTip = theHand.joints['middle-finger-tip'];
                        let ringFingerTip = theHand.joints['ring-finger-tip'];
                        let indexFingerMetaCarpal = theHand.joints['index-finger-metacarpal'];
                        let middleFingerMetaCarpal = theHand.joints['middle-finger-metacarpal'];
                        let ringFingerMetaCarpal = theHand.joints['ring-finger-metacarpal'];
                        this.checkSpidermanPose(middleFingerTip, ringFingerTip, indexFingerMetaCarpal, middleFingerMetaCarpal, ringFingerMetaCarpal);
                    } 
                    else if (name === 'left'){
                        theHand = this.leftHand;
                        let middleFingerTip = theHand.joints['middle-finger-tip'];
                        let ringFingerTip = theHand.joints['ring-finger-tip'];
                        let indexFingerMetaCarpal = theHand.joints['index-finger-metacarpal']
                        let middleFingerMetaCarpal = theHand.joints['middle-finger-metacarpal']
                        let ringFingerMetaCarpal = theHand.joints['ring-finger-metacarpal']
                        this.checkSpidermanPose(middleFingerTip, ringFingerTip, indexFingerMetaCarpal, middleFingerMetaCarpal, ringFingerMetaCarpal);

                    }
                    else{
                        console.log('Hands not being tracked...')
                    }
                }
            }
        }
    }

    checkSpidermanPose(middleFingerTip, ringFingerTip, indexFingerMetaCarpal, middleFingerMetaCarpal, ringFingerMetaCarpal){
        /*Calculate the distance between the tip of the middle finger and tip of the ring finger */
        let diffMidRingX = Math.abs(middleFingerTip.position.x - ringFingerTip.position.x)
        let diffMidRingY = Math.abs(middleFingerTip.position.y - ringFingerTip.position.y)
        let diffMidRingZ = Math.abs(middleFingerTip.position.z - ringFingerTip.position.z)

        if(diffMidRingX == 0  && diffMidRingY == 0 && diffMidRingZ==0){
            //fingers are touching, check distance of each finger from respective carpel
            let diffMidCarpalX = Math.abs(middleFingerTip.position.x - middleFingerMetaCarpal.position.x)
            let diffMidCarpalY = Math.abs(middleFingerTip.position.y - middleFingerMetaCarpal.position.y)
            let diffMidCarpalZ = Math.abs(middleFingerTip.position.z - middleFingerMetaCarpal.position.z)

            let diffRingCarpalX = Math.abs(ringFingerTip.position.x - ringFingerMetaCarpal.position.x)
            let diffRingCarpalY = Math.abs(ringFingerTip.position.x - ringFingerMetaCarpal.position.x)
            let diffRingCarpalZ = Math.abs(ringFingerTip.position.x - ringFingerMetaCarpal.position.x)

           // console.log("MiddFinger: " + diffMidCarpalX + diffMidCarpalY + diffMidCarpalZ);
            //console.log("Ring Finger: " + diffRingCarpalX + diffRingCarpalY + diffRingCarpalZ);
            if(diffRingCarpalX ==0 && diffRingCarpalY ==0 && diffRingCarpalZ==0){
                if( diffMidCarpalX==0 && diffMidCarpalY ==0 && diffMidCarpalZ==0){
                    console.log("Spidey Pose Detected");
                    this.spiderManPoseActive = true;
                } else {
                    this.spiderManPoseActive = false;
                } 
            } else {
                this.spiderManPoseActive = false;
            }

            if(this.spiderManPoseActive == true){
                console.log("eject stuff now");
            } else {
                console.log("cannot eject anything")
            }

        }

    }
    checkSnap(middleTip, thumbTip, metaCarpal, hand) {
        // Calculate the distance between positions of Middle Tip and Thumb Tip
        let diffMidThumbX = Math.abs(middleTip.position.x - thumbTip.position.x)
        let diffMidThumbY = Math.abs(middleTip.position.y - thumbTip.position.y)
        let diffMidThumbZ = Math.abs(middleTip.position.z - thumbTip.position.z)

        // Calculate the distance between positions of Middle Tip and Meta Carpal
        let diffMidCarpalX = Math.abs(middleTip.position.x - metaCarpal.position.x)
        let diffMidCarpalY = Math.abs(middleTip.position.y - metaCarpal.position.y)
        let diffMidCarpalZ = Math.abs(middleTip.position.z - metaCarpal.position.z)

        if (diffMidThumbX!=0 || diffMidThumbY!=0 || diffMidThumbZ!=0){
            // When hands are not seen, the diffs initialize at zeroes. Stops once hands are seen.
            if (diffMidThumbX < 0.02 && diffMidThumbY < 0.02 && diffMidThumbZ < 0.02) {
                this.midAndThumbReady = true;
                console.log('Mid Thumb Ready...')
            }
            // else{
            //     this.midAndThumbReady = false;
            // }
        }

        if (this.midAndThumbReady == true){
            if (diffMidCarpalX < 0.05 && diffMidCarpalY < 0.05 && diffMidCarpalZ < 0.05) {
                this.didSnap = this.didSnap != true ? true : false;
                if (this.didSnap == true){
                    console.log('Snapped...')
                    this.thanos()
                    this.midAndThumbReady = false
                }
            }
        }
    }

    thanos(){
        let spheresToDelete = Math.round(this.spheres.length / 2);
        for (let i = 0; i < spheresToDelete; i++) {
            console.log(i)
            this.scene.remove(this.spheres[i]);
            this.spheres = this.spheres.filter(item => item !== this.spheres[i])
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
