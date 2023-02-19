(function () {
    'use strict';

    angular
        .module('ui-sentinel.geofences')
        .factory('GeofencesDataService', GeofencesDataService);

    GeofencesDataService.$inject = ['$rootScope', 'SentinelUiSession', 'PolygonGeofencesService', 'RadialGeofencesService','RlsUiSession', 'FeedbackService', 'localStorageService'];
    function GeofencesDataService( $rootScope, SentinelUiSession, PolygonGeofencesService, RadialGeofencesService,RlsUiSession, FeedbackService, localStorageService) {
        var service = {
            all: [],
            radials: [],
            polygons: [],
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

            var focus = localStorageService.get('isRlsRoute') ? RlsUiSession.focus : SentinelUiSession.focus;

            var radialPromise = RadialGeofencesService.getGeofences(focus).$promise;
            radialPromise.then(
                function(result) {
                    service.radials = [];
                    _.forEach(result, function(geofence) {
                        _.remove(service.all, function(dupe) {
                            return dupe.id === geofence.id;
                        });
                        service.all.push(geofence);
                        service.radials.push(geofence);
                    });
                },
                function (error) {
                    service.feedback.addError(error.data.message);
                }
            );

            var polygonPromise = PolygonGeofencesService.getGeofences(focus).$promise;
            polygonPromise.then(
                function(result) {
                    service.polygons = [];
                    _.forEach(result, function(geofence) {
                        _.remove(service.all, function(dupe) {
                            return dupe.id === geofence.id;
                        });
                        service.all.push(geofence);
                        service.polygons.push(geofence);
                    });
                },
                function (error) {
                    service.feedback.addError(error.data.message);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }
    }
})();