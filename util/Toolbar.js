import * as THREE from "three";

import { CanvasUI } from "./CanvasUI";
class Toolbar {
    constructor(
        layer,
        glassLayer,
        renderer,
        video,
        uiConfig,
        toolbarGroupConfig
    ) {
        this.layer = layer;
        this.glassLayer = glassLayer;
        this.renderer = renderer;

        this.video = video;

        this.uiWidth = uiConfig.panelWidth;
        this.uiHeight = uiConfig.panelHeight;

        // Buttons and Panel
        this.ui = this.createUI(uiConfig);

        // Progress Bar
        this.progressBar = this.createProgressBar();

        // Toolbar Group
        this.toolbarGroup = this.createToolbarGroup(toolbarGroupConfig);
    }

    get objects() {
        return [this.ui.mesh, ...this.progressBar.children];
    }

    createProgressBar() {
        const barGroup = new THREE.Group();

        const bgBarGeometry = new THREE.PlaneGeometry(1, this.uiHeight / 5);
        const bgBarMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const bgBarMesh = new THREE.Mesh(bgBarGeometry, bgBarMaterial);
        bgBarMesh.name = "white progress bar";

        const barGeometry = new THREE.PlaneGeometry(1, this.uiHeight / 5);
        const barMaterial = new THREE.MeshBasicMaterial({ color: 0xff031b });
        const barMesh = new THREE.Mesh(barGeometry, barMaterial);
        barMesh.name = "red progress bar";

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
                width: 128,
                height: 52,
                fontColor: colors.white,
                backgroundColor: colors.red,
                hover: colors.yellow.bright,
                onSelect: onPlayPause,
            },
            next: {
                type: "button",
                position: { top: 32, left: 192 },
                width: 64,
                fontColor: colors.yellow.dark,
                hover: colors.yellow.bright,
                onSelect: () => onSkip(5),
            },
            restart: {
                type: "button",
                position: { top: 35, right: 10 },
                width: 200,
                height: 52,
                fontColor: colors.white,
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
            restart: "Restart",
        };

        const ui = new CanvasUI(content, config);
        const { x, y, z } = uiConfig.position;
        ui.mesh.position.set(x, y, z);

        return ui;
    }

    setVideoCurrentTime(xPosition) {
        // Set video playback position
        const timeFraction = (xPosition + 1) / 2;
        this.video.currentTime = timeFraction * this.video.duration;
    }

    update(intersections) {
        const intersectionWithProgressBar = intersections.find(
            ({ object: { name } }) =>
                name === "white progress bar" || name === "red progress bar"
        );

        if (intersectionWithProgressBar) {
            this.setVideoCurrentTime(intersectionWithProgressBar.point.x);
            this.updateProgressBar();
        }
    }

    /**
     * Updates position and quaternion of toolbar when quad video layer is moved
     */
    updateOrientation(layer) {
        // update positions x, y, z
        const { x, y, z } = layer.transform.position;
        this.toolbarGroup.position.x = x;
        this.toolbarGroup.position.y = y;
        this.toolbarGroup.position.z = z + 0.05;

        // update quaternion (3d heading and orientation)
        this.toolbarGroup.quaternion.copy(layer.transform.orientation);

        this.toolbarGroup.position.needsUpdate = true;
        this.toolbarGroup.quaternion.needsUpdate = true;
    }

    updateOnRender() {
        if (this.toolbarGroup) {
            this.updateUI();
        }
        if (this.video) {
            this.updateProgressBar();
        }
        if (this.glassLayer) {
            this.updateOrientation(this.layer);
        }
    }

    updateProgressBar() {
        const redProgressBar = this.progressBar.getObjectByName(
            "red progress bar"
        );
        const whiteProgressBar = this.progressBar.getObjectByName(
            "white progress bar"
        );

        const progress =
            (this.video.currentTime / this.video.duration) * this.uiWidth;
        redProgressBar.scale.set(progress, 1, 1);
        const redOffset = (this.uiWidth - progress) / 2;
        redProgressBar.position.x = -redOffset;
        redProgressBar.position.needsUpdate = true;

        whiteProgressBar.scale.set(this.uiWidth - progress, 1, 1);
        const whiteOffset = progress / 2;
        whiteProgressBar.position.x = whiteOffset;
        whiteProgressBar.position.needsUpdate = true;
    }

    updateUI() {
        this.ui.update();
    }
}

export default Toolbar;
