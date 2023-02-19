(function() {
    'use strict';

    angular
        .module('ui-sentinel.simulators')
        .factory('SeparationSelectionService', SeparationSelectionService);

    SeparationSelectionService.$inject = [];
    function SeparationSelectionService() {
        var sentry = null;
        var sentinels = [];

        var service = {
            getSentry: function() { return sentry; },
            getSentinels: function() { return _.clone(sentinels); },
            setSentry: setSentry,
            addSentinel: addSentinel,
            removeSentinel: removeSentinel,
            clear: clear
        };

        return service;

        ///////////////////////////

        function setSentry(imei) {
            sentry = imei;
            console.log(sentry);
        }

        function addSentinel(mac) {
            if (!mac || _.indexOf(sentinels, function(m) { return m === mac;}) > -1) {
                return;
            }

            sentinels.push(mac);
            sentinels.sortBy(sentinels, function (m) { return m; });
            console.log(sentinels);
        }

        function removeSentinel(mac) {
            if (!mac) {
                return;
            }

            _.remove(sentinels, function(m) { return m === mac;});
            console.log(sentinels);
        }

        function clear() {
            sentry = null;
            sentinels = [];
            console.log(sentry);
            console.log(sentinels);
        }
    }

})();

