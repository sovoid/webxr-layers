import * as THREE from "three";

class GlassLayer {
    constructor(layer, renderer) {
        this.layer = layer;
        this.renderer = renderer;

        this.glassObject = this.createGlassObject(this.layer);
    }

    get object() {
        return this.glassObject;
    }

    createGlassObject({
        width,
        height,
        transform: {
            position: { x, y, z },
        },
    }) {
        const planeGeometry = new THREE.PlaneGeometry(1, 1); // to scale
        const planeMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.5, // test
        });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);

        plane.scale.set(2 * width, 2 * height, 1);
        plane.position.set(x, y, z + 0.01);
        return plane;
    }

    move({ x, y, z }) {
        this.glassObject.position.x = x;
        this.glassObject.position.y = y;
        this.glassObject.position.z = z;
        this.glassObject.position.needsUpdate = true;
    }

    updateDimensions({ width, height }) {
        this.glassObject.scale.set(2 * width, 2 * height, 1);
    }

    updatePosition({
        transform: {
            position: { x, y, z },
        },
    }) {
        this.glassObject.position.x = x;
        this.glassObject.position.y = y;
        this.glassObject.position.z = z;
        this.glassObject.position.needsUpdate = true;
    }

    updateOnRender() {
        this.updateDimensions(this.layer);
        this.updatePosition(this.layer);
    }
}

export default GlassLayer;
