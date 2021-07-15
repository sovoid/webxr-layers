import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

class App{
    constructor(){
		const container = document.createElement( 'div' );
		document.body.appendChild( container );

        this.camera = this.createCamera();
        this.scene = this.createScene();
        this.renderer = this.createRenderer();
        container.appendChild(this.renderer.domElement);

        this.addLight();

        const geometry = new THREE.SphereBufferGeometry(0.4, 30, 30);
        const material = new THREE.MeshStandardMaterial({ color: 0xfdffbf});

        const sphere = new THREE.Mesh(geometry, material);

        this.scene.add(sphere)

        const room = new THREE.LineSegments(
            new BoxLineGeometry(6, 6, 6, 10, 10, 10),
            new THREE.LineBasicMaterial({
                color: "#151515",
            })
        );

        this.scene.add(room)

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
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            100
        );
        camera.position.set(0, 0, 3);
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
        return renderer;
    }
    addLight(){
        const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 0.3);
		this.scene.add(ambient);
        const light = new THREE.DirectionalLight();
        light.position.set( 0.2, 1, 1);
        this.scene.add(light);
    }
    setupVR() {
        this.renderer.xr.enabled = true;
        document.body.appendChild(VRButton.createButton(this.renderer));
    }
}

export default App;