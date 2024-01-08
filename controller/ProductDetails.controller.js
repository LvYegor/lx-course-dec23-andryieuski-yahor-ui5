sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("yahor.andryieuski.controller.ProductDetails", {
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		},

		onFirstPageButtonPress: function () {
			this.oRouter.navTo("FirstPage");
		}
	});
});
