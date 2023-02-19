(function () {
    'use strict';

    angular
        .module('ui-sentinel.shipments.shipmentStopRow')
        .directive('shipmentStopRow', ShipmentStopRowDirective);

    function ShipmentStopRowDirective() {
        var directive = {
            restrict: 'A',
            scope: {
                label: '@',
                stop: '=',
                geofences: '=',
                optional: '@',
                removable: '@',
                editable: '@'
            },
            controller: ThisDirectiveController,
            controllerAs: 'shipmentStopRow',
            bindToController: true,
            templateUrl: 'ui-sentinel-shipments.shipmentStopRow/shipment-stop-row-directive.html',
            link: link
        };
        return directive;

        function link(scope, element, attributes, controller) {
            if (controller.stop.type === 'address' && controller.stop.address.value) {
                var geoCoder = new google.maps.Geocoder();
                geoCoder.geocode({ 'address': controller.stop.address.value}, function (results, status) {
                    if (status === google.maps.GeocoderStatus.OK && results.length === 1) {
                        controller.stop.locationSearch.location = results[0];
                        controller.stop.locationSearch.value = controller.stop.locationSearch.location.formatted_address;
                        controller.stop.address.value = controller.stop.locationSearch.location.formatted_address;
                        scope.$apply();
                    }
                });
                return;
            }

            controller.stop.address.isChanging = (controller.stop.type === 'address' && !controller.stop.address.value);
            controller.stop.geofence.isChanging = (controller.stop.type === 'geofence' && !controller.stop.geofence.name);
        }
    }

    ThisDirectiveController.$inject = ['$rootScope', '$scope','FeedbackService'];
    function ThisDirectiveController($rootScope, $scope, FeedbackService) {
        var vm = {
            feedback: FeedbackService,
            geofenceLimit: 5,
            geofenceFilterText: null,
            isRemovable: isRemovable,
            isOptional: isOptional,
            isReadOnly: isReadOnly,
            geofenceFilter: geofenceFilter,
            actions: {
                getLocations: getLocations,
                clearLocation: clearLocation,
                selectLocation: selectLocation,
                selectGeofence: selectGeofence,
                clearGeofence: clearGeofence,
                changeStopType: changeStopType,
                remove: remove
            }
        }; 
        return vm;

        ////////////////////////////////////////////////////////////////////////////
        
        function changeStopType() {
            clearLocation();
            clearGeofence();
        }
        
        function clearLocation() {
            vm.stop.address.isChanging = true;
            vm.stop.address.isPristine = true;
            vm.stop.address.value = null;

            vm.stop.locationSearch.isPristine = true;
            vm.stop.locationSearch.location = null;
            vm.stop.locationSearch.availableLocations = [];
        }

        function clearGeofence() {
            vm.stop.geofence.isChanging = true;
            vm.stop.geofence.isPristine = true;
            vm.stop.geofence.name = null;
            vm.stop.geofence.value = null;
        }

        function geofenceFilter(geofence) {
            if (!vm.geofenceFilterText || vm.geofenceFilterText.trim() === '') {
                return true;
            }

            var text = vm.geofenceFilterText.trim().toLowerCase();

            return ((geofence.name.toLowerCase().indexOf(text) > -1) ||
                (geofence.address.toLowerCase().indexOf(text) > -1));
        }

        function getLocations() {
            vm.stop.locationSearch.isPristine = true;
            vm.stop.locationSearch.availableLocations = [];

            if (!vm.stop.locationSearch.value) {
                vm.stop.locationSearch.isPristine = false;
                return;
            }

            var geoCoder = new google.maps.Geocoder();
            geoCoder.geocode({ 'address': vm.stop.locationSearch.value}, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (results.length === 1) {
                        selectLocation(results[0]);
                    }
                    else {
                        vm.stop.locationSearch.availableLocations = results;
                    }
                }
                else {
                    vm.stop.locationSearch.isPristine = false;
                    vm.stop.locationSearch.location = null;
                    vm.stop.locationSearch.errors.hasZeroResults = true;
                }

                $scope.$apply();
            });
        }

        function isRemovable() {
            return vm.removable && vm.removable === 'true';
        }

        function isOptional() {
            return vm.optional && vm.optional === 'true';
        }

        function isReadOnly() {
            return vm.editable && vm.editable === 'true';
        }

        function selectLocation(location) {
            vm.stop.locationSearch.isPristine = true;
            vm.stop.locationSearch.location = location;

            vm.stop.address.isPristine = true;
            vm.stop.address.value = location.formatted_address;
            vm.stop.address.isChanging = false;

            if(vm.stop.destinationId && vm.stop.destinationId>0)
                $rootScope.$broadcast('SHIPMENT_STOP_EDITED', { stop: vm.stop });
            else
                $rootScope.$broadcast('SHIPMENT_STOP_ADDED', { stop: vm.stop });
        }

        function selectGeofence(geofence) {
            console.log("vm.stop",vm.stop);
            vm.geofenceFilterText = null;
            vm.stop.geofence.value = geofence;
            vm.stop.geofence.name = geofence.name;
            vm.stop.geofence.isPristine = true;
            vm.stop.geofence.isChanging = false;
            if(vm.stop.destinationId && vm.stop.destinationId>0)
                $rootScope.$broadcast('SHIPMENT_STOP_EDITED', { stop: vm.stop });
            else
                $rootScope.$broadcast('SHIPMENT_STOP_ADDED', { stop: vm.stop });
        }

        function remove() {
            $rootScope.$broadcast('SHIPMENT_STOP_REMOVED', { index: vm.stop.stopId, destinationId: vm.stop.destinationId });
        }
    }
})();