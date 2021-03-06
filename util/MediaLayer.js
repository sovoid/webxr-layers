import Toolbar from "./Toolbar";
import GlassLayer from "./GlassLayer";

class MediaLayer {
    constructor(layer, rotateXAngle, video, session, renderer) {
        this.videoLayer = layer;
        this.video = video;
        this.session = session;
        this.renderer = renderer;

        this.toolbar = this.createToolbar(rotateXAngle);

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
    }

    createToolbar(rotateXAngle) {
        const toolbar = new Toolbar(this.renderer, this.video, rotateXAngle);
        return toolbar;
    }

    move() {}

    resize() {}

    update(intersections) {
        this.toolbar.update(intersections);
    }

    updateOnRender(isXRPresenting) {
        this.toolbar.updateOnRender(isXRPresenting);
    }
}

export default MediaLayer;
