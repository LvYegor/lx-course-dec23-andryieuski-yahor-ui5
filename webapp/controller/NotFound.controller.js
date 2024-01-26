sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("yahor.andryieuski.controller.NotFound", {
        onInit: function () {
            this.oRouter = this.getOwnerComponent().getRouter();
        },

        onLinkPress: function () {
            this.oRouter.navTo("StoresOverview");
        }
    });
});
