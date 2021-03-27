import MediaLayer from "./MediaLayer";

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

    static get validLayerTypes() {
        return [this.EQUIRECT_LAYER, this.QUAD_LAYER];
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
        // If layer is invalid, throw an error
        if (!MediaLayerManager.validLayerTypes.includes(layerType)) {
            throw new Error(
                `Invalid layer type: layer type must be one of "QUAD_LAYER" || "EQUIRECT_LAYER"`
            );
        }

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

        return new MediaLayer(
            layer,
            video,
            this.session,
            this.renderer,
            uiConfig,
            toolbarGroupConfig
        );
    }
}

export default MediaLayerManager;
