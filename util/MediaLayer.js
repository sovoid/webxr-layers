import * as THREE from "three";

import Toolbar from "./Toolbar";
import GlassLayer from "./GlassLayer";
class MediaLayer {
    constructor(layer, video, session, renderer, uiConfig, toolbarGroupConfig) {
        this.layer = layer;
        this.video = video;
        this.session = session;
        this.renderer = renderer;

        const toolbarConfig = this.createPositionConfig(toolbarGroupConfig);
        this.toolbar = this.createToolbar(uiConfig, toolbarConfig);

        this.glassLayer = this.createGlassLayer();
    }

    get objects() {
        if (this.glassLayer) {
            // return [...this.toolbar.objects, this.glassLayer.object];
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
            uiConfig,
            toolbarGroupConfig
        );
        return toolbar;
    }

    move() {}

    resize() {}

    update(intersections) {
        this.toolbar.update(intersections);
    }

    updateOnRender() {
        this.toolbar.updateOnRender();
        if (this.glassLayer) {
            this.glassLayer.updateOnRender();
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
        return toolbarGroupConfig
            ? toolbarGroupConfig
            : defaultToolbarGroupConfig;
    }
}

export default MediaLayer;
