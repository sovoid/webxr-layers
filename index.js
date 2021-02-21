import {
    ControllerInterraction,
    SimpleEquidirectMediaLayer,
    SimpleScene,
} from "./apps";

document.addEventListener("DOMContentLoaded", () => {
    let app;

    switch (window.location.pathname) {
        case "/controller-interraction":
            app = new ControllerInterraction();
            break;
        case "/simple-equidirect-layer":
            app = new SimpleEquidirectMediaLayer();
            break;
        default:
            app = new SimpleScene();
    }
    window.app = app;
});
