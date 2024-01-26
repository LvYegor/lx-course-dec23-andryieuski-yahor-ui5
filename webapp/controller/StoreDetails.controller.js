sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/ui/core/Core",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (Controller, JSONModel, Filter, FilterOperator, Sorter, Core, MessageBox, MessageToast) {
    "use strict";

    const SORT_NONE = null;
    const SORT_ASC = "ASC";
    const SORT_DESC = "DESC";

    return Controller.extend("yahor.andryieuski.controller.StoreDetails", {
        onInit: function () {
            this.oRouter = this.getOwnerComponent().getRouter();

            const oViewModel = new JSONModel({
                storeID: null,
                statusAmount: {
                    all: 0,
                    ok: 0,
                    storage: 0,
                    out_of_stock: 0
                },
                filter: {
                    selectedStatus: "ALL",
                    searchValue: ""
                },
                sort: {
                    Name: {
                        columnName: "Name",
                        sortType: SORT_NONE
                    },
                    Price: {
                        columnName: "Price",
                        sortType: SORT_NONE
                    },
                    Specs: {
                        columnName: "Specs",
                        sortType: SORT_NONE
                    },
                    SupplierInfo: {
                        columnName: "SupplierInfo",
                        sortType: SORT_NONE
                    },
                    MadeIn: {
                        columnName: "MadeIn",
                        sortType: SORT_NONE
                    },
                    ProductionCompanyName: {
                        columnName: "ProductionCompanyName",
                        sortType: SORT_NONE
                    },
                    Rating: {
                        columnName: "Rating",
                        sortType: SORT_NONE
                    },
                }
            });

            const oCreateProductModel = new JSONModel({
                formFields: {
                    Name: "",
                    Price: null,
                    Specs: "",
                    Rating: null,
                    SupplierInfo: "",
                    MadeIn: "",
                    ProductionCompanyName: "",
                    Status: "OK"
                }
            });

            this.getView().setModel(oViewModel, "appView");
            this.getView().setModel(oCreateProductModel, "createProductModel");

            this.oRouter.getRoute("StoreDetails").attachPatternMatched(this.onPatternMatched, this);
        },

        onPatternMatched: function (oEvent) {
            const mRouteArguments = oEvent.getParameter("arguments");
            const sStoreID = mRouteArguments.storeID;
            const oODataModel = this.getView().getModel("odata");
            const oViewModel = this.getView().getModel("appView");

            oViewModel.setProperty("/storeID", sStoreID);

            oODataModel.metadataLoaded().then(function () {
                const sKey = oODataModel.createKey("/Stores", {id: sStoreID});

                this.getView().bindObject({
                    path: sKey,
                    model: "odata"
                });
            }.bind(this));
        },

        onTableUpdateFinished: function (oEvent) {
            const oTable = oEvent.getSource();
            const sKey = oTable.getBindingContext("odata");
            const oViewModel = this.getView().getModel("appView");

            const aStatuses = ['ALL', 'OK', 'STORAGE', 'OUT_OF_STOCK'];

            this.getView().getModel("odata").read(`${sKey}/rel_Products/$count`, {
                success: function (oData) {
                    oViewModel.setProperty("/statusAmount/all", oData);
                }
            });

            aStatuses.slice(1).forEach(function (sStatus) {
                this.getView().getModel("odata").read(`${sKey}/rel_Products/$count`, {
                    filters: [new Filter("Status", FilterOperator.EQ, sStatus)],
                    success: function (oData) {
                        oViewModel.setProperty("/statusAmount/" + sStatus.toLowerCase(), oData);
                    }
                });
            }.bind(this));
        },

        onStoresListBreadcrumbPress: function (oEvent) {
            this.oRouter.navTo("StoresOverview");
        },

        onProductItemPress: function (oEvent) {
            const oCtx = oEvent.getSource().getBindingContext("odata");

            this.oRouter.navTo("ProductDetails", {
                productID: oCtx.getProperty("id")
            });
        },

        sortTypeFormatter: function (sSortType) {
            switch (sSortType) {
                case SORT_NONE: {
                    return "sort";
                }
                case SORT_ASC: {
                    return "sort-ascending";
                }
                case SORT_DESC: {
                    return "sort-descending";
                }
                default: {
                    return "sort";
                }
            }
        },

        onSortButtonPress: function (oEvent) {
            const oViewModel = this.getView().getModel("appView");
            const oSortSettings = oViewModel.getProperty("/sort");
            const sColumnName = oEvent.getSource().getCustomData()[0].getValue();
            const oCurrentSortSetting = oSortSettings[sColumnName];

            this.resetSortButtons(sColumnName);

            switch (oCurrentSortSetting.sortType) {
                case SORT_NONE: {
                    oCurrentSortSetting.sortType = SORT_ASC;
                    break;
                }
                case SORT_ASC: {
                    oCurrentSortSetting.sortType = SORT_DESC;
                    break;
                }
                case SORT_DESC: {
                    oCurrentSortSetting.sortType = SORT_NONE;
                    break;
                }
                default: {
                    oCurrentSortSetting.sortType = SORT_NONE;
                    break;
                }
            }

            oViewModel.setProperty("/sort", oSortSettings);

            const oProductsTable = this.byId("productsTableId");

            let oSorter = null;

            if (oCurrentSortSetting.sortType !== SORT_NONE) {
                oSorter = new Sorter(sColumnName, oCurrentSortSetting.sortType === SORT_DESC);
            }

            const oItemsBinding = oProductsTable.getBinding("items");
            oItemsBinding.sort(oSorter);
        },

        resetSortButtons: function (sExcludedColumnName) {
            const oViewModel = this.getView().getModel("appView");
            const aSortSettings = oViewModel.getProperty("/sort");

            for (const sColumnName in aSortSettings) {
                if (sColumnName !== sExcludedColumnName) {
                    aSortSettings[sColumnName].sortType = SORT_NONE;
                }
            }

            oViewModel.setProperty("/sort", aSortSettings);
        },

        onProductsSearch: function (oEvent) {
            const sQuery = oEvent.getParameter("query");
            const oViewModel = this.getView().getModel("appView");
            const oFilterSetings = oViewModel.getProperty("/filter");

            oFilterSetings.searchValue = sQuery;

            oViewModel.setProperty("/filter", oFilterSetings);

            this.filterProducts();
        },

        onFilterSelect: function (oEvent) {
            const sStatus = oEvent.getParameter("key");
            const oViewModel = this.getView().getModel("appView");
            const oFilterSetings = oViewModel.getProperty("/filter");

            oFilterSetings.selectedStatus = sStatus;

            oViewModel.setProperty("/filter", oFilterSetings);

            this.filterProducts();
        },

        filterProducts: function () {
            const oProductsTable = this.byId("productsTableId");
            const oItemsBinding = oProductsTable.getBinding("items");

            const oViewModel = this.getView().getModel("appView");
            const oFilterSetings = oViewModel.getProperty("/filter");

            const aFilters = [];

            if (oFilterSetings.selectedStatus !== "ALL") {
                aFilters.push(
                    new Filter({
                        path: "Status",
                        operator: FilterOperator.EQ,
                        value1: oFilterSetings.selectedStatus
                    })
                );
            }

            aFilters.push(
                new Filter({
                    filters: [
                        new Filter({
                            path: "Name",
                            operator: FilterOperator.Contains,
                            value1: oFilterSetings.searchValue
                        }),
                        new Filter({
                            path: "Price",
                            operator: FilterOperator.EQ,
                            value1: !isNaN(oFilterSetings.searchValue) ? oFilterSetings.searchValue : null
                        }),
                        new Filter({
                            path: "Specs",
                            operator: FilterOperator.Contains,
                            value1: oFilterSetings.searchValue
                        }),
                        new Filter({
                            path: "Rating",
                            operator: FilterOperator.EQ,
                            value1: !isNaN(oFilterSetings.searchValue) ? oFilterSetings.searchValue : null
                        }),
                        new Filter({
                            path: "SupplierInfo",
                            operator: FilterOperator.Contains,
                            value1: oFilterSetings.searchValue
                        }),
                        new Filter({
                            path: "MadeIn",
                            operator: FilterOperator.Contains,
                            value1: oFilterSetings.searchValue
                        }),
                        new Filter({
                            path: "ProductionCompanyName",
                            operator: FilterOperator.Contains,
                            value1: oFilterSetings.searchValue
                        }),
                    ],
                    and: false
                })
            );

            oItemsBinding.filter(aFilters);
        },

        onCreateProductPress: function () {
            const oView = this.getView();

            if (!this.oCreateProductDialog) {
                this.oCreateProductDialog = sap.ui.xmlfragment(
                    oView.getId(),
                    "yahor.andryieuski.view.fragments.CreateProductDialog",
                    this
                );

                oView.addDependent(this.oCreateProductDialog);

                const oMM = Core.getMessageManager();

                oMM.registerObject(oView.byId("createProductName"), true);
                oMM.registerObject(oView.byId("createProductPrice"), true);
                oMM.registerObject(oView.byId("createProductSpecs"), true);
                oMM.registerObject(oView.byId("createProductRating"), true);
                oMM.registerObject(oView.byId("createProductSupplierInfo"), true);
                oMM.registerObject(oView.byId("createProductMadeIn"), true);
                oMM.registerObject(oView.byId("createProductProdCompany"), true);

                this.oCreateProductDialog.bindObject({
                    path: "/formFields",
                    model: "createProductModel"
                });
            }

            this.oCreateProductDialog.open();
        },

        onSubmitCreateProductPress: function () {
            const oView = this.getView();
            const oBundle = oView.getModel("i18n").getResourceBundle();

            const aInputs = [
                this.byId("createProductName"),
                this.byId("createProductPrice"),
                this.byId("createProductSpecs"),
                this.byId("createProductRating"),
                this.byId("createProductSupplierInfo"),
                this.byId("createProductMadeIn"),
                this.byId("createProductProdCompany")
            ];

            let bValidationError = false;

            aInputs.forEach(function (oInput) {
                bValidationError = this._validateInput(oInput) || bValidationError;
            }, this);

            if (!bValidationError) {
                const oViewModel = oView.getModel("appView");
                const oFormModel = oView.getModel("createProductModel");
                const mFormFields = oFormModel.getProperty("/formFields");
                const oDataModel = oView.getModel("odata");

                const payload = JSON.parse(JSON.stringify(mFormFields));

                payload["StoreId"] = oViewModel.getProperty("/storeID");

                oDataModel.create("/Products", payload);
                this.oCreateProductDialog.close();

                const sProductCreateNotification = oBundle.getText("productCreateNotification");
                MessageToast.show(sProductCreateNotification);
            } else {
                const sValidationAlert = oBundle.getText("validationAlert");
                MessageBox.alert(sValidationAlert);
            }
        },

        onCancelCreateProductPress: function () {
            this.oCreateProductDialog.close();
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

        onAfterCloseCreateDialog: function () {
            const oFormModel = this.getView().getModel("createProductModel");

            this.byId("createProductName").setValue("");
            this.byId("createProductPrice").setValue(null);
            this.byId("createProductSpecs").setValue("");
            this.byId("createProductRating").setValue(null);
            this.byId("createProductSupplierInfo").setValue("");
            this.byId("createProductMadeIn").setValue("");
            this.byId("createProductProdCompany").setValue("");
            oFormModel.setProperty("/formFields/Status", "OK");
        },

        onDeleteProductPress: function (oEvent) {
            const oView = this.getView();
            const oViewModel = oView.getModel("appView");
            const oItem = oEvent.getSource();
            const sPath = oItem.getBindingContext("odata").getPath();

            if (!this.oDeleteProductDialog) {
                this.oDeleteProductDialog = sap.ui.xmlfragment(
                    oView.getId(),
                    "yahor.andryieuski.view.fragments.ConfirmDeleteProductDialog",
                    this
                );

                oView.addDependent(this.oDeleteProductDialog);
            }
            oViewModel.setProperty("/pathDeleteProduct", sPath);
            this.oDeleteProductDialog.open();
        },

        onSubmitDeleteProductPress: function () {
            const oView = this.getView();
            const oViewModel = oView.getModel("appView");
            const sPath = oViewModel.getProperty("/pathDeleteProduct");

            this.getView().getModel("odata").remove(sPath);

            this.oDeleteProductDialog.close();
        },

        onCancelDeletePress: function (oEvent) {
            const oDialog = oEvent.getSource().getParent();
            oDialog.close();
        },

        onDeleteStorePress: function () {
            const oView = this.getView();

            if (!this.oDeleteStoreDialog) {
                this.oDeleteStoreDialog = sap.ui.xmlfragment(
                    oView.getId(),
                    "yahor.andryieuski.view.fragments.ConfirmDeleteStoreDialog",
                    this
                );

                oView.addDependent(this.oDeleteStoreDialog);
            }

            this.oDeleteStoreDialog.open();
        },

        onSubmitDeleteStore: function (oEvent) {
            const sPath = this.getView().getBindingContext("odata").getPath();

            this.getView().getModel("odata").remove(sPath);

            this.oDeleteStoreDialog.close();

            this.oRouter.navTo("StoresOverview");
        },
    });
});
