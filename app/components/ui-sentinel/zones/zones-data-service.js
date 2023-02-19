(function () {
    'use strict';

    angular
        .module('ui-sentinel.zones')
        .factory('ZonesDataService', ZonesDataService);

    ZonesDataService.$inject = ['$rootScope', 'SentinelUiSession',  'FeedbackService','ZoneService'];
    function ZonesDataService( $rootScope, SentinelUiSession,  FeedbackService, ZoneService) {
        var service = {
            all: [],
            feedback: FeedbackService,
            load: load
        };
        activate();
        return service;
        
        ////////////////////////
        
        function activate() {
            load();
        }

        function load() {
            service.all = [];
            $rootScope.loading = true;

            var zonePromise = ZoneService.getZones(SentinelUiSession.focus).$promise;
            zonePromise.then(
                function(result) {
                    $rootScope.loading = false;
                    service.all = result;
                },
                function (error) {
                    $rootScope.loading = false;
                    service.feedback.addError(error.data.message);
                }
            );

            
        }
    }
})();