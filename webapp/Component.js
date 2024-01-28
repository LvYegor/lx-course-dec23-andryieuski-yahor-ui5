/**
 * UI Component for managing application initialization and routing.
 * Extends the UIComponent class.
 *
 * @class yahor.andryieuski.Component
 * @extends sap.ui.core.UIComponent
 */
sap.ui.define([
    "sap/ui/core/UIComponent"
], function (UIComponent) {
    "use strict";

    return UIComponent.extend("yahor.andryieuski.Component", {

        /**
         * Component metadata including manifest information.
         * @name yahor.andryieuski.Component#metadata
         * @memberof yahor.andryieuski.Component
         * @property {Object} metadata - Component metadata object.
         * @property {string} metadata.manifest - Path to the manifest file in JSON format.
         */
        metadata: {
            manifest: "json"
        },

        /**
         * Initializes the component.
         *
         * @function
         * @name yahor.andryieuski.Component#init
         * @memberof yahor.andryieuski.Component
         * @public
         */
        init: function () {
            UIComponent.prototype.init.apply(this, arguments);

            this.getRouter().initialize();
        }
    });
});