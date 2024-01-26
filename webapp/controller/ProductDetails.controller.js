sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/base/strings/formatMessage"
], function (Controller, JSONModel, Filter, FilterOperator, MessageBox, MessageToast, formatMessage) {
    "use strict";

    return Controller.extend("yahor.andryieuski.controller.ProductDetails", {
        onInit: function () {
            this.oRouter = this.getOwnerComponent().getRouter();

            const oViewModel = new JSONModel({
                ProductComments: null,
                ProductID: null
            });

            const oFeedModel = new JSONModel({
                Author: "",
                Message: "",
                Rating: 0,
                Posted: null,
                ProductId: null
            });

            this.getView().setModel(oViewModel, "appView");
            this.getView().setModel(oFeedModel, "feedModel");

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
                const sKey = oODataModel.createKey("/Products", {id: sProductID});

                that.getView().bindObject({
                    path: sKey,
                    model: "odata"
                });

                that.getView().getModel("odata").read(sKey, {
                    success: function (oData) {
                        that.changeStatusStyle(oData.Status);
                    }
                });

                that.filterCommentsByProductId();
            });
        },

        onStoresListBreadcrumbPress: function (oEvent) {
            this.oRouter.navTo("StoresOverview");
        },

        formatTitle: function (sProductDetails, sName) {
            return formatMessage("{0} ({1})", [sProductDetails, sName]);
        },

        onStoreDetailsBreadcrumbPress: function (oEvent) {
            const oCtx = oEvent.getSource().getBindingContext("odata");

            this.oRouter.navTo("StoreDetails", {
                storeID: oCtx.getProperty("StoreId")
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

        removeUnderscore: function (sStatus) {
            if (typeof sStatus === "string") {
                return sStatus.replace(/_/g, " ");
            }
            return sStatus;
        },

        filterCommentsByProductId: function () {
            const oViewModel = this.getView().getModel("appView");
            const nProductID = oViewModel.getProperty("/ProductID");

            this.getView().getModel("odata").read("/ProductComments", {
                success: function (oData) {
                    oViewModel.setProperty("/ProductComments", oData.results);
                },
                filters: [new Filter("ProductId", FilterOperator.EQ, nProductID)]
            });
        },

        onFeedPost: function (oEvent) {
            const oView = this.getView();
            const oBundle = oView.getModel("i18n").getResourceBundle();

            const aInputs = [
                this.byId("feedAuthor"),
                this.byId("feedRating"),
            ];

            let bValidationError = false;

            aInputs.forEach(function (oInput) {
                bValidationError = this._validateInput(oInput) || bValidationError;
            }, this);

            if (!bValidationError) {
                const oItem = oEvent.getSource();
                const oContext = oItem.getBindingContext("odata");

                const payload = {
                    Author: this.byId("feedAuthor").getValue(),
                    Message: this.byId("feedText").getValue(),
                    Rating: this.byId("feedRating").getValue(),
                    Posted: new Date(),
                    ProductId: oContext.getProperty("id")
                };

                this.getView().getModel("odata").create("/ProductComments", payload, {
                    success: this.filterCommentsByProductId()
                });

                this.resetFeedFields();

                const sFeedSendNotification = oBundle.getText("feedSendNotification");
                MessageToast.show(sFeedSendNotification);
            } else {
                const sFeedValidationAlert = oBundle.getText("feedValidationAlert");
                MessageBox.alert(sFeedValidationAlert);
            }
        },

        resetFeedFields: function () {
            this.byId("feedAuthor").setValue("");
            this.byId("feedRating").setValue(0);
            this.byId("feedText").setValue("");
        },

        _validateInput: function (oInput) {
            var bValidationError = false;
            var oBinding = oInput.getBinding("value");

            try {
                oBinding.getType().validateValue(oInput.getValue());
            } catch (oException) {
                bValidationError = true;
            }

            return bValidationError;
        },
    });
});
