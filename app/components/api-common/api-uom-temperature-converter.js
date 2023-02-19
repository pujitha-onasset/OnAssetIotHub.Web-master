(function() {
    'use strict';

    angular
        .module('api-common')
        .factory('UomTemperatureConverter', UomTemperatureConverter);

    UomTemperatureConverter.$inject = [];
    function UomTemperatureConverter() {
        var service = {
            celsius: celsius,
            fahrenheit: fahrenheit
        };
        return service;

        /////////////////////////////////////////////
        function celsius(fahrenheit, roundMethod) {
            if (typeof fahrenheit === 'undefined' || fahrenheit === null) {
                return null;
            }

            var value = (fahrenheit - 32) / 1.8;
            switch (roundMethod) {
                case 'round':
                    return Math.round(value * 100) / 100;
                case 'floor':
                    return Math.floor(value * 100) / 100;
                case 'ceil':
                    return Math.ceil(value * 100) / 100;
                default:
                    return value;
            }
        }

        function fahrenheit(celsius, roundMethod) {
            if (typeof celsius === 'undefined' || celsius === null) {
                return null;
            }

            var value = (celsius * 1.8) + 32;
            switch (roundMethod) {
                case 'round':
                    return Math.round(value * 100) / 100;
                case 'floor':
                    return Math.floor(value * 100) / 100;
                case 'ceil':
                    return Math.ceil(value * 100) / 100;
                default:
                    return value;
            }
        }
    }
})();