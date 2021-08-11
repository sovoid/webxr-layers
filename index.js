import {
    ControllerInteraction,
    HandInput,
    SimpleScene,
    SimpleEquirectMediaLayer,
    MultipleLayers,
    SimpleHands,
    HandDrawing,
    HandGrabbing,
    HandGrabbingDist,
    HandWebXR,
    ResizeObject
} from "./apps";

document.addEventListener("DOMContentLoaded", () => {
    let app;

    switch (window.location.pathname) {
        case "/controller-interaction":
            app = new ControllerInteraction();
            break;
        case "/hand-input":
            app = new HandInput();
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
        case "/webxrHandInput":
            app = new SimpleHands();
            break;
        case "/handDrawing":
            app = new HandDrawing();
            break;
        case "/handGrabbing":
            app = new HandGrabbing();
            break;
        case "/handGrabbingDist":
            app = new HandGrabbingDist();
            break;
        case "/handWebXR":
            app = new HandWebXR();
            break;
        case "/resizeObject":
            app = new ResizeObject();
            break;
        default:
            const indexContainer = document.querySelector(".container");
            indexContainer.style.display = "";
    }

    if (app) {
        window.app = app;
    }
});
