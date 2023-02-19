(function() {
    'use strict';

    angular
        .module('ui-sentinel.locations')
        .controller('LocationDetailsController', LocationDetailsController);

    LocationDetailsController.$inject = ['$rootScope', '$scope', '$state', '$stateParams', 'SentinelUiSession', 'localStorageService','LocationService','FeedbackService'];
    function LocationDetailsController($rootScope, $scope, $state, $stateParams, SentinelUiSession, localStorageService, LocationService, FeedbackService) {
       

        var vm = {
            
            location: null,
            zones: [],
            feedback: FeedbackService
         
        };
        activate();
        return vm;

        ////////////////////////////////////////////

        function activate() {
            
            vm.feedback.clear();
            if ($stateParams.locationId) {
                load();
            }
        }

        

        function load() {
            $rootScope.loading = true;
            var promise = LocationService.getLocation(SentinelUiSession.focus,$stateParams.locationId).$promise;
            promise.then(
                function(result) {
                	console.log("Location",result);
                    vm.location = result;
                },
                function (error) {
                    if (error.status !== 404) {
                        vm.feedback.addError(error);
                    }
                }
            );
            var promiseZones = LocationService.getLocationAssetsZonesBuffer(SentinelUiSession.focus,$stateParams.locationId).$promise;
            promiseZones.then(
                function(result) {
                    $rootScope.loading = false;
                    console.log("result",result);
                    vm.zones = [];
                     var sightingNumber = [];
                    _.forEach(result,function(zone){
                       if(!sightingNumber[zone.imei])
                            sightingNumber[zone.imei] = 1;
                        else
                            sightingNumber[zone.imei] += 1;
                        _.forEach(zone.sentinels,function(asset){
                            vm.zones.push({
                                "zone":zone.zoneName + "(" + zone.imei + ")",
                                "timeOfReport":zone.sentryStatus.timeOfReport,
                                "sightingNumber":sightingNumber[zone.imei],
                                "asset":asset.assetName + "(" + asset.mac + ")",
                                "rssi":asset.rssi,
                                "IsZoneAssigned":asset.isZoneAssigned
                            });
                        });
                    });
                    
                },
                function (error) {
                    $rootScope.loading = false;
                    if (error.status !== 404) {
                        vm.feedback.addError(error);
                    }
                }
            );
        }

    }
})();
