sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, JSONModel, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("yahor.andryieuski.controller.StoreDetails", {
        onInit: function () {
            this.oRouter = this.getOwnerComponent().getRouter();

            const oViewModel = new JSONModel();

            this.getView().setModel(oViewModel, "appView");
            this.oRouter.getRoute("StoreDetails").attachPatternMatched(this.onPatternMatched, this);
        },

        onPatternMatched: function (oEvent) {
            const that = this;
            const mRouteArguments = oEvent.getParameter("arguments");
            const sStoreID = mRouteArguments.storeID;
            const oODataModel = this.getView().getModel("odata");
            const oViewModel = this.getView().getModel("appView");

            oODataModel.metadataLoaded().then(function () {
                const sKey = oODataModel.createKey("/Stores", { id: sStoreID });
                const aStatuses = ['ALL', 'OK', 'STORAGE', 'OUT_OF_STOCK'];
                
                that.getView().bindObject({
                    path: sKey,
                    model: "odata"
                });
                
                that.getView().getModel("odata").read(`${sKey}/rel_Products/$count`, {
                    success: function (oData) {
                        oViewModel.setProperty("/all", oData);
                    }
                });

                aStatuses.slice(1).forEach(function (sStatus) {
                    that.getView().getModel("odata").read(`${sKey}/rel_Products/$count`, {
                        filters: [new Filter("Status", FilterOperator.EQ, sStatus)],
                        success: function(oData) {
                            oViewModel.setProperty("/" + sStatus.toLowerCase(), oData);
                        }
                    });
                });
            });

        },

        onStoresListBreadcrumbPress: function (oEvent) {
			this.oRouter.navTo("StoresOverview");
		},

        onStoreDetailsBreadcrumbPress: function (oEvent) {
            const oCtx = oEvent.getSource().getBindingContext("odata");

            this.oRouter.navTo("StoreDetails", {
                storeID: oCtx.getProperty("id")
            });
        }, 

        onProductItemPress: function (oEvent) {
            const oCtx = oEvent.getSource().getBindingContext("odata");
            
            this.oRouter.navTo("ProductDetails", {
                productID: oCtx.getProperty("id")
            });
        }
    });
});
