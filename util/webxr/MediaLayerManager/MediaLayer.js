import GlassLayer from "./GlassLayer";
import Toolbar from "../Toolbar";

export default class MediaLayer {
    constructor(layer, video, session, renderer, uiConfig, toolbarGroupConfig) {
        this.layer = layer;
        this.video = video;
        this.session = session;
        this.renderer = renderer;

        this.glassLayer =
            this.layer instanceof XRQuadLayer ? this.createGlassLayer() : null;

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
        const glass = new GlassLayer(this.layer, this.renderer);
        return glass;
    }

    createToolbar(uiConfig, toolbarGroupConfig) {
        const toolbar = new Toolbar(this.layer, this.renderer, this.video, {
            uiConfig,
            toolbarGroupConfig,
        });

        return toolbar;
    }

    update(intersections) {
        this.toolbar.update(intersections);
    }

    updateOnRender() {
        this.toolbar.updateOnRender(!!this.glassLayer);

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

        return toolbarGroupConfig || defaultToolbarGroupConfig;
    }
}
