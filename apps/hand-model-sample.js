
import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import { XRHandModelFactory } from 'three/examples/jsm/webxr/XRHandModelFactory.js';

let App = class App{
    constructor(){
		const container = document.createElement( 'div' );
		document.body.appendChild( container );

        let controllerRight, controllerLeft;
        let controllerRightGrip, controllerLeftGrip;
        
        this.drawFlag = false;

        /*Creating Camera, Scene and Renderer */
        this.camera = this.createCamera();
        this.scene = this.createScene();
        this.renderer = this.createRenderer();
        container.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls( this.camera, container );
        this.controls.target.set( 0, 1.6, 0 );
        this.controls.update();

        /*Initialising controllerModelFactory and handModelFactory from Three.js */
        const controllerModelFactory = new XRControllerModelFactory();
        const handModelFactory = new XRHandModelFactory().setPath(
            "/hand-models"
        );; //not sure about setPath ~ trying to fetch .glb files for hand models

        /* Setting up Right Hand from POV */
        controllerRight = this.renderer.xr.getController( 0 );
        this.scene.add( controllerRight );
        controllerRightGrip = this.renderer.xr.getControllerGrip( 0 );
        controllerRightGrip.add( controllerModelFactory.createControllerModel( controllerRightGrip ) );
        this.scene.add( controllerRightGrip );

        this.rightHand = this.renderer.xr.getHand( 0 );
        this.rightHand.add( handModelFactory.createHandModel( this.rightHand) );
        this.scene.add( this.rightHand );
       
        /*Event Listeners for 'Pinch' detection in the Right Hand */
        // this.rightHand.addEventListener( 'pinchstart', this.onPinchStartRight);
        this.rightHand.addEventListener('pinchstart', (event) => {
            let timeStamp = new Date();
            let currentTimeStamp = timeStamp.getHours() + ":" + timeStamp.getMinutes() + ":" + timeStamp.getSeconds() + ":" + timeStamp.getMilliseconds();
            console.log("RightHand Pinch Started at: " + currentTimeStamp);
            const hand = event.target;
            const indexTip = hand.joints[ 'index-finger-tip' ];
            this.drawFlag = true;
            if(this.drawFlag == true){
                console.log("drawing - right hand");
                console.log("IndexTip RightHand Deets: " + JSON.stringify(indexTip, null, 4)); 

                console.log(indexTip.position)
                // var dotGeometry = new THREE.BufferGeometry();
                // //dotGeometry.setAttribute( 'position', new Float32BufferAttribute( new Vector3().toArray(), 3 ) );
                // //dotGeometry.vertices.push(new THREE.Vector3( 0, 0, 0));
                // var dotMaterial = new THREE.PointsMaterial( { size: 0.1 } );
                // const pixel = new THREE.Mesh( dotGeometry, dotMaterial );
                // pixel.position.copy( indexTip.position );
                // pixel.quaternion.copy( indexTip.quaternion );
                // this.scene.add( pixel );

                const geometry0 = new THREE.SphereBufferGeometry(0.4, 30, 30);
                const material0 = new THREE.MeshStandardMaterial({ color: 0xfdffbf});

                const sphere0 = new THREE.Mesh(geometry0, material0);
                sphere0.position.set(0, 0.6, -1.5);
                // sphere0.position.set(indexTip.position.x, indexTip.position.y, indexTip.position.x);

                this.scene.add(sphere0)
            }
            
        })
        this.rightHand.addEventListener( 'pinchend', this.onPinchEndRight);

        /* Setting up Left Hand from POV */
        controllerLeft = this.renderer.xr.getController( 1 );
        this.scene.add( controllerLeft );
        controllerLeftGrip = this.renderer.xr.getControllerGrip( 1 );
        controllerLeftGrip.add( controllerModelFactory.createControllerModel( controllerLeftGrip ) );
        this.scene.add( controllerLeftGrip );

        this.leftHand = this.renderer.xr.getHand( 1 );
        this.leftHand.add( handModelFactory.createHandModel( this.leftHand ) );
        this.scene.add( this.leftHand );

         /*Event Listeners for 'Pinch' detection in the Right Hand */
        this.leftHand.addEventListener( 'pinchstart', this.onPinchStartLeft);
        this.leftHand.addEventListener( 'pinchend', this.onPinchEndLeft);


        this.addLight();

        // const geometry = new THREE.SphereBufferGeometry(0.4, 30, 30);
        // const material = new THREE.MeshStandardMaterial({ color: 0xfdffbf});

        // const sphere = new THREE.Mesh(geometry, material);
        // sphere.position.set(0, 0.6, -1.5);

        // this.scene.add(sphere)

        const room = new THREE.LineSegments(
            new BoxLineGeometry(6, 6, 6, 10, 10, 10),
            new THREE.LineBasicMaterial({
                color: "#151515",
            })
        );

        room.geometry.translate(0,3,0);

        this.scene.add(room);
        

        const controls = new OrbitControls( this.camera, this.renderer.domElement );

        this.setupVR();
        
        this.renderer.setAnimationLoop(this.render.bind(this));
        window.addEventListener('resize', this.resize.bind(this) );
        
	}	

    onPinchStartRight(event) {
        let timeStamp = new Date();
        let currentTimeStamp = timeStamp.getHours() + ":" + timeStamp.getMinutes() + ":" + timeStamp.getSeconds() + ":" + timeStamp.getMilliseconds();
        console.log("RightHand Pinch Started at: " + currentTimeStamp);
        const hand = event.target;
        const indexTip = hand.joints[ 'index-finger-tip' ];
        this.drawFlag = true;
        if(this.drawFlag == true){
            console.log("drawing - right hand");
        }
        console.log("IndexTip RightHand Deets: " + JSON.stringify(indexTip, null, 4)); 
        // var dotGeometry = new THREE.BufferGeometry();
        // //dotGeometry.setAttribute( 'position', new Float32BufferAttribute( new Vector3().toArray(), 3 ) );
        // //dotGeometry.vertices.push(new THREE.Vector3( 0, 0, 0));
        // var dotMaterial = new THREE.PointsMaterial( { size: 0.1 } );
        // const pixel = new THREE.Mesh( dotGeometry, dotMaterial );
        // pixel.position.copy( indexTip.position );
        // pixel.quaternion.copy( indexTip.quaternion );
        // this.scene.add( pixel );


        
    
    }

    onPinchEndRight(event) {
        this.drawFlag = false;
        let timeStamp = new Date();
        let currentTimeStamp = timeStamp.getHours() + ":" + timeStamp.getMinutes() + ":" + timeStamp.getSeconds() + ":" + timeStamp.getMilliseconds();
        console.log("Righthand Pinch Ended at: " + currentTimeStamp);
        if(this.drawFlag == false) {
            console.log("stop drawing");
        }
    }

    onPinchStartLeft(event) {
        let timeStamp = new Date();
        let currentTimeStamp = timeStamp.getHours() + ":" + timeStamp.getMinutes() + ":" + timeStamp.getSeconds() + ":" + timeStamp.getMilliseconds();
        console.log("LeftHand Pinch Started at: " + currentTimeStamp);
        const hand = event.target;
        const indexTip = hand.joints[ 'index-finger-tip' ];
        //console.log("IndexTip RightHand Deets: " + JSON.stringify(indexTip, null, 4)); 
    }

    onPinchEndLeft(event) {
        let timeStamp = new Date();
        let currentTimeStamp = timeStamp.getHours() + ":" + timeStamp.getMinutes() + ":" + timeStamp.getSeconds() + ":" + timeStamp.getMilliseconds();
        console.log("LeftHand Pinch Ended at: " + currentTimeStamp);
    }
    
    resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );  
    }
	render() {   
        this.renderer.render(this.scene, this.camera);
    }

    createCamera(){
        const camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth/window.innerHeight,
            0.1,
            100
        );

        camera.position.set(0, 1.6, 3);
        return camera;
    }

    createScene() {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color( 0x808080 );
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

    addLight(){
        const ambient = new THREE.HemisphereLight(0x606060, 0x404040);
		this.scene.add(ambient);
        const light = new THREE.DirectionalLight(0xffffff);
        light.position.set(1,1,1).normalize();
        this.scene.add(light);
    }
    setupVR() {
        this.renderer.xr.enabled = true;
        document.body.appendChild(VRButton.createButton(this.renderer));
    }
}

export default App;


/* Attempts 
    // const geom = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, - 1 ) ] );
    // const line = new THREE.Line( g1 );
    // line.name = 'line';
    // line.scale.z = 5;
    // controller1.add( line.clone() );
    // controller2.add( line.clone() );

    // console.log(this.hand1.getWorldPosition());
    // this.scene.updateMatrixWorld(true);
    // var position = new THREE.Vector3();
    // console.log(this.hand1.getWorldPosition(position));
    // this.hand1.addEventListener( 'pinchend', function ( event ) {
    //     console.log("Pinched! - hand1" + JSON.stringify(hand1.getWorldPosition(position), null, 4));           
    //     console.log(hand1.matrixWorld.getPosition().x + ',' + hand1.matrixWorld.getPosition().y + ',' + hand1.matrixWorld.getPosition().z);
    //     console.log(hand1.getWorldPosition(position));
    //     // position.setFromMatrixPosition(hand1.MatrixWorld);
    //     // console.log(position.x + ',' + position.y + ',' + position.z);
    // } );
 */