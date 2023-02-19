(function () {
    'use strict';

    angular
        .module('ui-sentinel.locations')
        .directive('locationZones', locationZonesDirective);

    function locationZonesDirective() {
        var directive = {
            restrict: 'A',
            scope: {
              location: '='
            },
            controller: ThisDirectiveController,
            controllerAs: 'locationZones',
            bindToController: true,
            templateUrl: 'ui-sentinel-locations/location-zones-directive.html',
            link: link
        };
        return directive;

        function link(scope, element, attrs, controller) {
            // scope.$watch(
            //     function(scope) {
            //         return scope.geofenceAdmin.geofence;
            //     },
            //     function (newValue, oldValue) {
            //         controller.geofence = newValue;
            //     }, true
            // );
        }
    }

    ThisDirectiveController.$inject = ['$scope','$rootScope','$state',  'FeedbackService', 'SentinelUiSession','ZoneService'];
    function ThisDirectiveController($scope, $rootScope, $state, FeedbackService, SentinelUiSession, ZoneService) {
        var vm = {
            // geofence: null,
            zones: null,
            panel: {
                isCollapsed: true,
                toggle: function (locationId) {
                    this.isCollapsed = !this.isCollapsed;
                    if (!this.isCollapsed) { load(locationId); }
                }
            },
            hasPermission: {
                toChangeAlarms: false
            },
            feedback: FeedbackService,
            actions: {
                goToZone: goToZone,
                gotoNewZone: gotoNewZone,
                reload: load
            }
        };
        activate();
        return vm;

        function activate() {
            setPermissions();
        }

        function load(locationId) {
            vm.zones = null;
            $rootScope.loading = true;
            var promise = ZoneService.getZonesByLocation(SentinelUiSession.focus,locationId ).$promise;
            promise.then(
                function(result) {
                    $rootScope.loading = false;
                    vm.zones = result;
                },
                function (error) {
                    $rootScope.loading = false;
                   vm.feedback.addError(error.data.message);
                }
            );
        }

        function goToZone(zoneId) {
            var returnState = $state.current.name;
            var returnStateParams = $state.params;
            $state.go('zone.admin', { zoneId: zoneId, referrer: returnState, referrerParams: returnStateParams } );
        }
        
        function gotoNewZone(locationId) {
            console.log("gotoNewZone");
            var returnState = $state.current.name;
            var returnStateParams = $state.params;
            $state.go('zone.new', { locationId: locationId, referrer: returnState, referrerParams: returnStateParams } );
        }

        function setPermissions() {
            vm.hasPermission.toChangeAlarms =
                SentinelUiSession.user.isSystemAdmin || 
                SentinelUiSession.user.isAccountAdmin ||
                SentinelUiSession.user.isAccountEditor;
        }

    }

})();
