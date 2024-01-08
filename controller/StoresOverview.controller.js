sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("yahor.andryieuski.controller.StoresOverview", {
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		},

		onSecondPageButtonPress: function () {
			this.oRouter.navTo("SecondPage");
		}
	});
});
