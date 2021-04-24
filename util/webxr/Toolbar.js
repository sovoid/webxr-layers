import * as THREE from "three";

import { CanvasUI } from "../CanvasUI";
const RESIZE_HANDLE_THICKNESS = 0.05;
const MIN_LAYER_WIDTH = 0.5;
const MAX_LAYER_WIDTH = 10;

class Toolbar {
    constructor(layer, renderer, video, options) {
        this.layer = layer;
        this.renderer = renderer;
        this.video = video;

        const { uiConfig, toolbarGroupConfig } = options;

        this.uiWidth = uiConfig.panelWidth;
        this.uiHeight = uiConfig.panelHeight;

        // Buttons and Panel
        this.ui = this.createUI(uiConfig);

        // Progress Bar
        this.progressBar = this.createProgressBar();

        // Resize Handle
        this.resizeHandle = this.createResizeHandle();
        this.resizeHandleClone = null;

        // Toolbar Group
        this.toolbarGroup = this.createToolbarGroup(toolbarGroupConfig);
    }

    get objects() {
        return [this.ui.mesh, ...this.progressBar.children, this.resizeHandle];
    }

    createResizeHandle() {
        const handleGeometry = new THREE.PlaneGeometry(1, 1); // to scale
        const handleMaterial = new THREE.MeshBasicMaterial({ color: "white" });

        // bottom handle
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.scale.set(this.layer.width, RESIZE_HANDLE_THICKNESS, 1);
        const { x, y, z } = this.ui.mesh.position;
        handle.position.set(x, y - this.uiHeight, z);

        handle.name = "resizeHandle";
        return handle;
    }

    createProgressBar() {
        const barGroup = new THREE.Group();

        const bgBarGeometry = new THREE.PlaneGeometry(1, this.uiHeight / 5);
        const bgBarMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const bgBarMesh = new THREE.Mesh(bgBarGeometry, bgBarMaterial);
        bgBarMesh.name = "whiteProgressBar";

        const barGeometry = new THREE.PlaneGeometry(1, this.uiHeight / 5);
        const barMaterial = new THREE.MeshBasicMaterial({ color: 0xff031b });
        const barMesh = new THREE.Mesh(barGeometry, barMaterial);
        barMesh.name = "redProgressBar";

        barGroup.add(barMesh);
        barGroup.add(bgBarMesh);

        const { x, y, z } = this.ui.mesh.position;
        barGroup.position.set(x, y + (3 / 5) * this.uiHeight, z);

        return barGroup;
    }

    createToolbarGroup(toolbarGroupConfig) {
        const toolbarGroup = new THREE.Group();
        toolbarGroup.add(this.ui.mesh);
        toolbarGroup.add(this.progressBar);
        toolbarGroup.add(this.resizeHandle);

        const { x, y, z } = toolbarGroupConfig.position;
        toolbarGroup.position.set(x, y, z);
        toolbarGroup.rotateX(toolbarGroupConfig.rotateXAngle);

        return toolbarGroup;
    }

    /**
     * Creates a toolbar with playback controls
     */
    createUI(uiConfig) {
        const onRestart = () => {
            this.video.currentTime = 0;
        };

        const onSkip = (val) => {
            this.video.currentTime += val;
        };

        const onPlayPause = () => {
            const paused = this.video.paused;

            if (paused) {
                this.video.play();
            } else {
                this.video.pause();
            }

            const label = paused ? "||" : "►";
            this.ui.updateElement("pause", label);
        };

        const onExpand = () => {
            this.layer.width *= 1.25;
            this.layer.height *= 1.25;
        };

        const onCompress = () => {
            this.layer.width /= 1.25;
            this.layer.height /= 1.25;
        };

        const colors = {
            blue: {
                light: "#1bf",
                lighter: "#3df",
            },
            red: "#f00",
            white: "#fff",
            yellow: {
                bright: "#ff0",
                dark: "#bb0",
            },
            black: "#000",
        };

        const config = {
            panelSize: {
                width: uiConfig.panelWidth,
                height: uiConfig.panelHeight,
            },
            opacity: 1,
            height: uiConfig.height,
            prev: {
                type: "button",
                position: { top: 32, left: 0 },
                width: 64,
                fontColor: colors.yellow.dark,
                hover: colors.yellow.bright,
                onSelect: () => onSkip(-5),
            },
            pause: {
                type: "button",
                position: { top: 35, left: 64 },
                width: 96,
                height: 52,
                fontColor: colors.white,
                backgroundColor: colors.red,
                hover: colors.yellow.bright,
                onSelect: onPlayPause,
            },
            next: {
                type: "button",
                position: { top: 32, left: 160 },
                width: 64,
                fontColor: colors.yellow.dark,
                hover: colors.yellow.bright,
                onSelect: () => onSkip(5),
            },
            expand: {
                type: "button",
                position: { top: 35, right: 200 },
                width: 32,
                height: 52,
                fontColor: colors.black,
                backgroundColor: colors.blue.light,
                hover: colors.blue.lighter,
                onSelect: onExpand,
            },
            compress: {
                type: "button",
                position: { top: 35, right: 240 },
                width: 32,
                height: 52,
                fontColor: colors.black,
                backgroundColor: colors.blue.light,
                hover: colors.blue.lighter,
                onSelect: onCompress,
            },
            restart: {
                type: "button",
                position: { top: 35, right: 10 },
                width: 150,
                height: 52,
                fontColor: colors.black,
                backgroundColor: colors.blue.light,
                hover: colors.blue.lighter,
                onSelect: onRestart,
            },
            renderer: this.renderer,
        };

        const content = {
            prev: "<path>M 10 32 L 54 10 L 54 54 Z</path>",
            pause: "||",
            next: "<path>M 54 32 L 10 10 L 10 54 Z</path>",
            expand: "E",
            compress: "C",
            restart: "Restart",
        };

        const ui = new CanvasUI(content, config);
        const { x, y, z } = uiConfig.position;
        ui.mesh.position.set(x, y, z);

        return ui;
    }

    setVideoCurrentTime(intersection) {
        const barFraction = intersection.uv.x;
        let timeFraction;

        if (intersection.object.name === "whiteProgressBar") {
            // clicked shrinking white bar
            const whiteBarWidth = intersection.object.scale.x;
            const redBarWidth = this.uiWidth - whiteBarWidth;
            timeFraction =
                (barFraction * whiteBarWidth + redBarWidth) / this.uiWidth;
        } else if (intersection.object.name === "redProgressBar") {
            // clicked growing red bar
            const redBarWidth = intersection.object.scale.x;
            timeFraction = (barFraction * redBarWidth) / this.uiWidth;
        }

        // Set video playback position
        this.video.currentTime = timeFraction * this.video.duration;
    }

    update(intersections) {
        const intersectionWithProgressBar = intersections.find(
            ({ object: { name } }) =>
                name === "whiteProgressBar" || name === "redProgressBar"
        );

        if (intersectionWithProgressBar) {
            this.setVideoCurrentTime(intersectionWithProgressBar);
            this.updateProgressBar();
        }
    }

    updateOnRender(hasGlassLayer) {
        if (this.toolbarGroup) {
            this.updateUI();
        }

        if (this.video) {
            this.updateProgressBar();
        }

        this.updateResizeHandle();

        if (hasGlassLayer) {
            this.updateOrientation(
                this.layer.transform.position,
                this.layer.transform.orientation
            );
        }

        this.fluidResize();
    }

    /**
     * Updates position and quaternion of toolbar when quad video layer is moved
     */
    updateOrientation(position, quaternion) {
        // update positions x, y, z
        const { x, y, z } = position;
        this.toolbarGroup.position.x = x;
        this.toolbarGroup.position.y = y - this.layer.height / 2;
        this.toolbarGroup.position.z = z + 0.05;

        // update quaternion (3d heading and orientation)
        this.toolbarGroup.quaternion.copy(quaternion);

        this.toolbarGroup.position.needsUpdate = true;
        this.toolbarGroup.quaternion.needsUpdate = true;
    }

    updateResizeHandle() {
        this.resizeHandle.scale.set(
            this.layer.width,
            RESIZE_HANDLE_THICKNESS,
            1
        );
    }

    /**
     * Store the resizeHandle's position at the moment of engaging fluid resizing.
     * Currently uses the resizeHandle itself, but intend to use a transparent clone
     * of the resizeHandle to handle the engage/disengage, while keeping the actual
     * visible resizeHandle "fixed" at the same position as the layer is resized.
     */
    engageResize(controller) {
        const { x, y, z } = this.resizeHandle.position;
        const pointGeometry = new THREE.PlaneGeometry(0.1, 0.1);

        this.handleLeftPoint = new THREE.Points(pointGeometry);
        this.handleLeftPoint.position.set(x - this.layer.width / 2, y, z);
        this.handleRightPoint = new THREE.Points(pointGeometry);
        this.handleRightPoint.position.set(x + this.layer.width / 2, y, z);

        this.resizeHandleClone = this.resizeHandle.clone();
        this.resizeHandleClone.name = "resizeHandleClone";

        const engagePosition = new THREE.Vector3();
        // world position necessary
        this.resizeHandleClone.getWorldPosition(engagePosition);
        controller.attach(this.resizeHandleClone);
        this.resizeHandleClone.userData.engageResizePosition = engagePosition;
    }

    fluidResize() {
        if (
            !this.resizeHandleClone ||
            !this.resizeHandleClone.userData.engageResizePosition
        ) {
            return;
        }

        const engagePosition = this.resizeHandleClone.userData
            .engageResizePosition;
        const currPosition = new THREE.Vector3();
        this.resizeHandleClone.getWorldPosition(currPosition);
        // absolute euclidean distance
        const distanceEtoCurr = engagePosition.distanceTo(currPosition);

        const handleLeftPosition = new THREE.Vector3();
        const handleRightPosition = new THREE.Vector3();
        this.handleLeftPoint.getWorldPosition(handleLeftPosition);
        this.handleRightPoint.getWorldPosition(handleRightPosition);

        // console.log("handle left", handleLeftPosition);
        // console.log("handle right", handleRightPosition);
        // console.log("curr position", currPosition);

        const distanceLtoCurr = handleLeftPosition.distanceTo(currPosition);
        const distanceRtoCurr = handleRightPosition.distanceTo(currPosition);
        // console.log("dist to left", distanceLtoCurr);
        // console.log("dist to right", distanceRtoCurr);
        // console.log(distanceRtoCurr < distanceLtoCurr ? "expand" : "compress");
        const sign = distanceRtoCurr < distanceLtoCurr ? 1 : -1;

        const resizeFactor =
            1 + (sign * distanceEtoCurr * 0.01) / this.layer.width;

        // hack
        if (this.layer.width <= MIN_LAYER_WIDTH) {
            this.layer.width *= 1.001;
            this.layer.height *= 1.001;
        } else if (this.layer.width >= MAX_LAYER_WIDTH) {
            this.layer.width *= 0.999;
            this.layer.height *= 0.999;
        } else {
            this.layer.width *= resizeFactor;
            this.layer.height *= resizeFactor;
        }
    }

    disengageResize(controller) {
        this.resizeHandleClone.userData.engageResizePosition = null;
        controller.remove(this.resizeHandleClone);
    }

    /**
     * Updates progress bar as video plays
     */
    updateProgressBar() {
        const redProgressBar = this.progressBar.getObjectByName(
            "redProgressBar"
        );
        const whiteProgressBar = this.progressBar.getObjectByName(
            "whiteProgressBar"
        );

        const progress =
            (this.video.currentTime / this.video.duration) * this.uiWidth;
        const redOffset = (this.uiWidth - progress) / 2;
        const whiteOffset = progress / 2;

        redProgressBar.scale.set(progress, 1, 1);
        redProgressBar.position.x = -redOffset;
        redProgressBar.position.needsUpdate = true;

        whiteProgressBar.scale.set(this.uiWidth - progress, 1, 1);
        whiteProgressBar.position.x = whiteOffset;
        whiteProgressBar.position.needsUpdate = true;
    }

    /**
     * Updates Toolbar CanvasUI
     */
    updateUI() {
        this.ui.update();
    }
}

export default Toolbar;
