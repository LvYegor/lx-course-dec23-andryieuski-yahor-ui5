sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("yahor.andryieuski.controller.StoreDetails", {
        onInit: function () {
            this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        },

        onFirstPageButtonPress: function () {
            this.oRouter.navTo("FirstPage");
        },

        onThirdPageButtonPress: function () {
            this.oRouter.navTo("ThirdPage");
        },
    });
});
