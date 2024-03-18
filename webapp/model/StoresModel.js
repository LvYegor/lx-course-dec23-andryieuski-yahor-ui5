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
                established: data.established,
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

        /**
         * Create a new product for the current store.
         * @param {Object} data - The data for the new product.
         * @returns {Promise} A promise that resolves with the response data or rejects with an error.
         */
        createNewProduct: function (data){
            const newProduct = {
                name: data.name,
                price: data.price,
                specs: data.specs,
                rating: data.rating,
                supplier_info: data.supplier_info,
                made_in: data.made_in,
                production_company_name: data.production_company_name,
                status: data.status,
                store: data.store
            };
            return fetch(sHostURL + "products/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json;charset=utf-8"
                },
                body: JSON.stringify(newProduct)
            }).catch(console.error);
        },

        /**
         * Update a product by ID.
         * @param {Object} data - The updated data for the product.
         * @param {number} productId - The ID of the product to update.
         * @returns {Promise} A promise that resolves with the response data or rejects with an error.
         */
        updateProduct: function (data, productId){
            const newProduct = {
                name: data.name,
                price: data.price,
                specs: data.specs,
                rating: data.rating,
                supplier_info: data.supplier_info,
                made_in: data.made_in,
                production_company_name: data.production_company_name,
                status: data.status,
                store: data.store
            };
            return fetch(sHostURL + `products/${productId}/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json;charset=utf-8"
                },
                body: JSON.stringify(newProduct)
            }).catch(console.error);
        },

        fetchStoreProductsById: function (id) {
            return fetch(sHostURL + `stores/${id}/products/`)
                .then(response => response.json())
                .catch(console.error);
        },

        /**
         * Fetch filtered products for a specific store based on various parameters.
         * @param {number} storeId - The ID of the store.
         * @param {string|null} inputValue - The input value for filtering product attributes.
         * @param {string|null} filterStatus - The status for filtering products.
         * @param {string|null} orderBy - The field to use for sorting products.
         * @returns {Promise} A promise that resolves with the response data or rejects with an error.
         */
        fetchFilteredStoreProductsById: function (
            storeId,
            inputValue = null,
            filterStatus = null,
            orderBy = null
        ) {
            const queryParams = new URLSearchParams(
                {
                    search: inputValue,
                    status: filterStatus,
                    ordering: orderBy
                }
            );
            const urlWithParams = `${sHostURL}stores/${storeId}/products?${queryParams.toString()}`;

            return fetch(urlWithParams)
                .then(response => response.json())
                .catch(console.error);
        },

        /**
         * Delete a store by ID.
         * @param {number} id - The ID of the store to delete.
         * @returns {Promise} A promise that resolves with the response data or rejects with an error.
         */
        deleteStoreById: function (id) {
            return fetch(sHostURL + `stores/${id}`, {method: "DELETE"}).catch(console.error);
        },

        /**
         * Delete a product from the current store by ID.
         * @param {number} id - The ID of the product to delete.
         * @returns {Promise} A promise that resolves with the response data or rejects with an error.
         */
        deleteProductFromStoreById: function (id){
            return fetch(sHostURL + `products/${id}`, {method: "DELETE"}).catch(console.error);
        },

        fetchProductById: function (id) {
            return fetch(sHostURL + `products/${id}`)
                .then(response => response.json())
                .catch(console.error);
        },

        fetchProductCommentsById: function (id) {
            return fetch(sHostURL + `products/${id}/comments/`)
                .then(response => response.json())
                .catch(console.error);
        },

        createNewComment: function (data){
            const newComment = {
                author: data.author,
                message: data.message,
                rating: data.rating,
                product: data.product,
            };
            return fetch(sHostURL + "comments/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json;charset=utf-8"
                },
                body: JSON.stringify(newComment)
            }).catch(console.error);
        },
    };
});