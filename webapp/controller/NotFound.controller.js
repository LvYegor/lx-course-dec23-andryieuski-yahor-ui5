/**
 * Controller for the NotFound page.
 * @author Yahor Andryieuski
 * @namespace yahor.andryieuski.controller.NotFound
 * @extends sap.ui.core.mvc.Controller
 */
sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("yahor.andryieuski.controller.NotFound", {

        /**
         * Called when the controller is instantiated.
         *
         * @function
         * @name yahor.andryieuski.controller.NotFound#onInit
         * @memberof yahor.andryieuski.controller.NotFound
         * @public
         * @returns {void}
         */
        onInit: function () {
            this.oRouter = this.getOwnerComponent().getRouter();
        },

        /**
         * Event handler for link press.
         * Navigates to StoresOverview page.
         *
         * @function
         * @name yahor.andryieuski.controller.NotFound#onLinkPress
         * @memberof yahor.andryieuski.controller.NotFound
         * @public
         * @returns {void}
         */
        onLinkPress: function () {
            this.oRouter.navTo("StoresOverview");
        }
    });
});
