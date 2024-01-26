sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/SimpleType",
    "sap/ui/model/ValidateException",
    "sap/ui/core/Core",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/format/DateFormat"
], function (Controller, Filter, FilterOperator, JSONModel, SimpleType, ValidateException, Core, MessageBox, MessageToast, DateFormat) {
    "use strict";

    return Controller.extend("yahor.andryieuski.controller.StoresOverview", {
        onInit: function () {
            const oCreateStoreModel = new JSONModel({
                formFields: {
                    Name: "",
                    Email: "",
                    PhoneNumber: "",
                    Address: "",
                    Established: null,
                    FloorArea: null
                }
            });

            this.getView().setModel(oCreateStoreModel, "createStoreModel");

            this.oRouter = this.getOwnerComponent().getRouter();
        },

        onStoresListItemPress: function (oEvent) {
            const oCtx = oEvent.getSource().getBindingContext("odata");

            this.oRouter.navTo("StoreDetails", {
                storeID: oCtx.getProperty("id")
            });
        },

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

        onCreateStorePress: function () {
            var oView = this.getView();

            if (!this.oDialog) {
                this.oDialog = sap.ui.xmlfragment(
                    oView.getId(),
                    "yahor.andryieuski.view.fragments.CreateStoreDialog",
                    this
                );
                oView.addDependent(this.oDialog);

                const oMM = Core.getMessageManager();

                oMM.registerObject(oView.byId("createStoreName"), true);
                oMM.registerObject(oView.byId("createStoreEmail"), true);
                oMM.registerObject(oView.byId("createStorePhoneNumber"), true);
                oMM.registerObject(oView.byId("createStoreAddress"), true);
                oMM.registerObject(oView.byId("createStoreDate"), true);
                oMM.registerObject(oView.byId("createStoreFloorArea"), true);
            }

            this.oDialog.bindObject({
                path: "/formFields",
                model: "createStoreModel"
            });

            this.oDialog.open();
        },

        _validateInput: function (oInput) {
            let sValueState = "None";
            let bValidationError = false;
            const oBinding = oInput.getBinding("value");

            try {
                oBinding.getType().validateValue(oInput.getValue());
            } catch (oException) {
                sValueState = "Error";
                bValidationError = true;
            }

            oInput.setValueState(sValueState);

            return bValidationError;
        },

        onFormFieldChange: function (oEvent) {
            var oInput = oEvent.getSource();
            this._validateInput(oInput);
        },

        customEMailType: SimpleType.extend("email", {
            formatValue: function (oValue) {
                return oValue;
            },

            parseValue: function (oValue) {
                return oValue;
            },

            validateValue: function (oValue) {
                var rexMail = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
                if (!oValue.match(rexMail)) {
                    throw new ValidateException("'" + oValue + "' is not a valid email address");
                }
            }
        }),

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

            if (!bValidationError) {
                const oFormModel = oView.getModel("createStoreModel");
                const mFormFields = oFormModel.getProperty("/formFields");
                const oDataModel = oView.getModel("odata");

                oDataModel.create("/Stores", mFormFields);
                this.oDialog.close();

                const sStoreCreateNotification = oBundle.getText("storeCreateNotification");
                MessageToast.show(sStoreCreateNotification);
            } else {
                const sValidationAlert = oBundle.getText("validationAlert");
                MessageBox.alert(sValidationAlert);
            }
        },

        onCancelCreateStorePress: function () {
            this.oDialog.close();
        },

        onAfterCloseCreateDialog: function () {
            this.byId("createStoreName").setValue("");
            this.byId("createStoreEmail").setValue("");
            this.byId("createStorePhoneNumber").setValue("");
            this.byId("createStoreAddress").setValue("");
            this.byId("createStoreDate").setValue(null);
            this.byId("createStoreFloorArea").setValue(null);
        },
    });
});
