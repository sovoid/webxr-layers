import * as THREE from "three";
import Toolbar from "./Toolbar";

export class GlassLayer {
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
        this.glassObject.position.x = x;
        this.glassObject.position.y = y;
        this.glassObject.position.z = z;
        this.glassObject.position.needsUpdate = true;
    }

    updateDimensions({ width, height }) {
        this.glassObject.scale.set(2 * width, 2 * height, 1);
    }

    /**
     * Updates position and quaternion of glass layer when quad video layer is moved
     */
    updateOrientation(position, quaternion) {
        // update position x, y, z
        const { x, y, z } = position;
        this.glassObject.position.x = x;
        this.glassObject.position.y = y;
        this.glassObject.position.z = z;

        // update quaternion (3d heading and orientation)
        this.glassObject.quaternion.copy(quaternion);
    }

    updateOnRender() {
        this.updateDimensions(this.layer);
    }

    move() {
        this.updateOrientation(
            this.layer.transform.position,
            this.layer.transform.orientation
        );
    }
}

export class MediaLayer {
    constructor(layer, video, session, renderer, uiConfig, toolbarGroupConfig) {
        this.layer = layer;
        this.video = video;
        this.session = session;
        this.renderer = renderer;

        this.glassLayer = this.createGlassLayer();

        const toolbarConfig = this.createPositionConfig(toolbarGroupConfig);
        this.toolbar = this.createToolbar(uiConfig, toolbarConfig);
    }

    get objects() {
        if (this.glassLayer) {
            return [...this.toolbar.objects, this.glassLayer.object];
        }
        return this.toolbar.objects;
    }

    get toolbarGroup() {
        return this.toolbar.toolbarGroup;
    }

    get glass() {
        if (this.glassLayer) {
            return this.glassLayer.object;
        }
    }

    createGlassLayer() {
        if (this.layer instanceof XRQuadLayer) {
            const glass = new GlassLayer(this.layer, this.renderer);
            return glass;
        }
    }

    createToolbar(uiConfig, toolbarGroupConfig) {
        const toolbar = new Toolbar(
            this.layer,
            this.renderer,
            this.video,
            {
                uiConfig,
                toolbarGroupConfig,
            },
        );
        return toolbar;
    }

    update(intersections) {
        this.toolbar.update(intersections);
    }

    updatePosition(glassObject) {
        const position = new THREE.Vector3();
        const quaternion = new THREE.Quaternion();

        glassObject.getWorldPosition(position);
        glassObject.getWorldQuaternion(quaternion);

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
        this.toolbar.updateOnRender(!!this.glassLayer);

        if (this.glassLayer) {
            this.toolbar.updateOnRender(true);
            this.glassLayer.updateOnRender();

            const glassObject = this.glassLayer.object;
            this.updatePosition(glassObject);
        }
    }

    createPositionConfig(toolbarGroupConfig) {
        const { x, y, z } = this.layer.transform.position;
        const defaultToolbarGroupConfig = {
            rotateXAngle: 0,
            position: {
                x: x,
                y: y - this.layer.height / 2,
                z: z + 0.05,
            },
        };

        return (toolbarGroupConfig || defaultToolbarGroupConfig);
    }
}

class MediaLayerManager {
    constructor(session, renderer) {
        this.session = session;
        this.renderer = renderer;
        this.mediaFactory = this.createMediaFactory();
    }

    static get QUAD_LAYER() {
        return "QUAD_LAYER";
    }

    static get EQUIRECT_LAYER() {
        return "EQUIRECT_LAYER";
    }

    /**
     * Create a media factory used to create layers
     */
    createMediaFactory() {
        const mediaFactory = new XRMediaBinding(this.session);
        return mediaFactory;
    }

    async createMediaLayer(
        video,
        layerType,
        options,
        uiConfig,
        toolbarGroupConfig
    ) {
        const layer = await this.createLayer(video, layerType, options);
        return new MediaLayer(
            layer,
            video,
            this.session,
            this.renderer,
            uiConfig,
            toolbarGroupConfig
        );
    }

    /**
     *
     * @param {Object} video
     * @param {string} layerType One of "QUAD_LAYER", "EQUIRECT_LAYER"
     * @param {Object} options Options to initialize layer created
     */
    async createLayer(video, layerType, options) {
        // Check if layerType is valid
        if (layerType !== "QUAD_LAYER" && layerType !== "EQUIRECT_LAYER") {
            throw new Error(
                `Invalid layer type: layer type must be one of "QUAD_LAYER" || "EQUIRECT_LAYER"`
            );
        } else {
            let layer;

            // Get reference space from the session
            const refSpace = await this.session.requestReferenceSpace("local");

            // Create a layer based on the layer type
            switch (layerType) {
                case "QUAD_LAYER":
                    layer = this.mediaFactory.createQuadLayer(video, {
                        space: refSpace,
                        ...options,
                    });
                    break;
                case "EQUIRECT_LAYER":
                    layer = this.mediaFactory.createEquirectLayer(video, {
                        space: refSpace,
                        ...options,
                    });
                    break;
            }

            return layer;
        }
    }
}

export default MediaLayerManager;
