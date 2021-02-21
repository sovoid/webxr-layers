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
        case "/simple-scene":
            app = new SimpleScene();
            break;
        default:
            const indexContainer = document.querySelector(".container");
            indexContainer.style.display = "";
    }

    if (app) {
        window.app = app;
    }
});
