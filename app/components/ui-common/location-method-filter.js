(function () {
    'use strict';

    angular
        .module('ui-common')
        .filter('locationMethod', LocationMethodFilter);

    function LocationMethodFilter() {
        return function (locationMethod, latitude, longitude) {
            /*var mapLocationMethod = 'None';

            if (typeof locationMethod == "string") {
                locationMethod = locationMethod.toLowerCase();

                if (locationMethod  === 'none (low battery)') {
                    mapLocationMethod = 'None';
                } else if(locationMethod  === 'standalone' || locationMethod == "device based (net assist)") {
                    mapLocationMethod = 'Gps';
                } else if(locationMethod  === 'network based' || locationMethod == "network/device combo") {
                    mapLocationMethod = 'Network';
                }
            }

            if (mapLocationMethod == 'None' && typeof latitude == "number" && typeof longitude == "number") {
                mapLocationMethod = (latitude == 0 && longitude == 0) ? 'None' : 'Network';
            }

            return mapLocationMethod;*/
            return (locationMethod && locationMethod!=='') ? locationMethod : 'None';       
         };
    }

})();