import * as THREE from "three";

import Toolbar from "./Toolbar";
import GlassLayer from "./GlassLayer";

class MediaLayer {
    constructor(
        layer,
        rotateXAngle,
        video,
        session,
        renderer,
        toolbarPositionConfig
    ) {
        this.videoLayer = layer;
        this.video = video;
        this.session = session;
        this.renderer = renderer;

        this.toolbar = this.createToolbar(rotateXAngle, toolbarPositionConfig);

        this.glassLayer = this.createGlassLayer();
    }

    get objects() {
        return this.toolbar.objects;
    }

    get toolbarGroup() {
        return this.toolbar.toolbarGroup;
    }

    createGlassLayer() {
        const glass = new GlassLayer(this.renderer);
        return glass;
    }

    createToolbar(rotateXAngle, positionConfig) {
        const toolbar = new Toolbar(
            this.renderer,
            this.video,
            rotateXAngle,
            positionConfig
        );
        return toolbar;
    }

    move() {}

    resize() {}

    update(intersections) {
        this.toolbar.update(intersections);
    }

    updateOnRender(isXRPresenting) {
        const position = this.videoLayer.transform.position;
        this.toolbar.updateOnRender(isXRPresenting);
    }
}

export default MediaLayer;
