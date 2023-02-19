(function () {
    'use strict';

    angular
        .module('ui-common')
        .filter('batteryPercentage', BatteryPercentageFilter);

    function BatteryPercentageFilter() {
        var SOC_MIN=0;
        var SOC_MAX=100;
        var V_MIN=21;
        var V_MAX=35;

        return function (voltage, decimals) {
            voltage = voltage * 10;

            if (voltage == 255) {
                return null;
            }

            if (voltage < V_MIN) {
                return SOC_MIN;
            }

            var percent = SOC_MIN + (voltage - V_MIN) * (SOC_MAX - SOC_MIN) / (V_MAX - V_MIN);

            if (percent > SOC_MAX) {
                return SOC_MAX;
            } else {
                return (decimals == 1) ?  Math.round(percent * 10) / 10 : Math.round(percent * 100) / 100;
            }
        };
    }

})();