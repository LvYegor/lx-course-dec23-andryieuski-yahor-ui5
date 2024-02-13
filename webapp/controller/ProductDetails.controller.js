/**
 * Controller for managing product details view.
 * @author Yahor Andryieuski
 * @namespace yahor.andryieuski.controller.ProductDetails
 * @extends sap.ui.core.mvc.Controller
 */
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/base/strings/formatMessage",
    "sap/base/i18n/Localization"
], function (Controller, JSONModel, Filter, FilterOperator, MessageBox, MessageToast, formatMessage, Localization) {
    "use strict";

    const oColorScheme = {OK: 8, STORAGE: 1, OUT_OF_STOCK: 3};

    return Controller.extend("yahor.andryieuski.controller.ProductDetails", {

        /**
         * Initializes the ProductDetails controller.
         *
         * This method is called when the controller is instantiated. It initializes the router,
         * creates JSONModels for managing the view data, sets models to the view, and attaches
         * a pattern matched event handler to the "ProductDetails" route.
         *
         * @function
         * @name yahor.andryieuski.controller.ProductDetails#onInit
         * @memberof yahor.andryieuski.controller.ProductDetails
         * @public
         * @returns {void}
         */
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

        /**
         * Handles the pattern matched event for the "ProductDetails" route.
         *
         * This method is called when the "ProductDetails" route pattern is matched. It retrieves
         * the product ID from the route arguments, sets the product ID property in the view model,
         * binds the view to the product data, reads product details from the OData model, and
         * filters comments based on the product ID.
         *
         * @function
         * @name yahor.andryieuski.controller.ProductDetails#onPatternMatched
         * @memberof yahor.andryieuski.controller.ProductDetails
         * @param {sap.ui.base.Event} oEvent The event object containing route arguments
         * @public
         * @returns {void}
         */
        onPatternMatched: function (oEvent) {
            const mRouteArguments = oEvent.getParameter("arguments");
            const sProductID = mRouteArguments.productID;
            const oODataModel = this.getView().getModel();
            const oViewModel = this.getView().getModel("appView");

            oViewModel.setProperty("/ProductID", sProductID);

            oODataModel.metadataLoaded().then(function () {
                const sKey = oODataModel.createKey("/Products", {id: sProductID});

                this.getView().bindObject({
                    path: sKey
                });

                this.getView().getModel().read(sKey, {
                    success: function (oData) {
                        this.changeStatusStyle(oData.Status);
                    }.bind(this)
                });

                this.filterCommentsByProductId();
            }.bind(this));
        },

        /**
         * Event handler for pressing the breadcrumb related to the stores list.
         *
         * This method is called when the breadcrumb related to the stores list is pressed.
         * It navigates the application to the "StoresOverview" route using the router.
         *
         * @function
         * @name yahor.andryieuski.controller.ProductDetails#onStoresListBreadcrumbPress
         * @memberof yahor.andryieuski.controller.ProductDetails
         * @param {sap.ui.base.Event} oEvent The event object
         * @public
         * @returns {void}
         */
        onStoresListBreadcrumbPress: function (oEvent) {
            this.oRouter.navTo("StoresOverview");
        },

        /**
         * Event handler for pressing the breadcrumb related to store details.
         *
         * This method is called when the breadcrumb related to store details is pressed.
         * It retrieves the binding context from the event source, extracts the store ID,
         * and navigates the application to the "StoreDetails" route with the specified store ID
         * using the router.
         *
         * @function
         * @name yahor.andryieuski.controller.ProductDetails#onStoreDetailsBreadcrumbPress
         * @memberof yahor.andryieuski.controller.ProductDetails
         * @param {sap.ui.base.Event} oEvent The event object
         * @public
         * @returns {void}
         */
        onStoreDetailsBreadcrumbPress: function (oEvent) {
            const oContext = oEvent.getSource().getBindingContext();

            this.oRouter.navTo("StoreDetails", {
                storeID: oContext.getProperty("StoreId")
            });
        },

        /**
         * Changes the status element color scheme based on the provided status.
         *
         * This method is responsible for updating the color scheme of the status element
         * based on the provided status. It retrieves the status element by ID, and sets its
         * color scheme based on the status value.
         *
         * @function
         * @name yahor.andryieuski.controller.ProductDetails#changeStatusStyle
         * @memberof yahor.andryieuski.controller.ProductDetails
         * @param {string} sStatus The status of the product
         * @public
         * @returns {void}
         */
        changeStatusStyle: function (sStatus) {
            const oStatusElement = this.byId("productStatus");

            if (sStatus === "OK") {
                oStatusElement.setColorScheme(oColorScheme.OK);
            } else if (sStatus === "STORAGE") {
                oStatusElement.setColorScheme(oColorScheme.STORAGE);
            } else if (sStatus === "OUT_OF_STOCK") {
                oStatusElement.setColorScheme(oColorScheme.OUT_OF_STOCK);
            }
        },

        /**
         * Formats the status text based on the provided status key.
         *
         * This method retrieves the status text from the resource bundle based on the provided status key.
         *
         * @function
         * @name yahor.andryieuski.controller.ProductDetails#formatStatus
         * @memberof yahor.andryieuski.controller.ProductDetails
         * @param {string} sStatus The key representing the status
         * @public
         * @returns {string} The formatted status text
         */
        formatStatus: function (sStatus) {
            const oBundle = this.getView().getModel("i18n").getResourceBundle();
            return oBundle.getText(sStatus);
        },

        /**
         * Filters comments based on the product ID.
         *
         * This method filters comments based on the product ID stored in the view model.
         * It retrieves the product ID from the view model, reads the comments associated
         * with the product from the OData model, and updates the view model with the filtered
         * comments.
         *
         * @function
         * @name yahor.andryieuski.controller.ProductDetails#filterCommentsByProductId
         * @memberof yahor.andryieuski.controller.ProductDetails
         * @public
         * @returns {void}
         */
        filterCommentsByProductId: function () {
            const oViewModel = this.getView().getModel("appView");
            const nProductID = oViewModel.getProperty("/ProductID");

            this.getView().getModel().read("/ProductComments", {
                success: function (oData) {
                    oViewModel.setProperty("/ProductComments", oData.results);
                },
                filters: [new Filter("ProductId", FilterOperator.EQ, nProductID)]
            });
        },

        /**
         * Event handler for posting a feed.
         *
         * This method is called when the user posts a feed. It validates the input fields,
         * creates a new feed item based on the user input, sends it to the backend service,
         * resets the input fields, and displays a success message or validation alert.
         *
         * @function
         * @name yahor.andryieuski.controller.ProductDetails#onFeedPost
         * @memberof yahor.andryieuski.controller.ProductDetails
         * @param {sap.ui.base.Event} oEvent The event object
         * @public
         * @returns {void}
         */
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
                const oContext = oItem.getBindingContext();
                const oModel = this.getView().getModel();

                const oPayload = {
                    Author: this.byId("feedAuthor").getValue(),
                    Message: this.byId("feedText").getValue(),
                    Rating: this.byId("feedRating").getValue(),
                    Posted: new Date(),
                    ProductId: oContext.getProperty("id")
                };

                const oNewCommentContext = oModel.createEntry("/ProductComments", {
                    properties: oPayload,
                    success: this.filterCommentsByProductId.bind(this)
                });

                oModel.submitChanges();

                this.resetFeedFields();

                const sFeedSendNotification = oBundle.getText("feedSendNotification");
                MessageToast.show(sFeedSendNotification);
            } else {
                const sFeedValidationAlert = oBundle.getText("feedValidationAlert");
                MessageBox.alert(sFeedValidationAlert);
            }
        },

        /**
         * Resets the input fields for posting a feed.
         *
         * This method clears the values of the input fields used for posting a feed.
         * It sets empty values for the author field, sets the rating field to 0, and clears
         * the text field for the feed message.
         *
         * @function
         * @name yahor.andryieuski.controller.ProductDetails#resetFeedFields
         * @memberof yahor.andryieuski.controller.ProductDetails
         * @public
         * @returns {void}
         */
        resetFeedFields: function () {
            this.byId("feedAuthor").setValue("");
            this.byId("feedRating").setValue(0);
            this.byId("feedText").setValue("");
        },

        /**
         * Validates the input value of a control.
         *
         * This method validates the input value of a control using its binding.
         * It attempts to validate the value of the input against its binding type.
         * If an exception occurs during validation, it sets a validation error flag.
         *
         * @function
         * @name yahor.andryieuski.controller.ProductDetails#_validateInput
         * @memberof yahor.andryieuski.controller.ProductDetails
         * @private
         * @param {sap.ui.core.Control} oInput The input control to be validated
         * @returns {boolean} A boolean indicating whether the input value is valid
         */
        _validateInput: function (oInput) {
            let bValidationError = false;
            let oBinding = oInput.getBinding("value");

            try {
                oBinding.getType().validateValue(oInput.getValue());
            } catch (oException) {
                bValidationError = true;
            }

            return bValidationError;
        },

        /**
         * Handles the language switch button press event.
         *
         * This method checks the current language and toggles it between English and Russian.
         * It uses the Localization module to set the language accordingly.
         *
         * @function
         * @name yahor.andryieuski.controller.ProductDetails#onSwitchLanguagePress
         * @memberof yahor.andryieuski.controller.ProductDetails
         * @public
         * @returns {void}
         */
        onSwitchLanguagePress: function () {
            if (Localization.getLanguage() === "en") {
                Localization.setLanguage("ru");
            } else {
                Localization.setLanguage("en");
            }
        }
    });
});
