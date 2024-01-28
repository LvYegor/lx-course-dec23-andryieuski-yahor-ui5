/**
 * Custom email type for validation and formatting of email addresses.
 * Extends the SimpleType class.
 * @class CustomEmailType
 * @extends sap.ui.model.SimpleType
 */
sap.ui.define([
    "sap/ui/model/SimpleType",
    "sap/ui/model/ValidateException"
], function (SimpleType, ValidateException) {
    return SimpleType.extend("CustomEmailType", {

        /**
         * Formats the email value.
         *
         * @function
         * @param {string} sValue - The email value to format.
         * @returns {string} The formatted email value.
         */
        formatValue: function (sValue) {
            return sValue;
        },

        /**
         * Parses the email value.
         *
         * @function
         * @param {string} sValue - The email value to parse.
         * @returns {string} The parsed email value.
         */
        parseValue: function (sValue) {
            return sValue;
        },

        /**
         * Validates the email value.
         *
         * @function
         * @param {string} sValue - The email value to validate.
         * @throws {sap.ui.model.ValidateException} Throws a validation exception if the email is not valid.
         */
        validateValue: function (sValue) {
            const rexMail = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
            if (!sValue.match(rexMail)) {
                throw new ValidateException();
            }
        }
    });
});
