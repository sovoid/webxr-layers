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

        const positionConfig = this.createPositionConfig(toolbarPositionConfig);
        this.toolbar = this.createToolbar(rotateXAngle, positionConfig);

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
        if (this.videoLayer instanceof XRQuadLayer) {
            const glass = new GlassLayer(this.videoLayer, this.renderer);
            return glass;
        }
    }

    createToolbar(rotateXAngle, positionConfig) {
        const toolbar = new Toolbar(
            this.videoLayer,
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
        this.toolbar.updateOnRender(isXRPresenting);
        if (this.glassLayer) {
            this.glassLayer.updateOnRender();
        }
    }

    createPositionConfig(toolbarPositionConfig) {
        const defaultToolbarPositionConfig = {
            ui: {
                panelWidth: 2,
                panelHeight: 0.5,
                height: 128,
                position: { x: 0, y: -1, z: -5 },
            },
            toolbarGroup: {
                position: {
                    x: this.videoLayer.transform.position.x,
                    y:
                        this.videoLayer.transform.position.y -
                        this.videoLayer.height,
                    z: this.videoLayer.transform.position.z + 0.05,
                },
            },
        };
        return toolbarPositionConfig
            ? toolbarPositionConfig
            : defaultToolbarPositionConfig;
    }
}

export default MediaLayer;
