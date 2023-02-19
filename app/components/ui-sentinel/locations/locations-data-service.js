(function () {
    'use strict';

    angular
        .module('ui-sentinel.locations')
        .factory('LocationsDataService', LocationsDataService);

    LocationsDataService.$inject = ['$rootScope', 'SentinelUiSession','LocationService',  'FeedbackService'];
    function LocationsDataService( $rootScope, SentinelUiSession, LocationService,  FeedbackService) {
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

            var promise = LocationService.getLocations(SentinelUiSession.focus).$promise;
            promise.then(
                function(result) {
                    service.all = result;
                    $rootScope.loading = false;
                },
                function (error) {
                    service.feedback.addError(error.data.message);
                    $rootScope.loading = false;
                }
            );

            
        }
    }
})();
