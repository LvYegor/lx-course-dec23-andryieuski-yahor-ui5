sap.ui.define([], function() {
    "use strict";

    const sHostURL = "http://localhost:8000/api/";

    return {

        /**
         * Fetch all stores.
         * @returns {Promise} A promise that resolves with the response data or rejects with an error.
         */
        fetchStores: function () {
            return fetch(sHostURL + "stores")
                .then(response => response.json())
                .catch(console.error);
        },

        fetchStoreById: function (id) {
            return fetch(sHostURL + `stores/${id}`)
                .then(response => response.json())
                .catch(console.error);
        },

        /**
         * Fetch filtered stores based on the provided filter value.
         * @param {string} sFilterValue - The filter value for store names, addresses, or floor areas.
         * @returns {Promise} A promise that resolves with the response data or rejects with an error.
         */
        fetchFilteredStores: function (sFilterValue){
            const sUrlWithParams = `${sHostURL}stores/?search=${sFilterValue}`;

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
                name: data.name,
                email: data.email,
                phone_number: data.phone_number,
                address: data.address,
                // established: data.established,
                established: "2024-01-01",
                floor_area: data.floor_area
            };

            return fetch(sHostURL + "stores/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json;charset=utf-8"
                },
                body: JSON.stringify(newStore)
            }).catch(console.error);
        },

        fetchStoreProductsById: function (id) {
            return fetch(sHostURL + `stores/${id}/products/`)
                .then(response => response.json())
                .catch(console.error);
        },
    };
});