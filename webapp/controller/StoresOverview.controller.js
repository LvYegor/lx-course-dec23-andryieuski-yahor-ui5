sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("yahor.andryieuski.controller.StoresOverview", {
		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
		},

		onStoresListBreadcrumbPress: function () {
			this.oRouter.navTo("StoresOverview");
		},

		onStoresListItemPress: function (oEvent) {
			const oCtx = oEvent.getSource().getBindingContext("odata");

			this.oRouter.navTo("StoreDetails", {
				storeID: oCtx.getProperty("id")
			});
		}
	});
});
