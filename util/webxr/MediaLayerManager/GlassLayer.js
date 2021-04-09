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

    updateDimensions({ width, height }) {
        this.glassObject.scale.set(2 * width, 2 * height, 1);
    }

    /**
     * Updates position and quaternion of glass layer objects when quad video layer is moved
     */
    updateOrientation(position, quaternion) {
        const { x, y, z } = position;
        // update position x, y, z
        this.glassObject.position.set(x, y, z);
        // update quaternion (3d heading and orientation)
        this.glassObject.quaternion.copy(quaternion);
    }

    /**
     * Updates position and quaternion of media layer when glass layer is moved
     */
    updateLayerOrientation(position, quaternion) {
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

    updateOnRender() {
        this.updateDimensions(this.layer);

        const position = new THREE.Vector3();
        const quaternion = new THREE.Quaternion();
        this.glassObject.getWorldPosition(position);
        this.glassObject.getWorldQuaternion(quaternion);
        this.updateLayerOrientation(position, quaternion);
    }

    move() {
        this.updateOrientation(
            this.layer.transform.position,
            this.layer.transform.orientation
        );
    }
}
