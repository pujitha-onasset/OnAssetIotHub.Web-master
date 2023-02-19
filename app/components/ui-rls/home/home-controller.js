(function() {
    'use strict';

    angular
        .module('ui-rls.home')
        .controller('RlsHomeController', RlsHomeController);

    RlsHomeController.$inject = ['$rootScope', '$state', '$stateParams', 'RlsUiSession', 'GlobalSearchService', 'FeedbackService'];
    function RlsHomeController($rootScope, $state, $stateParams, RlsUiSession, GlobalSearchService, FeedbackService) {
        var vm = {
            counts: {
                activeShipments: -1,
                locations: -1,
                devices: -1
            },
            shipments: [],
            devices: [],
            locations: [],
            showFindButton: false,
            feedback: FeedbackService,
            session:RlsUiSession,
            deviceSearch: {
                text: null,
                results: null,
                isPristine: true,
                errors: {
                    isBlank: true,
                    isNotFound: false
                },
                hasError: function () {
                    return this.errors.isBlank || this.errors.isNotFound;
                },
                filter: filterDevices
            },
            location: {
                text: null,
                results: null,
                isPristine: true,
                errors: {
                    isBlank: true,
                    isNotFound: false
                },
                hasError: function () {
                    return this.errors.isBlank || this.errors.isNotFound;
                },
                submit: onlocationClick,
                showFilteredList: false,
                filter: filterlocations,
                submitlocation: submitlocation
                
            },
            shipmentSearch: {
                text: null,
                results: null,
                isPristine: true,
                errors: {
                    isBlank: true,
                    isNotFound: false
                },
                hasError: function () {
                    return this.errors.isBlank || this.errors.isNotFound;
                }
            },
            beginShipmentSearch: beginShipmentSearch,
            beginDeviceSearch: beginDeviceSearch,
            beginlocationsearch: beginlocationsearch,
            goToShipmentAdmin: goToShipmentAdmin,
            goToShipmentMap: goToShipmentMap,
            goToShipmentReports: goToShipmentReports,
            goToLocationAdmin: goToLocationAdmin,
            goToDeviceAdmin: goToDeviceAdmin,
            goToDeviceMap: goToDeviceMap,
            goToDeviceReports: goToDeviceReports,
            searchAllDevices: searchAllDevices,
            searchShipments: searchShipments,
            searchLocations: searchLocations,
            hasPermissionTo: {
                createShipment: false
            },
            showAllDevices: false,
        };
        init();
        return vm;

        function init() {
            setPermissions();

            $rootScope.$on('CLIENT_FOCUS_CHANGED', function (event, args) {
                if ($rootScope.$state.current.name == 'home') {
                    updateCounts();
                    updateShowFindButton();
                }
            });

            $rootScope.$on('$stateChangeSuccess', function (event, args) {
                if ($rootScope.$state.current.name == 'home') {
                    updateCounts();
                    updateShowFindButton();
                }
            });

            updateCounts();
            updateShowFindButton();
        }
        
        function beginDeviceSearch() {
            vm.deviceSearch.isPristine = true;
            vm.location.showFilteredList = false;
            vm.location.text = null;
            vm.shipmentSearch.text = null;
            vm.shipments = [];
            vm.locations = [];
        }

        function beginlocationsearch() {
            vm.location.isPristine = true;
            vm.location.showFilteredList = false;
            vm.deviceSearch.text = null;
            vm.shipmentSearch.text = null;
            vm.shipments = [];
            vm.devices = [];
        }

        function beginShipmentSearch() {
            vm.shipmentSearch.isPristine = true;
            vm.location.showFilteredList = false;
            vm.deviceSearch.text = null;
            vm.location.text = null;
            vm.locations = [];
            vm.devices = [];
        }

        function filterDevices(device) {
            if (!vm.deviceSearch.text) {
                return false;
            }
            var searchText = vm.deviceSearch.text.toString().toLowerCase();

            return device.deviceTagId.indexOf(searchText) > -1 || device.deviceName.toLowerCase().indexOf(searchText) > -1;
        }

        function filterlocations(device) {
            if (!vm.location.text) {
                return false;
            }

            return device.deviceTagId.indexOf(vm.location.text.toString().toLowerCase()) > -1;
        }

        function setPermissions() {
            vm.hasPermissionTo.createShipment = RlsUiSession.user.isSystemAdmin || RlsUiSession.user.isAccountAdmin || RlsUiSession.user.isAccountEditor;
        }

        function goToDeviceAdmin(device) {
            if (device) {
                if(device.deviceDescription === 'Sentry')
                	$state.go('sentry-configs.by-device',{ imei: device.tagId, referrer: 'home'  });
            }
        }

        function goToDeviceMap(device) {
            if (device) {
                $state.go('device.map',{ deviceTagId: device.tagId, referrer: 'home'  });
            }
        }

        function goToDeviceReports(device) {
            if (device) {
            	if(device.deviceDescription === 'Sentry')
                	$state.go('sentry-reports.by-device',{ imei: device.tagId, referrer: 'home'  });
                else
                	$state.go('sightings.of-mac',{ mac: device.tagId, referrer: 'home'  });
            }
        }        

        function goToShipmentAdmin(shipment) {
            if (shipment) {
                $state.go('shipment.admin',{ shipmentId: shipment.shipmentId, referrer: 'home' });
            }
        }

        function goToLocationAdmin(location) {
            if (location) {
                $state.go('location.admin',{ locationId: location.id });
            }
        }


        function goToShipmentMap(shipment) {
            if (shipment) {
                $state.go('shipment.map',{ shipmentId: shipment.shipmentId, referrer: 'home'  });
            }
        }

        function goToShipmentReports(shipment) {
            if (shipment) {
                $state.go('shipment.reports',{ shipmentId: shipment.shipmentId, referrer: 'home'  });
            }
        }
        
        function onlocationClick() {
            vm.location.showFilteredList = false;
            vm.location.isPristine = false;
            vm.location.errors.isNotFound = false;
            vm.location.errors.isBlank = !vm.location.text;

            if (vm.location.errors.isBlank) {
                return;
            }

            var returningDevice = _.find(vm.locations, function(device) {
                return device.deviceTagId === vm.location.text;
            });

            if (returningDevice) {
                submitlocation(returningDevice.deviceTagId);
                return;
            }

            vm.location.showFilteredList = true;

        }
        
        function submitlocation(deviceTagId) {
            var promise = VisionApiReverseLogisticsService.location(deviceTagId).$promise;
            promise.then(
                function(result) {
                    vm.feedback.addSuccess(deviceTagId + ' has been returned successfully');
                    updateReturningDeviceCount();
                },
                function (error) {
                    if (error.status === -1) {
                        vm.feedback.addError('Unable to connect to server.  Please try again later.');
                        return;
                    }

                    if (error.status === 404) {
                        vm.location.errors.isNotFound = true;
                        return;
                    }

                    vm.feedback.addError(error.data.message);
                }
            );
        }
        
        function updateCounts() {
        	$rootScope.loading = true;
            var promise = GlobalSearchService.GetSearchCountItemsByType(RlsUiSession.focus).$promise;
            promise.then(
                function (results) {
                	$rootScope.loading = false;
                    vm.counts.activeShipments = results.shipmentSearchCount;
                    vm.counts.locations = results.locationSearchCount;
                	vm.counts.devices = results.deviceSearchCount;
                },
                function (error) {
                	$rootScope.loading = false;
                    vm.feedback.addError(error.data.message);
                }
            );
            
        }

        function searchShipments(){
        	if(!vm.shipmentSearch.text){
        		return;
        	}

        	vm.shipments = [];

        	$rootScope.loading = true;
        	var promise = GlobalSearchService.ShipmentSearch(RlsUiSession.focus, vm.shipmentSearch.text).$promise;
            promise.then(
                function (results) {
                	console.log("searchShipments results",results);
                	$rootScope.loading = false;
                    vm.shipments = results;
                },
                function (error) {
                	$rootScope.loading = false;
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function searchLocations(){
        	if(!vm.location.text){
        		return;
        	}

        	vm.locations = [];

        	$rootScope.loading = true;
        	var promise = GlobalSearchService.LocationSearch(RlsUiSession.focus, vm.location.text).$promise;
            promise.then(
                function (results) {
                	console.log("searchLocations results",results);
                	$rootScope.loading = false;
                    vm.locations = results;
                },
                function (error) {
                	$rootScope.loading = false;
                    vm.feedback.addError(error.data.message);
                }
            );
        }

       
        function searchAllDevices() {
            if (!vm.deviceSearch.text) {
                return;
            }
            vm.devices = [];
            $rootScope.loading = true;
            var promise = GlobalSearchService.DeviceSearch(RlsUiSession.focus,vm.deviceSearch.text).$promise;
            promise.then(
                function (results) {
                    vm.devices = results;
                },
                function (error) {
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                $rootScope.loading = false;
                vm.showAllDevices = true;
            });
        }

        function updateShowFindButton() {
            vm.showFindButton = RlsUiSession.user.isSystemAdmin ||
                RlsUiSession.user.isAnAdmin ||
                RlsUiSession.user.isAccountAdmin ||
                RlsUiSession.user.isAccountEditor;
        }
    }
})();