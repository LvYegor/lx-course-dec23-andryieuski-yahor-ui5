sap.ui.define([], function() {
    "use strict";

    const sHostURL = "http://localhost:8000/api/";

    return {

        /**
         * Fetch all stores.
         * @returns {Promise} A promise that resolves with the response data or rejects with an error.
         */
        fetchStores: function () {
            return fetch(sHostURL + "Stores")
                .then(response => response.json())
                .catch(console.error);
        },

        /**
         * Fetch filtered stores based on the provided filter value.
         * @param {string} sFilterValue - The filter value for store names, addresses, or floor areas.
         * @returns {Promise} A promise that resolves with the response data or rejects with an error.
         */
        fetchFilteredStores: function (sFilterValue){
            sFilterValue = !sFilterValue ? " " : sFilterValue;

            const oFilter = {
                "where": {
                    "or": [
                        {"Name": {"ilike": sFilterValue}},
                        {"Address": {"ilike": sFilterValue}},
                        {"FloorArea": sFilterValue}
                    ]
                }
            };
            const oQueryParams = new URLSearchParams({filter: JSON.stringify(oFilter)});
            const sUrlWithParams = `${sHostURL}Stores?${oQueryParams.toString()}`;

            return fetch(sUrlWithParams)
                .then(response => response.json())
                .catch(console.error);
        },

        /**
         * Create a new store.
         * @param {Object} data - The data for the new store.
         * @returns {Promise} A promise that resolves with the response data or rejects with an error.
         */
        createNewStore: function (data){
            const newStore = {
                Name: data.Name.value,
                Email: data.Email.value,
                PhoneNumber: data.PhoneNumber.value,
                Address: data.Address.value,
                Established: data.Date.value,
                FloorArea: data.FloorArea.value
            };
            return fetch(sHostURL + "Stores", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json;charset=utf-8"
                },
                body: JSON.stringify(newStore)
            }).catch(console.error);
        },
    };
});