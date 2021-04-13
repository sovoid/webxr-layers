import * as THREE from "three";

export default class GlassLayer {
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
        const glassGeometry = new THREE.PlaneGeometry(1, 1); // to scale
        const glassMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.5, // test
        });
        const glass = new THREE.Mesh(glassGeometry, glassMaterial);

        glass.scale.set(2 * width, 2 * height, 1);
        glass.position.set(x, y, z + 0.01);
        return glass;
    }

    move({ x, y, z }) {
        this.glassObject.position.set(x, y, z);
        this.glassObject.position.needsUpdate = true;
    }

    updatePosition() {
        const position = new THREE.Vector3();
        const quaternion = new THREE.Quaternion();

        this.glassObject.getWorldPosition(position);
        this.glassObject.getWorldQuaternion(quaternion);

        const { x, y, z } = position;
        this.layer.transform = new XRRigidTransform(
            {
                x,
                y,
                z,
                w: 1.0,
            },
            quaternion
        );
    }

    updateDimensions({ width, height }) {
        this.glassObject.scale.set(2 * width, 2 * height, 1);
    }

    /**
     * Updates position and quaternion of glass layer when quad video layer is moved
     */
    updateOrientation(position, quaternion) {
        // update position x, y, z
        this.glassObject.position.set(position.x, position.y, position.z);
        // update quaternion (3d heading and orientation)
        this.glassObject.quaternion.copy(quaternion);
    }

    updateOnRender() {
        this.updateDimensions(this.layer);
        this.updatePosition();
    }

    move() {
        this.updateOrientation(
            this.layer.transform.position,
            this.layer.transform.orientation
        );
    }
}
