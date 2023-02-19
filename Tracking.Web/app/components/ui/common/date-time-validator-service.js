(function() {
    'use strict';

    angular
        .module('tracking.ui.common')
        .factory('DatetimeValidatorService', DatetimeValidatorService);

    DatetimeValidatorService.$inject = [];
    function DatetimeValidatorService() {
        var _24Hours = 'H:i';
        var _12Hours = 'h:i A';
        var reg12 = /^([0]\d|[1][0-2]):([0-5]\d)\s?(?:AM|PM)$/i;
        var reg24 = /^([0-1]\d|[2][0-3]):([0-5]\d)$/i;

        var service = {
            localTimeFormat: localTimeFormat,
            toMoment: toMoment,
            dateError: null,
            timeError: null
        };
        return service;

        /////////////////////////////////////////////
        function isValidDate(date) {
            service.dateError = null;

            if (!date) {
                service.dateError = 'date is required';
                return false;
            }

            if (!moment(date, 'L').isValid()) {
                service.dateError = 'date is not a valid date';
                return false;
            }

            return true;
        }

        function isValidTime(time) {
            service.timeError = null;

            if (!time) {
                service.timeError = 'time is required';
                return false;
            }

            var regex = localTimeFormat() === _12Hours ? reg12 : reg24;
            if (!regex.test(time)) {
                service.timeError = 'time is not a valid format';
                return false;
            }

            return true;
        }

        function localTimeFormat() {
            var now = moment().format('LT');

            if (now.toLowerCase().indexOf('m') > -1) {
                return _12Hours;
            }

            return _24Hours;
        }

        function toMoment(date, time) {
            if (!isValidDate(date) || !isValidTime(time)) {
                return null;
            }

            return moment(date + ' ' + time, "L " + localTimeFormat());
        }

    }
})();