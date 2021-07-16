import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import { XRHandModelFactory } from 'three/examples/jsm/webxr/XRHandModelFactory.js';

class App{
    constructor(){
		const container = document.createElement( 'div' );
		document.body.appendChild( container );

        let hand1, hand2;
        let controller1, controller2;
        let controllerGrip1, controllerGrip2;

        this.camera = this.createCamera();
        this.scene = this.createScene();
        this.renderer = this.createRenderer();
        container.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls( this.camera, container );
        this.controls.target.set( 0, 1.6, 0 );
        this.controls.update();
        controller1 = this.renderer.xr.getController( 0 );
        this.scene.add( controller1 );
        controller2 = this.renderer.xr.getController( 1 );
        this.scene.add( controller2 );
        const controllerModelFactory = new XRControllerModelFactory();
        const handModelFactory = new XRHandModelFactory();
        controllerGrip1 = this.renderer.xr.getControllerGrip( 0 );
        controllerGrip1.add( controllerModelFactory.createControllerModel( controllerGrip1 ) );
        this.scene.add( controllerGrip1 );

        hand1 = this.renderer.xr.getHand( 0 );
        hand1.add( handModelFactory.createHandModel( hand1 ) );

        this.scene.add( hand1 );

        // Hand 2
        controllerGrip2 = this.renderer.xr.getControllerGrip( 1 );
        controllerGrip2.add( controllerModelFactory.createControllerModel( controllerGrip2 ) );
        this.scene.add( controllerGrip2 );

        hand2 = this.renderer.xr.getHand( 1 );
        hand2.add( handModelFactory.createHandModel( hand2 ) );
        this.scene.add( hand2 );

        const g1 = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, - 1 ) ] );

        const line = new THREE.Line( g1 );
        line.name = 'line';
        line.scale.z = 5;

        controller1.add( line.clone() );
        controller2.add( line.clone() );

        this.addLight();

        const geometry = new THREE.SphereBufferGeometry(0.4, 30, 30);
        const material = new THREE.MeshStandardMaterial({ color: 0xfdffbf});

        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(0, 0.6, -1.5);

        this.scene.add(sphere)

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
        scene.background = new THREE.Color( 0xbbddff );
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