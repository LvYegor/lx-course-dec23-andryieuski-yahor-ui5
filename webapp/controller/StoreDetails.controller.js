/**
 * Controller for managing store details view.
 * @author Yahor Andryieuski
 * @namespace yahor.andryieuski.controller.StoreDetails
 * @extends sap.ui.core.mvc.Controller
 */
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "yahor/andryieuski/model/StoresModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/ui/core/Core",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/core/Messaging",
    "sap/base/i18n/Localization"
], function (Controller, JSONModel, StoresModel, Filter, FilterOperator, Sorter, Core, MessageBox, MessageToast, Fragment, Messaging, Localization) {
    "use strict";

    const SORT_NONE = null;
    const SORT_ASC = "ASC";
    const SORT_DESC = "DESC";

    return Controller.extend("yahor.andryieuski.controller.StoreDetails", {

        /**
         * Initializes the StoreDetails controller.
         *
         * This method is called when the controller is instantiated. It initializes the router,
         * creates a JSONModel for managing the view data, sets the model to the view, and attaches
         * a pattern matched event handler to the "StoreDetails" route.
         *
         * @function
         * @name yahor.andryieuski.controller.StoreDetails#onInit
         * @memberof yahor.andryieuski.controller.StoreDetails
         * @public
         * @returns {void}
         */
        onInit: function () {
            this.oRouter = this.getOwnerComponent().getRouter();

            const oViewModel = new JSONModel({
                editMode: false,
                storeID: null,
                statusAmount: {
                    all: 0,
                    ok: 0,
                    storage: 0,
                    out_of_stock: 0
                },
                filter: {
                    selectedStatus: "ALL",
                    searchValue: "",
                    orderBy: ""
                },
                sort: {
                    name: {
                        columnName: "Name",
                        sortType: SORT_NONE
                    },
                    price: {
                        columnName: "Price",
                        sortType: SORT_NONE
                    },
                    specs: {
                        columnName: "Specs",
                        sortType: SORT_NONE
                    },
                    supplier_info: {
                        columnName: "SupplierInfo",
                        sortType: SORT_NONE
                    },
                    made_in: {
                        columnName: "MadeIn",
                        sortType: SORT_NONE
                    },
                    production_company_name: {
                        columnName: "ProductionCompanyName",
                        sortType: SORT_NONE
                    },
                    rating: {
                        columnName: "Rating",
                        sortType: SORT_NONE
                    },
                }
            });

            const oNewProductModel = new JSONModel({
                name: null,
                price: null,
                specs: null,
                rating: null,
                supplier_info: null,
                made_in: null,
                production_company_name: null,
                status: null,
                store: null
            });

            this.getView().setModel(oNewProductModel, "newProductModel");

            this.getView().setModel(oViewModel, "appView");

            this.oRouter.getRoute("StoreDetails").attachPatternMatched(this.onPatternMatched, this);
        },

        /**
         * Handles the pattern matched event for the "StoreDetails" route.
         *
         * This method is triggered when the pattern for the "StoreDetails" route is matched.
         * It extracts the store ID from the route arguments, sets the store ID property in the view model,
         * and binds the object path to the view for displaying store details.
         *
         * @function
         * @name yahor.andryieuski.controller.StoreDetails#onPatternMatched
         * @memberof yahor.andryieuski.controller.StoreDetails
         * @param {sap.ui.base.Event} oEvent - The event object containing event parameters.
         * @public
         * @returns {void}
         */
        onPatternMatched: function (oEvent) {
            const mRouteArguments = oEvent.getParameter("arguments");
            const sStoreID = mRouteArguments.storeID;
            // const oODataModel = this.getView().getModel();
            const oViewModel = this.getView().getModel("appView");

            oViewModel.setProperty("/storeID", sStoreID);

            StoresModel.fetchStoreById(sStoreID).then((oStore) => {
                this.getView().getModel("storesModel").setProperty("/DetailStore", oStore);
            });

            StoresModel.fetchStoreProductsById(sStoreID).then((aProducts) => {
                this.getView().getModel("storesModel").setProperty("/StoreProducts", aProducts);
            });
        },

        /**
         * Handles the event when the table update is finished.
         * Updates the count of products for each status after filtering.
         *
         * @function
         * @name yahor.andryieuski.controller.StoreDetails#onTableUpdateFinished
         * @memberof yahor.andryieuski.controller.StoreDetails
         * @param {sap.ui.base.Event} oEvent - The event when the table update is finished.
         * @public
         * @returns {void}
         */
        onTableUpdateFinished: function (oEvent) {
            const oViewModel = this.getView().getModel("appView");
            const sStoreId = oViewModel.getProperty("/storeID");
            const aStatuses = ["OK", "STORAGE", "OUT_OF_STOCK"];

            StoresModel.fetchFilteredStoreProductsById(sStoreId, "", "", "").then((oData) => {
                oViewModel.setProperty("/statusAmount/all", oData.length);
            });

            aStatuses.forEach(function (sStatus) {
                StoresModel.fetchFilteredStoreProductsById(sStoreId, "", sStatus, "").then((oData) => {
                    oViewModel.setProperty("/statusAmount/" + sStatus.toLowerCase(), oData.length);
                });
            });
        },

        /**
         * Handles the press event of the breadcrumb for navigating to the Stores Overview page.
         *
         * This method is triggered when the breadcrumb for navigating to the Stores Overview page is pressed.
         * It uses the router to navigate to the "StoresOverview" route.
         *
         * @function
         * @name yahor.andryieuski.controller.StoreDetails#onStoresListBreadcrumbPress
         * @memberof yahor.andryieuski.controller.StoreDetails
         * @param {sap.ui.base.Event} oEvent - The event object containing event parameters.
         * @public
         * @returns {void}
         */
        onStoresListBreadcrumbPress: function (oEvent) {
            this.oRouter.navTo("StoresOverview");
        },

        /**
         * Handles the press event of a product item.
         *
         * This method is triggered when a product item is pressed. It retrieves the binding context
         * of the pressed item and navigates to the "ProductDetails" route with the corresponding product ID.
         *
         * @function
         * @name yahor.andryieuski.controller.StoreDetails#onProductItemPress
         * @memberof yahor.andryieuski.controller.StoreDetails
         * @param {sap.ui.base.Event} oEvent - The event object containing event parameters.
         * @public
         * @returns {void}
         */
        onProductItemPress: function (oEvent) {
            const oContext = oEvent.getSource().getBindingContext();

            this.oRouter.navTo("ProductDetails", {
                productID: oContext.getProperty("id")
            });
        },

        /**
         * Formats the sort type for display.
         *
         * This method takes a sort type as input and returns a corresponding CSS class for styling.
         * If the sort type is SORT_NONE, it returns "sort".
         * If the sort type is SORT_ASC, it returns "sort-ascending".
         * If the sort type is SORT_DESC, it returns "sort-descending".
         * If the sort type is none of the above, it returns "sort".
         *
         * @function
         * @name yahor.andryieuski.controller.StoreDetails#sortTypeFormatter
         * @memberof yahor.andryieuski.controller.StoreDetails
         * @param {string} sSortType - The sort type to be formatted.
         * @public
         * @returns {string} The CSS class corresponding to the sort type.
         */
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

        /**
         * Handles the press event of the sort button.
         *
         * This method is triggered when the user presses a sort button. It retrieves the current sort settings,
         * updates the sort type based on the current state, resets other sort buttons, updates the view model with
         * the new sort settings, creates a sorter based on the updated sort settings, and applies the sorter to
         * the products table for sorting.
         *
         * @function
         * @name yahor.andryieuski.controller.StoreDetails#onSortButtonPress
         * @memberof yahor.andryieuski.controller.StoreDetails
         * @param {sap.ui.base.Event} oEvent - The event object that triggered the function call.
         * @public
         * @returns {void}
         */
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

        /**
         * Resets the sort buttons except for the specified column.
         *
         * This method resets the sort buttons for all columns except the one specified by the excluded column name.
         * It retrieves the sort settings from the view model, iterates through each column's sort settings, and sets
         * the sort type to SORT_NONE for columns other than the one specified as excluded. Finally, it updates the view
         * model with the updated sort settings.
         *
         * @function
         * @name yahor.andryieuski.controller.StoreDetails#resetSortButtons
         * @memberof yahor.andryieuski.controller.StoreDetails
         * @param {string} sExcludedColumnName - The name of the column for which the sort button should not be reset.
         * @public
         * @returns {void}
         */
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

        /**
         * Handles the search event for products.
         *
         * This method is triggered when a search event occurs for products. It retrieves the search query from the event
         * parameters, updates the filter settings in the view model with the new search value, and calls the method to filter
         * the products based on the updated filter settings.
         *
         * @function
         * @name yahor.andryieuski.controller.StoreDetails#onProductsSearch
         * @memberof yahor.andryieuski.controller.StoreDetails
         * @param {sap.ui.base.Event} oEvent - The event object containing information about the search event.
         * @public
         * @returns {void}
         */
        onProductsSearch: function (oEvent) {
            const sQuery = oEvent.getParameter("query");
            const oViewModel = this.getView().getModel("appView");
            const oFilterSettings = oViewModel.getProperty("/filter");

            oFilterSettings.searchValue = sQuery;

            oViewModel.setProperty("/filter", oFilterSettings);

            this.filterProducts();
        },

        /**
         * Handles the selection of a filter option.
         *
         * This method is triggered when a user selects a filter option. It retrieves the selected status from the event
         * parameters, updates the filter settings in the view model with the selected status, and calls the method to filter
         * the products based on the updated filter settings.
         *
         * @function
         * @name yahor.andryieuski.controller.StoreDetails#onFilterSelect
         * @memberof yahor.andryieuski.controller.StoreDetails
         * @param {sap.ui.base.Event} oEvent - The event object containing information about the selected filter option.
         * @public
         * @returns {void}
         */
        onFilterSelect: function (oEvent) {
            const sStatus = oEvent.getParameter("key");
            const oViewModel = this.getView().getModel("appView");
            const oFilterSettings = oViewModel.getProperty("/filter");

            oFilterSettings.selectedStatus = sStatus;

            oViewModel.setProperty("/filter", oFilterSettings);

            this.filterProducts();
        },

        /**
         * Filters the products displayed in the table based on the filter settings.
         *
         * This method retrieves the filter settings from the view model, constructs an array of filters based on the selected
         * status and search value, and applies the filters to the binding of the products table.
         *
         * @function
         * @name yahor.andryieuski.controller.StoreDetails#filterProducts
         * @memberof yahor.andryieuski.controller.StoreDetails
         * @public
         * @returns {void}
         */
        filterProducts: function () {
            const oProductsTable = this.byId("productsTableId");
            const oItemsBinding = oProductsTable.getBinding("items");

            const oViewModel = this.getView().getModel("appView");
            const oFilterSettings = oViewModel.getProperty("/filter");

            const aFilters = [];

            if (oFilterSettings.selectedStatus !== "ALL") {
                aFilters.push(
                    new Filter({
                        path: "status",
                        operator: FilterOperator.EQ,
                        value1: oFilterSettings.selectedStatus
                    })
                );
            }

            aFilters.push(
                new Filter({
                    filters: [
                        new Filter({
                            path: "name",
                            operator: FilterOperator.Contains,
                            value1: oFilterSettings.searchValue
                        }),
                        new Filter({
                            path: "price",
                            operator: FilterOperator.EQ,
                            value1: !isNaN(oFilterSettings.searchValue) ? oFilterSettings.searchValue : null
                        }),
                        new Filter({
                            path: "specs",
                            operator: FilterOperator.Contains,
                            value1: oFilterSettings.searchValue
                        }),
                        new Filter({
                            path: "rating",
                            operator: FilterOperator.EQ,
                            value1: !isNaN(oFilterSettings.searchValue) ? oFilterSettings.searchValue : null
                        }),
                        new Filter({
                            path: "supplier_info",
                            operator: FilterOperator.Contains,
                            value1: oFilterSettings.searchValue
                        }),
                        new Filter({
                            path: "made_in",
                            operator: FilterOperator.Contains,
                            value1: oFilterSettings.searchValue
                        }),
                        new Filter({
                            path: "production_company_name",
                            operator: FilterOperator.Contains,
                            value1: oFilterSettings.searchValue
                        }),
                    ],
                    and: false
                })
            );

            oItemsBinding.filter(aFilters);
        },

        /**
         * Handles the creation of a new product.
         *
         * This method sets the edit mode to false, prepares the product dialog, and opens it. It creates a new entry in the
         * "Products" entity set with initial properties including the store ID and status, binds the new entry to the product
         * dialog, and opens the dialog for creating a new product.
         *
         * @function
         * @name yahor.andryieuski.controller.StoreDetails#onCreateProductPress
         * @memberof yahor.andryieuski.controller.StoreDetails
         * @public
         * @returns {void}
         */
        onCreateProductPress: function () {
            const oView = this.getView();
            const oNewProductModel = oView.getModel("newProductModel");
            const oViewModel = oView.getModel("appView");
            oViewModel.setProperty("/editMode", false);

            this.prepareProductDialog(oView);

            this.pProductDialog.then(() => {
                oNewProductModel.setProperty("/store", oViewModel.getProperty("/storeID"));
                oNewProductModel.setProperty("/status", "OK");

                this.oProductDialog.bindObject({
                    model: "newProductModel",
                    path: "/"
                });

                this.oProductDialog.open();
            });
        },

        /**
         * Handles the submission of the new product creation.
         *
         * This method attaches an event listener to the "updateFinished" event of the products table, retrieves the view and
         * resource bundle, checks if the edit mode is enabled, validates the input fields, submits the changes to the OData model,
         * closes the product dialog, and displays a success message toast or a validation alert message box accordingly.
         *
         * @function
         * @name yahor.andryieuski.controller.StoreDetails#onSubmitCreateProductPress
         * @memberof yahor.andryieuski.controller.StoreDetails
         * @public
         * @returns {void}
         */
        onSubmitCreateProductPress: function () {
            const oTable = this.byId("productsTableId");
            oTable.attachUpdateFinished(this.onTableUpdateFinished, this);

            const oView = this.getView();
            const oBundle = oView.getModel("i18n").getResourceBundle();

            const bEditMode = oView.getModel("appView").getProperty("/editMode");

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
                const oNewProductModel = oView.getModel("newProductModel");
                const oFormFields = oNewProductModel.getProperty("/");

                StoresModel.createNewProduct(oFormFields).then(() => {
                    StoresModel.fetchStoreProductsById(oViewModel.getProperty("/storeID")).then((aProducts) => {
                        oView.getModel("storesModel").setProperty("/StoreProducts", aProducts);
                    });
                });

                this.oProductDialog.close();

                const sNotification = oBundle.getText(bEditMode ? "productEditNotification" : "productCreateNotification");
                MessageToast.show(sNotification);
            } else {
                const sValidationAlert = oBundle.getText("validationAlert");
                MessageBox.alert(sValidationAlert);
            }
        },

        /**
         * Handles the cancellation of the new product creation.
         *
         * This method closes the product dialog when the user cancels the creation of a new product.
         *
         * @function
         * @name yahor.andryieuski.controller.StoreDetails#onCancelCreateProductPress
         * @memberof yahor.andryieuski.controller.StoreDetails
         * @public
         * @returns {void}
         */
        onCancelCreateProductPress: function () {
            this.oProductDialog.close();
        },

        /**
         * Validates the input value.
         *
         * This method validates the value of the input field based on its binding type. If the value is invalid,
         * it sets the value state of the input field to "Error".
         *
         * @function
         * @name yahor.andryieuski.controller.StoreDetails#_validateInput
         * @memberof yahor.andryieuski.controller.StoreDetails
         * @param {sap.ui.core.Control} oInput - The input control to be validated.
         * @private
         * @returns {boolean} Returns true if there is a validation error, false otherwise.
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
         * Event handler for form field change.
         *
         * This method is triggered when the value of a form field changes. It validates the input value
         * and sets the value state accordingly.
         *
         * @function
         * @name yahor.andryieuski.controller.StoreDetails#onFormFieldChange
         * @memberof yahor.andryieuski.controller.StoreDetails
         * @param {sap.ui.base.Event} oEvent - The event object.
         * @public
         * @returns {void}
         */
        onFormFieldChange: function (oEvent) {
            const oInput = oEvent.getSource();
            this._validateInput(oInput);
        },

        /**
         * Resets the value states of input fields.
         *
         * This method sets the value state of each input field to "None".
         *
         * @function
         * @name yahor.andryieuski.controller.StoreDetails#resetValueStates
         * @memberof yahor.andryieuski.controller.StoreDetails
         * @public
         * @returns {void}
         */
        resetValueStates: function () {
            const aInputs = [
                this.byId("createProductName"),
                this.byId("createProductPrice"),
                this.byId("createProductSpecs"),
                this.byId("createProductRating"),
                this.byId("createProductSupplierInfo"),
                this.byId("createProductMadeIn"),
                this.byId("createProductProdCompany")
            ];

            aInputs.forEach(function (oInput) {
                oInput.setValueState(sap.ui.core.ValueState.None);
            }, this);

        },

        /**
         * Event handler for the after close event of the edit dialog.
         *
         * This method is called after the edit dialog is closed. It resets any changes made in the OData model.
         *
         * @function
         * @name yahor.andryieuski.controller.StoreDetails#onAfterCloseEditDialog
         * @memberof yahor.andryieuski.controller.StoreDetails
         * @public
         * @returns {void}
         */
        onAfterCloseEditDialog: function () {
            const oODataModel = this.getView().getModel();
            oODataModel.resetChanges();
        },

        /**
         * Event handler for the after close event of the create dialog.
         *
         * This method is called after the create dialog is closed. It deletes the created entry from the OData model.
         *
         * @function
         * @name yahor.andryieuski.controller.StoreDetails#onAfterCloseCreateDialog
         * @memberof yahor.andryieuski.controller.StoreDetails
         * @public
         * @returns {void}
         */
        onAfterCloseCreateDialog: function () {
            this.resetProductDialogFields();
            this.resetValueStates();
        },

        resetProductDialogFields: function () {
            this.byId("createProductName").setValue(null);
            this.byId("createProductPrice").setValue(null);
            this.byId("createProductSpecs").setValue(null);
            this.byId("createProductRating").setValue(null);
            this.byId("createProductSupplierInfo").setValue(null);
            this.byId("createProductMadeIn").setValue(null);
            this.byId("createProductProdCompany").setValue(null);
            this.byId("createProductStatus").setValue(null);
        },

        /**
         * Event handler for the after close event of the product dialog.
         *
         * This method is called after the product dialog is closed. It determines whether the dialog was in edit mode or create mode
         * and performs appropriate actions, such as resetting changes or deleting the created entry from the OData model.
         *
         * @function
         * @name yahor.andryieuski.controller.StoreDetails#onAfterCloseProductDialog
         * @memberof yahor.andryieuski.controller.StoreDetails
         * @public
         * @returns {void}
         */
        onAfterCloseProductDialog: function () {
            const bEditMode = this.getView().getModel("appView").getProperty("/editMode");

            if (bEditMode) {
                this.onAfterCloseEditDialog();
            } else {
                this.onAfterCloseCreateDialog();
            }

            const oTable = this.byId("productsTableId");
            oTable.attachUpdateFinished(this.onTableUpdateFinished, this);

            this.resetValueStates();
        },

        /**
         * Event handler for the delete product button press event.
         *
         * This method is called when the delete product button is pressed. It displays a confirmation dialog to confirm
         * the deletion of the product. If confirmed, it removes the product from the model.
         *
         * @function
         * @name yahor.andryieuski.controller.StoreDetails#onDeleteProductPress
         * @memberof yahor.andryieuski.controller.StoreDetails
         * @param {sap.ui.base.Event} oEvent The event object
         * @public
         * @returns {void}
         */
        onDeleteProductPress: function (oEvent) {
            const oBundle = this.getView().getModel("i18n").getResourceBundle();
            const sConfirmation = oBundle.getText("confirmation");
            const sDeleteStoreConfirmText = oBundle.getText("deleteProductConfirmText");

            const oView = this.getView();
            const oViewModel = oView.getModel("appView");
            const oItem = oEvent.getSource();
            const sPath = oItem.getBindingContext().getPath();

            oViewModel.setProperty("/pathDeleteProduct", sPath);

            MessageBox.confirm(sDeleteStoreConfirmText, {
                title: sConfirmation,
                actions: [
                    sap.m.MessageBox.Action.OK,
                    sap.m.MessageBox.Action.CANCEL
                ],
                onClose: this.onDeleteProductDialogClose.bind(this)
            });
        },

        /**
         * Event handler for the close event of the delete product confirmation dialog.
         *
         * This method is called when the delete product confirmation dialog is closed. If the user confirms the deletion,
         * it removes the product from the model.
         *
         * @function
         * @name yahor.andryieuski.controller.StoreDetails#onDeleteProductDialogClose
         * @memberof yahor.andryieuski.controller.StoreDetails
         * @param {string} sAction The action taken by the user (OK or CANCEL)
         * @public
         * @returns {void}
         */
        onDeleteProductDialogClose: function (sAction) {
            if (sAction === sap.m.MessageBox.Action.OK) {
                const oView = this.getView();
                const oViewModel = oView.getModel("appView");
                const sPath = oViewModel.getProperty("/pathDeleteProduct");

                this.getView().getModel().remove(sPath);

                const oBundle = oView.getModel("i18n").getResourceBundle();
                const sNotification = oBundle.getText("deleteProductNotification");
                MessageToast.show(sNotification);
            }
        },

        /**
         * Event handler for the delete store button press event.
         *
         * This method is triggered when the user clicks the delete store button. It opens a confirmation dialog
         * to confirm the deletion of the store.
         *
         * @function
         * @name yahor.andryieuski.controller.StoreDetails#onDeleteStorePress
         * @memberof yahor.andryieuski.controller.StoreDetails
         * @public
         * @returns {void}
         */
        onDeleteStorePress: function () {
            const oBundle = this.getView().getModel("i18n").getResourceBundle();
            const sConfirmation = oBundle.getText("confirmation");
            const sDeleteStoreConfirmText = oBundle.getText("deleteStoreConfirmText");

            MessageBox.confirm(sDeleteStoreConfirmText, {
                title: sConfirmation,
                actions: [
                    sap.m.MessageBox.Action.OK,
                    sap.m.MessageBox.Action.CANCEL
                ],
                onClose: this.onDeleteStoreDialogClose.bind(this)
            });
        },

        /**
         * Event handler for the close event of the delete store confirmation dialog.
         *
         * This method is called when the user closes the delete store confirmation dialog. If the user confirms
         * the deletion by clicking OK, the method removes the store entry and navigates back to the StoresOverview page.
         *
         * @function
         * @name yahor.andryieuski.controller.StoreDetails#onDeleteStoreDialogClose
         * @memberof yahor.andryieuski.controller.StoreDetails
         * @param {string} sAction - The action performed by the user (OK or CANCEL).
         * @public
         * @returns {void}
         */
        onDeleteStoreDialogClose: function (sAction) {
            if (sAction === sap.m.MessageBox.Action.OK) {
                const oViewModel = this.getView().getModel("appView");
                const sStoreId = oViewModel.getProperty("/storeID");

                StoresModel.deleteStoreById(sStoreId).then(() => {
                    StoresModel.fetchStores().then((aStores) => {
                        this.getView().getModel("storesModel").setProperty("/Stores", aStores);
                    });
                });

                this.oRouter.navTo("StoresOverview");
            }
        },

        /**
         * Event handler for editing a product.
         *
         * This method is called when the user initiates editing of a product. It sets the edit mode to true,
         * prepares the product dialog, and opens it with the details of the selected product for editing.
         *
         * @function
         * @name yahor.andryieuski.controller.StoreDetails#onEditProductPress
         * @memberof yahor.andryieuski.controller.StoreDetails
         * @param {sap.ui.base.Event} oEvent - The event object passed by the framework.
         * @public
         * @returns {void}
         */
        onEditProductPress: function (oEvent) {
            const oView = this.getView();

            const oViewModel = oView.getModel("appView");
            oViewModel.setProperty("/editMode", true);

            this.prepareProductDialog(oView);

            this.pProductDialog.then(() => {
                const oProductContext = oEvent.getSource().getBindingContext();
                const oODataModel = oView.getModel();

                this.oProductDialog.setBindingContext(oProductContext);

                this.oProductDialog.setModel(oODataModel);

                this.oProductDialog.open();
            });
        },

        /**
         * Prepares the product dialog for creation or editing.
         *
         * This method is responsible for loading the product dialog fragment if it's not already loaded,
         * adding the dialog as a dependent to the view, and registering message objects for input validation.
         *
         * @function
         * @name yahor.andryieuski.controller.StoreDetails#prepareProductDialog
         * @memberof yahor.andryieuski.controller.StoreDetails
         * @param {sap.ui.core.mvc.View} oView - The view object where the dialog will be added as a dependent.
         * @public
         * @returns {void}
         */
        prepareProductDialog: function (oView) {
            const oTable = oView.byId("productsTableId");
            oTable.detachUpdateFinished(this.onTableUpdateFinished, this);

            if (!this.oProductDialog) {
                this.pProductDialog = Fragment.load({
                    id: oView.getId(),
                    name: "yahor.andryieuski.view.fragments.CreateProductDialog",
                    controller: this
                }).then((oDialog) => {
                    this.oProductDialog = oDialog;

                    oView.addDependent(this.oProductDialog);

                    Messaging.registerObject(oView.byId("createProductName"), true);
                    Messaging.registerObject(oView.byId("createProductPrice"), true);
                    Messaging.registerObject(oView.byId("createProductSpecs"), true);
                    Messaging.registerObject(oView.byId("createProductRating"), true);
                    Messaging.registerObject(oView.byId("createProductSupplierInfo"), true);
                    Messaging.registerObject(oView.byId("createProductMadeIn"), true);
                    Messaging.registerObject(oView.byId("createProductProdCompany"), true);
                });
            }
        },

        /**
         * Handles the language switch button press event.
         *
         * This method checks the current language and toggles it between English and Russian.
         * It uses the Localization module to set the language accordingly.
         *
         * @function
         * @name yahor.andryieuski.controller.StoreDetails#onSwitchLanguagePress
         * @memberof yahor.andryieuski.controller.StoreDetails
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
