
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
        this.plasmaBalls = []; //eject-plase-buffer

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
                        let indexFinger = theHand.joints['index-finger-tip'];
                        let pinkyFinger = theHand.joints['pinky-finger-tip'];
                        //console.log("MFMC: " + JSON.stringify(middleFingerMetaCarpal, null, 4))
                        this.checkSpidermanPose(middleFingerTip, ringFingerTip, indexFingerMetaCarpal, middleFingerMetaCarpal, ringFingerMetaCarpal, indexFinger, pinkyFinger);
                    } 
                    else if (name === 'left'){
                        theHand = this.leftHand;
                        let middleFingerTip = theHand.joints['middle-finger-tip'];
                        let ringFingerTip = theHand.joints['ring-finger-tip'];
                        let indexFingerMetaCarpal = theHand.joints['index-finger-metacarpal']
                        let middleFingerMetaCarpal = theHand.joints['middle-finger-metacarpal']
                        let ringFingerMetaCarpal = theHand.joints['ring-finger-metacarpal']
                        let indexFinger = theHand.joints['index-finger-tip'];
                        let pinkyFinger = theHand.joints['pinky-finger-tip'];
                        this.checkSpidermanPose(middleFingerTip, ringFingerTip, indexFingerMetaCarpal, middleFingerMetaCarpal, ringFingerMetaCarpal, indexFinger, pinkyFinger);

                    }
                    else{
                        console.log('Hands not being tracked...')
                    }
                }
            }
        }
    }

    checkSpidermanPose(middleFingerTip, ringFingerTip, indexFingerMetaCarpal, middleFingerMetaCarpal, ringFingerMetaCarpal, indexFinger, pinkyFinger){
        /*Calculate the distance between the tip of the middle finger and tip of the ring finger */
        let diffMidRingX = Math.abs(middleFingerTip.position.x - ringFingerTip.position.x)
        let diffMidRingY = Math.abs(middleFingerTip.position.y - ringFingerTip.position.y)
        let diffMidRingZ = Math.abs(middleFingerTip.position.z - ringFingerTip.position.z)

        if(diffMidRingX!=0 || diffMidRingY || diffMidRingZ!=0 )
        {
            if(diffMidRingX <= 0.02  && diffMidRingY <= 0.02 && diffMidRingZ<=0.02){
                //fingers are touching, check distance of each finger from respective carpel
                //console.log("MF Car: " + middleFingerMetaCarpal.position.x +  " " + middleFingerMetaCarpal.position.y + " " + middleFingerMetaCarpal.position.z);
                //console.log("RF Car: " + ringFingerMetaCarpal.position.x +  " " + ringFingerMetaCarpal.position.y + " " + ringFingerMetaCarpal.position.z);
                let diffMidCarpalX = Math.abs(middleFingerTip.position.x - middleFingerMetaCarpal.position.x)
                let diffMidCarpalY = Math.abs(middleFingerTip.position.y - middleFingerMetaCarpal.position.y)
                let diffMidCarpalZ = Math.abs(middleFingerTip.position.z - middleFingerMetaCarpal.position.z)

                let diffRingCarpalX = Math.abs(ringFingerTip.position.x - ringFingerMetaCarpal.position.x)
                let diffRingCarpalY = Math.abs(ringFingerTip.position.x - ringFingerMetaCarpal.position.x)
                let diffRingCarpalZ = Math.abs(ringFingerTip.position.x - ringFingerMetaCarpal.position.x)

               // console.log("MiddFinger: " + diffMidCarpalX + diffMidCarpalY + diffMidCarpalZ);
                //console.log("Ring Finger: " + diffRingCarpalX + diffRingCarpalY + diffRingCarpalZ);
                if(diffRingCarpalX <=0.02 && diffRingCarpalY <=0.05 && diffRingCarpalZ<=0.02){
                    if( diffMidCarpalX<=0.02 && diffMidCarpalY <=0.05 && diffMidCarpalZ<=0.02){
                        console.log("Spidey Pose Detected");
                        this.spiderManPoseActive = true;
                        this.spidey(indexFinger, pinkyFinger);
                    } else {
                        this.spiderManPoseActive = false;
                        // for (let i = 0; i < this.plasmaBalls; i++) {
                        //     this.scene.remove(this.plasmaBalls[i]);
                        //     this.plasmaBalls = this.spheres.filter(item => item !== this.spheres[i])
                        // }
                    }  
                } else {
                    this.spiderManPoseActive = false;
                }
            }
        }

    }
    

    spidey(indexFinger, pinkyFinger){
        console.log("inside spidey func");
        const geometryR = new THREE.SphereBufferGeometry(0.01, 30, 30);
        const materialR = new THREE.MeshStandardMaterial({color: 0x4e5354});
        const plasmaBall = new THREE.Mesh(geometryR, materialR);
        plasmaBall.position.set(((indexFinger.position.x + pinkyFinger.position.x) / 2), indexFinger.position.y, indexFinger.position.z);// start position - the tip of the indexFinger
        plasmaBall.quaternion.copy(this.camera.quaternion); // apply camera's quaternion
        this.scene.add(plasmaBall);
        this.plasmaBalls.push(plasmaBall); 
    }

    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
        this.getHandVisibilityStatus();
        if(this.plasmaBalls.length>0 && this.spiderManPoseActive == true){
            console.log("ejecting");
            this.plasmaBalls.forEach(b => {
                console.log(b);
                b.translateZ(-0.05); // move along the local z-axis
            });

        }
        else{
            this.plasmaBalls.forEach(b => {
                this.scene.remove(b);
            });
            this.plasmaBalls = []
        }   
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
