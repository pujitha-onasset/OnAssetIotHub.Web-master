(function() {
    'use strict';

    angular
        .module('api-common')
        .factory('UomSecondsConverter', UomSecondsConverter);

    UomSecondsConverter.$inject = [];
    function UomSecondsConverter() {
        var secondsInAMinute = 60;
        var secondsInAnHour = secondsInAMinute * 60;
        var secondsInADay = secondsInAnHour * 24;

        var service = {
            format: formatSeconds
        };
        return service;

        /////////////////////////////////////////////

        function formatSeconds (seconds) {
            if (Number.isNaN(seconds)) {
                return null;
            }
            
            var result = null;
            var units = 1;
            if (seconds > secondsInADay) {
                units = Math.floor(seconds / secondsInADay);
                seconds = seconds - (units * secondsInADay);

                result = units + 'd';
            }

            if (seconds > secondsInAnHour) {
                units = Math.floor(seconds / secondsInAnHour);
                seconds = seconds - (units * secondsInAnHour);

                result =  (result ? result + ' ' : '') + units + 'h';
            }

            if (seconds > 0) {
                units = Math.floor(seconds / secondsInAMinute);
                result =  (result ? result + ' ' : '') + units + 'm';
            }

            return result;
        }


    }
})();