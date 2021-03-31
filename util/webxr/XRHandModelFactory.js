import { Object3D, Quaternion } from "three/build/three.module.js";

import { XRHandPrimitiveModel } from "three/examples/jsm/webxr/XRHandPrimitiveModel.js";

import { XRHandOculusMeshModel } from "three/examples/jsm/webxr/XRHandOculusMeshModel.js";

function XRHandModel(controller) {
    Object3D.call(this);

    this.controller = controller;
    this.motionController = null;
    this.envMap = null;

    this.mesh = null;
}

XRHandModel.prototype = Object.assign(Object.create(Object3D.prototype), {
    constructor: XRHandModel,

    // updateMatrixWorld: function ( force ) {

    // 	Object3D.prototype.updateMatrixWorld.call( this, force );

    // 	if ( this.motionController ) {

    // 		this.motionController.updateMesh();

    // 	}

    // },

    /**
     * Polls data from the XRInputSource and updates the model's components to match
     * the real world data
     */
    updateMatrixWorld: function (force) {
        Object3D.prototype.updateMatrixWorld.call(this, force);

        if (!this.motionController) return;

        // Cause the MotionController to poll the Gamepad for data
        this.motionController.updateFromGamepad();

        // Update the 3D model to reflect the button, thumbstick, and touchpad state
        Object.values(this.motionController.components).forEach((component) => {
            // Update node data based on the visual responses' current states
            Object.values(component.visualResponses).forEach(
                (visualResponse) => {
                    const {
                        valueNode,
                        minNode,
                        maxNode,
                        value,
                        valueNodeProperty,
                    } = visualResponse;

                    // Skip if the visual response node is not found. No error is needed,
                    // because it will have been reported at load time.
                    if (!valueNode) return;

                    // Calculate the new properties based on the weight supplied
                    if (
                        valueNodeProperty ===
                        MotionControllerConstants.VisualResponseProperty
                            .VISIBILITY
                    ) {
                        valueNode.visible = value;
                    } else if (
                        valueNodeProperty ===
                        MotionControllerConstants.VisualResponseProperty
                            .TRANSFORM
                    ) {
                        Quaternion.slerp(
                            minNode.quaternion,
                            maxNode.quaternion,
                            valueNode.quaternion,
                            value
                        );

                        valueNode.position.lerpVectors(
                            minNode.position,
                            maxNode.position,
                            value
                        );
                    }
                }
            );
        });
    },
});

const XRHandModelFactory = (function () {
    function XRHandModelFactory() {
        this.path = "";
    }

    XRHandModelFactory.prototype = {
        constructor: XRHandModelFactory,

        setPath: function (path) {
            this.path = path;
            return this;
        },

        createHandModel: function (controller, profile, options) {
            const handModel = new XRHandModel(controller);

            controller.addEventListener("connected", (event) => {
                const xrInputSource = event.data;

                if (xrInputSource.hand && !handModel.motionController) {
                    handModel.visible = true;
                    handModel.xrInputSource = xrInputSource;

                    // @todo Detect profile if not provided
                    if (profile === undefined || profile === "spheres") {
                        handModel.motionController = new XRHandPrimitiveModel(
                            handModel,
                            controller,
                            this.path,
                            xrInputSource.handedness,
                            { primitive: "sphere" }
                        );
                    } else if (profile === "boxes") {
                        handModel.motionController = new XRHandPrimitiveModel(
                            handModel,
                            controller,
                            this.path,
                            xrInputSource.handedness,
                            { primitive: "box" }
                        );
                    } else if (profile === "oculus") {
                        handModel.motionController = new XRHandOculusMeshModel(
                            handModel,
                            controller,
                            this.path,
                            xrInputSource.handedness,
                            options
                        );
                    }
                }
            });

            controller.addEventListener("disconnected", () => {
                // handModel.motionController = null;
                // handModel.remove( scene );
                // scene = null;
            });

            return handModel;
        },
    };

    return XRHandModelFactory;
})();

export { XRHandModelFactory };
