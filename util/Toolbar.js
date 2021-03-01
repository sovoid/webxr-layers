import * as THREE from "three";

import { CanvasUI } from "../../util/CanvasUI";

class Toolbar {
    constructor(renderer, videoIn, isAngled) {
        this._renderer = renderer;

        this._video = videoIn;

        // Buttons and Panel
        this._ui = this.createUI(2, 0.5, 128, { x: 0, y: -1, z: -3 });

        // Progress Bar
        this._progressBar = this.createProgressBar();

        // Toolbar Group
        // prettier-ignore
        this._toolbarGroup = this.createToolbarGroup(isAngled, {x: 0, y: 1.6, z: -2});
    }

    get objects() {
        return [this._ui.mesh, ...this._progressBar.children];
    }

    get toolbar() {
        return this._toolbarGroup;
    }

    get video() {
        return this._video;
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

    updateUI() {
        this._ui.update();
    }

    /**
     * Creates a toolbar with playback controls
     */
    createUI(panelWidth, panelHeight, height, { x, y, z }) {
        const onRestart = () => {
            this._video.currentTime = 0;
        };

        const onSkip = (val) => {
            this._video.currentTime += val;
        };

        const onPlayPause = () => {
            const paused = this._video.paused;
            console.log(paused);

            if (paused) {
                this._video.play();
            } else {
                this._video.pause();
            }

            const label = paused ? "||" : "►";
            this._ui.updateElement("pause", label);
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
            panelSize: { width: panelWidth, height: panelHeight },
            opacity: 1,
            height: height,
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
            renderer: this._renderer,
        };

        const content = {
            prev: "<path>M 10 32 L 54 10 L 54 54 Z</path>",
            pause: "||",
            next: "<path>M 54 32 L 10 10 L 10 54 Z</path>",
            restart: "Restart",
        };

        const ui = new CanvasUI(content, config);
        ui.mesh.position.set(x, y, z);

        return ui;
    }

    createProgressBar() {
        const barGroup = new THREE.Group();

        const bgBarGeometry = new THREE.PlaneGeometry(1, 0.1);
        const bgBarMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const bgBarMesh = new THREE.Mesh(bgBarGeometry, bgBarMaterial);

        const barGeometry = new THREE.PlaneGeometry(1, 0.1);
        const barMaterial = new THREE.MeshBasicMaterial({ color: 0xff031b });
        const barMesh = new THREE.Mesh(barGeometry, barMaterial);

        const { x, y, z } = this._ui.mesh.position;
        barMesh.name = `red progress bar`;
        barGroup.add(barMesh);
        bgBarMesh.name = "white progress bar";
        barGroup.add(bgBarMesh);
        barGroup.position.set(x, y + 0.3, z);

        return barGroup;
    }

    updateProgressBar() {
        const redProgressBar = this._progressBar.getObjectByName(
            "red progress bar"
        );
        const whiteProgressBar = this._progressBar.getObjectByName(
            "white progress bar"
        );

        const progress = (this._video.currentTime / this._video.duration) * 2;
        redProgressBar.scale.set(progress, 1, 1);
        const redOffset = (2 - progress) / 2;
        redProgressBar.position.x = -redOffset;
        redProgressBar.position.needsUpdate = true;

        whiteProgressBar.scale.set(2 - progress, 1, 1);
        const whiteOffset = progress / 2;
        whiteProgressBar.position.x = whiteOffset;
        whiteProgressBar.position.needsUpdate = true;
    }

    createToolbarGroup(isAngled, { x, y, z }) {
        const toolbarGroup = new THREE.Group();
        toolbarGroup.add(this._ui.mesh);
        toolbarGroup.add(this._progressBar);

        toolbarGroup.position.set(x, y, z);
        if (isAngled) {
            toolbarGroup.rotateX(-Math.PI / 4);
        }

        return toolbarGroup;
    }

    setVideoCurrentTime(xPosition) {
        // Set video playback position
        const timeFraction = (xPosition + 1) / 2;
        this._video.currentTime = timeFraction * this._video.duration;
    }
}

export default Toolbar;
