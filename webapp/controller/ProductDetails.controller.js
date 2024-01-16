sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, JSONModel, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("yahor.andryieuski.controller.ProductDetails", {
		onInit: function() {
			this.oRouter = this.getOwnerComponent().getRouter();

			const oViewModel = new JSONModel({
				ProductComments: null,
				ProductID: null
			});
	  
			this.getView().setModel(oViewModel, "appView");

			this.oRouter.getRoute("ProductDetails").attachPatternMatched(this.onPatternMatched, this);
		},

		onPatternMatched: function (oEvent) {	
			const that = this;
            const mRouteArguments = oEvent.getParameter("arguments");
            const sProductID = mRouteArguments.productID;
            const oODataModel = this.getView().getModel("odata");
			const oViewModel = this.getView().getModel("appView");

			oViewModel.setProperty("/ProductID", sProductID);
			
			oODataModel.metadataLoaded().then(function () {
				const sKey = oODataModel.createKey("/Products", { id: sProductID });
				
				that.getView().bindObject({
					path: sKey,
					model: "odata"
				});

				that.getView().getModel("odata").read(sKey, {
					success: function(oData) {
						that.changeStatusStyle(oData.Status);
					}
				});

			  	that.filterCommentsByProductId();
			});
		},

		onStoresListBreadcrumbPress: function (oEvent) {
			this.oRouter.navTo("StoresOverview");
		},

        onStoreDetailsBreadcrumbPress: function (oEvent) {
            const oCtx = oEvent.getSource().getBindingContext("odata");

            this.oRouter.navTo("StoreDetails", {
                storeID: oCtx.getProperty("StoreId")
            });
        }, 

		onProductDetailsBreadcrumbPress: function (oEvent) {
			const oCtx = oEvent.getSource().getBindingContext("odata");

            this.oRouter.navTo("ProductDetails", {
                productID: oCtx.getProperty("id")
            });
		},

		changeStatusStyle: function (sStatus) {
			const statusElem = this.byId("productStatus");
			
			if (sStatus === "OK") {
			  	statusElem.setState("Success");
			} else if (sStatus === "STORAGE") {
			  	statusElem.setState("Warning");
			} else if (sStatus === "OUT_OF_STOCK") {
			  	statusElem.setState("Error");
			}
		},

		removeUnderscore: function(sStatus) {
			if (sStatus && typeof sStatus === "string") {
			   return sStatus.replace(/_/g, " ");
			}
			return sStatus;
		},

		filterCommentsByProductId: function () {
			const oViewModel = this.getView().getModel("appView");
			const nProductID = oViewModel.getProperty("/ProductID");
	
			this.getView().getModel("odata").read("/ProductComments", {
				success: function(oData) {
				  	oViewModel.setProperty("/ProductComments", oData.results);
				},
				filters: [new Filter("ProductId", FilterOperator.EQ, nProductID)]
			});
		}
	});
});
