import {
    ControllerInteraction,
    EquirectButtons,
    SimpleScene,
    SimpleEquirectMediaLayer,
    MultipleLayers,
} from "./apps";

document.addEventListener("DOMContentLoaded", () => {
    let app;

    switch (window.location.pathname) {
        case "/controller-interraction":
            app = new ControllerInteraction();
            break;
        case "/simple-scene":
            app = new SimpleScene();
            break;
        case "/simple-equirect-layer":
            app = new SimpleEquirectMediaLayer();
            break;
        case "/multiple-layers":
            app = new MultipleLayers();
            break;
        case "/equirect-buttons":
            app = new EquirectButtons();
            break;
        default:
            const indexContainer = document.querySelector(".container");
            indexContainer.style.display = "";
    }

    if (app) {
        window.app = app;
    }
});
