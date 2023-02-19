(function() {
    'use strict';

    angular
        .module('api-common')
        .factory('UomDistanceConverter', UomDistanceConverter);

    UomDistanceConverter.$inject = [];
    function UomDistanceConverter() {
        var service = {
            metersToFeet: metersToFeet,
            metersToKilometers: metersToKilometers,
            metersToMiles: metersToMiles,
            feetToMeters: feetToMeters,
            kilometersToMeters: kilometersToMeters,
            milesToMeters: milesToMeters
        };
        return service;

        /////////////////////////////////////////////

        function round(value, roundMethod, precision) {
            switch (roundMethod) {
                case 'round':
                    return Math.round(value * precision) / precision;
                case 'floor':
                    return Math.floor(value * precision) / precision;
                case 'ceil':
                    return Math.ceil(value * precision) / precision;
                default:
                    return value;
            }
        }

        function metersToFeet(meters, roundMethod) {
            if (typeof meters === 'undefined' || meters === null) {
                return null;
            }

            return round(meters / 0.3048, roundMethod, 1);

        }

        function metersToKilometers(meters, roundMethod) {
            if (typeof meters === 'undefined' || meters === null) {
                return null;
            }

            return round(meters / 1000, roundMethod, 10);
        }

        function metersToMiles(meters, roundMethod) {
            if (typeof meters === 'undefined' || meters === null) {
                return null;
            }

            return round(meters / 1609.34, roundMethod, 10);
        }

        function feetToMeters(feet, roundMethod) {
            if (typeof feet === 'undefined' || feet === null) {
                return null;
            }

            return round(feet * 0.3048, roundMethod, 1);
        }


        function kilometersToMeters(kilometers, roundMethod) {
            if (typeof kilometers === 'undefined' || kilometers === null) {
                return null;
            }

            return round(kilometers * 1000, roundMethod, 1);
        }

        function milesToMeters(miles, roundMethod) {
            if (typeof miles === 'undefined' || miles === null) {
                return null;
            }

            return round(miles * 1609.34, roundMethod, 1);
        }
    }
})();