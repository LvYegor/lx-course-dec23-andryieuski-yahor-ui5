/**
 * Controller for managing the Stores Overview view.
 * @author Yahor Andryieuski
 * @namespace yahor.andryieuski.controller.StoresOverview
 * @extends sap.ui.core.mvc.Controller
 */
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/SimpleType",
    "sap/ui/model/ValidateException",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/format/DateFormat",
    "sap/ui/core/Fragment",
    "sap/ui/core/Messaging",
    "sap/base/i18n/Localization"
], function (Controller, Filter, FilterOperator, JSONModel, SimpleType, ValidateException, MessageBox, MessageToast, DateFormat, Fragment, Messaging, Localization) {
    "use strict";

    return Controller.extend("yahor.andryieuski.controller.StoresOverview", {

        /**
         * Initializes the StoresOverview controller.
         *
         * This method is called when the controller is instantiated. It initializes the router.
         *
         * @function
         * @name yahor.andryieuski.controller.StoresOverview#onInit
         * @memberof yahor.andryieuski.controller.StoresOverview
         * @public
         * @returns {void}
         */
        onInit: function () {
            this.oRouter = this.getOwnerComponent().getRouter();
        },

        /**
         * Handles the press event of a stores list item.
         * Navigates to the "StoreDetails" route with the corresponding store ID.
         *
         * @function
         * @name yahor.andryieuski.controller.StoresOverview#onStoresListItemPress
         * @memberof yahor.andryieuski.controller.StoresOverview
         * @param {sap.ui.base.Event} oEvent The event object
         * @public
         * @returns {void}
         */
        onStoresListItemPress: function (oEvent) {
            const oContext = oEvent.getSource().getBindingContext();

            this.oRouter.navTo("StoreDetails", {
                storeID: oContext.getProperty("id")
            });
        },

        /**
         * Handles the search event for filtering stores.
         * Filters the stores list based on the search query entered by the user.
         *
         * @function
         * @name yahor.andryieuski.controller.StoresOverview#onStoresSearch
         * @memberof yahor.andryieuski.controller.StoresOverview
         * @param {sap.ui.base.Event} oEvent The event object
         * @public
         * @returns {void}
         */
        onStoresSearch: function (oEvent) {
            const oStoresList = this.byId("storesListId");
            const oItemsBinding = oStoresList.getBinding("items");
            const sQuery = oEvent.getParameter("query");

            const oFilter = new Filter({
                filters: [
                    new Filter({
                        path: "Name",
                        operator: FilterOperator.Contains,
                        value1: sQuery
                    }),
                    new Filter({
                        path: "Address",
                        operator: FilterOperator.Contains,
                        value1: sQuery
                    }),
                    new Filter({
                        path: "FloorArea",
                        operator: FilterOperator.EQ,
                        value1: !isNaN(sQuery) ? sQuery : null
                    })
                ],
                and: false
            });

            oItemsBinding.filter(oFilter);
        },

        /**
         * Handles the creation of a new store.
         * Opens a dialog for creating a new store entry.
         *
         * @function
         * @name yahor.andryieuski.controller.StoresOverview#onCreateStorePress
         * @memberof yahor.andryieuski.controller.StoresOverview
         * @public
         * @returns {void}
         */
        onCreateStorePress: function () {
            const oView = this.getView();

            if (!this.oDialog) {
                this.pDialog = Fragment.load({
                    id: oView.getId(),
                    name: "yahor.andryieuski.view.fragments.CreateStoreDialog",
                    controller: this
                }).then((oDialog) => {
                    this.oDialog = oDialog;

                    oView.addDependent(this.oDialog);

                    Messaging.registerObject(oView.byId("createStoreName"), true);
                    Messaging.registerObject(oView.byId("createStoreEmail"), true);
                    Messaging.registerObject(oView.byId("createStorePhoneNumber"), true);
                    Messaging.registerObject(oView.byId("createStoreAddress"), true);
                    Messaging.registerObject(oView.byId("createStoreDate"), true);
                    Messaging.registerObject(oView.byId("createStoreFloorArea"), true);
                });
            }

            this.pDialog.then(() => {
                const oODataModel = oView.getModel();

                const oEntryContext = oODataModel.createEntry("/Stores");

                this.oDialog.setBindingContext(oEntryContext);

                this.oDialog.setModel(oODataModel);

                this.oDialog.open();
            });
        },

        /**
         * Validates the input value of a control.
         * Sets the value state of the control based on the validation result.
         *
         * @function
         * @name yahor.andryieuski.controller.StoresOverview#_validateInput
         * @memberof yahor.andryieuski.controller.StoresOverview
         * @param {sap.ui.core.Control} oInput - The input control to be validated.
         * @private
         * @returns {boolean} Indicates whether a validation error occurred.
         */
        _validateInput: function (oInput) {
            let sValueState = sap.ui.core.ValueState.None;
            let bValidationError = false;
            const oBinding = oInput.getBinding("value");

            try {
                oBinding.getType().validateValue(oInput.getValue());
            } catch (oException) {
                sValueState = sap.ui.core.ValueState.Error;
                bValidationError = true;
            }

            oInput.setValueState(sValueState);

            return bValidationError;
        },

        /**
         * Validates the presence of date input and sets the value state accordingly.
         *
         * @function
         * @name yahor.andryieuski.controller.StoresOverview#validateDateInputPresence
         * @memberof yahor.andryieuski.controller.StoresOverview
         * @param {sap.m.Input} oInput - The input field to validate.
         * @public
         * @returns {boolean} True if there is a validation error, false otherwise.
         */
        validateDateInputPresence: function (oInput) {
            let sValueState = sap.ui.core.ValueState.None;
            let bValidationError = false;

            const sValue = oInput.getValue();

            if (!sValue) {
                bValidationError = true;
                sValueState = sap.ui.core.ValueState.Error;
            }

            oInput.setValueState(sValueState);

            return bValidationError;
        },

        /**
         * Resets the value states of input fields.
         *
         * This method sets the value state of each input field to "None".
         *
         * @function
         * @name yahor.andryieuski.controller.StoresOverview#resetValueStates
         * @memberof yahor.andryieuski.controller.StoresOverview
         * @public
         * @returns {void}
         */
        resetValueStates: function () {
            const aInputs = [
                this.byId("createStoreName"),
                this.byId("createStoreEmail"),
                this.byId("createStorePhoneNumber"),
                this.byId("createStoreAddress"),
                this.byId("createStoreDate"),
                this.byId("createStoreFloorArea")
            ];

            aInputs.forEach(function (oInput) {
                oInput.setValueState(sap.ui.core.ValueState.None);
            }, this);

        },

        /**
         * Handles the change event of a form field.
         * Validates the input value of the field.
         *
         * @function
         * @name yahor.andryieuski.controller.StoresOverview#onFormFieldChange
         * @memberof yahor.andryieuski.controller.StoresOverview
         * @param {sap.ui.base.Event} oEvent - The event object.
         * @public
         * @returns {void}
         */
        onFormFieldChange: function (oEvent) {
            const oInput = oEvent.getSource();
            this._validateInput(oInput);
        },

        /**
         * Handles the change event of a date field.
         * Validates the input value of the date field.
         *
         * @function
         * @name yahor.andryieuski.controller.StoresOverview#onDateFieldChange
         * @memberof yahor.andryieuski.controller.StoresOverview
         * @param {sap.ui.base.Event} oEvent - The event object.
         * @public
         * @returns {void}
         */
        onDateFieldChange: function (oEvent) {
            this.onFormFieldChange(oEvent);
            this.validateDateInputPresence(oEvent.getSource());
        },

        /**
         * Handles the press event of the "Submit" button for creating a new store.
         * Validates input fields, submits changes to the OData model, and closes the dialog if there are no validation errors.
         * Shows a success message toast upon successful creation, or an alert message if there are validation errors.
         *
         * @function
         * @name yahor.andryieuski.controller.StoresOverview#onSubmitCreateStorePress
         * @memberof yahor.andryieuski.controller.StoresOverview
         * @public
         * @returns {void}
         */
        onSubmitCreateStorePress: function () {
            const oView = this.getView();
            const oBundle = oView.getModel("i18n").getResourceBundle();

            const aInputs = [
                this.byId("createStoreName"),
                this.byId("createStoreEmail"),
                this.byId("createStorePhoneNumber"),
                this.byId("createStoreAddress"),
                this.byId("createStoreDate"),
                this.byId("createStoreFloorArea")
            ];

            let bValidationError = false;

            aInputs.forEach(function (oInput) {
                bValidationError = this._validateInput(oInput) || bValidationError;
            }, this);

            this.validateDateInputPresence(this.byId("createStoreDate"));

            if (!bValidationError) {
                const oODataModel = oView.getModel();

                oODataModel.submitChanges();

                this.oDialog.close();

                const sStoreCreateNotification = oBundle.getText("storeCreateNotification");
                MessageToast.show(sStoreCreateNotification);
            } else {
                const sValidationAlert = oBundle.getText("validationAlert");
                MessageBox.alert(sValidationAlert);
            }
        },

        /**
         * Handles the press event of the "Cancel" button for creating a new store.
         * Closes the create store dialog.
         *
         * @function
         * @name yahor.andryieuski.controller.StoresOverview#onCancelCreateStorePress
         * @memberof yahor.andryieuski.controller.StoresOverview
         * @public
         * @returns {void}
         */
        onCancelCreateStorePress: function () {
            this.oDialog.close();
        },

        /**
         * Handles the event that occurs after closing the create dialog.
         * Deletes the created entry from the OData model.
         *
         * @function
         * @name yahor.andryieuski.controller.StoresOverview#onAfterCloseCreateDialog
         * @memberof yahor.andryieuski.controller.StoresOverview
         * @public
         * @returns {void}
         */
        onAfterCloseCreateDialog: function () {
            const oODataModel = this.getView().getModel();
            const oContext = this.oDialog.getBindingContext();

            oODataModel.deleteCreatedEntry(oContext);
            this.resetValueStates();
        },

        /**
         * Handles the language switch button press event.
         *
         * This method checks the current language and toggles it between English and Russian.
         * It uses the Localization module to set the language accordingly.
         *
         * @function
         * @name yahor.andryieuski.controller.StoresOverview#onSwitchLanguagePress
         * @memberof yahor.andryieuski.controller.StoresOverview
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
