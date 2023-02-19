(function() {
    'use strict';

    angular
        .module('api-common')
        .factory('UomPressureConverter', UomPressureConverter);

    UomPressureConverter.$inject = [];
    function UomPressureConverter() {
        var service = {
            inHg: inHg,
            kPa: kPa
        };
        return service;

        /////////////////////////////////////////////
        function inHg(kPa, roundMethod) {
            if (!kPa) {
                return null;
            }

            var value = kPa * 0.2952998751;
            switch (roundMethod) {
                case 'round':
                    return Math.round(value);
                case 'floor':
                    return Math.floor(value);
                case 'ceil':
                    return Math.ceil(value);
                default:
                    return value;
            }
        }

        function kPa(inHg, roundMethod) {
            if (!inHg) {
                return null;
            }

            var value = inHg * 3.38638816;
            switch (roundMethod) {
                case 'round':
                    return Math.round(value);
                case 'floor':
                    return Math.floor(value);
                case 'ceil':
                    return Math.ceil(value);
                default:
                    return value;
            }
        }
    }
})();