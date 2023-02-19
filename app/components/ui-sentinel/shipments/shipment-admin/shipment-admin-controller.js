(function() {
    'use strict';

    angular
        .module('ui-sentinel.shipments.shipmentAdmin')
        .controller('ShipmentAdminController', ShipmentAdminController);

    ShipmentAdminController.$inject = ['$rootScope', '$scope', '$timeout', '$state', '$stateParams', 'ShipmentsService', 'ShipmentEditorService', 'SentinelUiSession', 'FeedbackService', 'LatestShipmentTrackingReportsService', 'DevicesService','SentryAccountApiService','SentinelAccountApiService','PolygonGeofencesService','RadialGeofencesService', 'DatetimeValidatorService'];
    function ShipmentAdminController($rootScope, $scope, $timeout, $state, $stateParams, ShipmentsService, ShipmentEditorService, SentinelUiSession, FeedbackService, LatestShipmentTrackingReportsService, DevicesService, SentryAccountApiService, SentinelAccountApiService,PolygonGeofencesService, RadialGeofencesService, DatetimeValidatorService) {
        var vm = { 
            availableDevices: [],
            availableSentinels: [],
            availableGeofences: [],
            shipmentAlarms: [],
            deviceSearchText: null,
            endGeofenceSearchText: null,
            endGeofence2SearchText: null,
            beginGeofenceSearchText: null,
            sentinelSearchText: null,
            showSentinels: false,
            isCompleting: false,
            endGeofenceFilter: endGeofenceFilter,
            endGeofence2Filter: endGeofence2Filter,
            beginGeofenceFilter: beginGeofenceFilter,
            endGeofenceNameText: null,
            endGeofence2NameText: null,
            beginGeofenceNameText: null,
            deviceFilter: deviceFilter,
            editor: ShipmentEditorService,
            feedback: FeedbackService,
            listLimit: 5,
            filterSentrysTimeout: null,
            filterSentinelsTimeout: null,
            changeSentryFilter: changeSentryFilter,
            sentinelFilter: sentinelFilter,
            mode: {
              isEditingDevice: false  
            },
            hasPermission: {
                toChange: false
            },
            sentry_scan_options: {
                minLength:15,
                avgTimeByChar:10,
                onComplete: function(){
                    console.log("sentry_scan_options",vm.deviceSearchText);
                    vm.changeSentryFilter(vm.deviceSearchText,true);
                }
            },
            sentinel_scan_options: {
                minLength:12,
                avgTimeByChar:10,
                onComplete: function(){
                    console.log("sentinel",vm.sentinelSearchText);
                    vm.sentinelFilter(vm.sentinelSearchText,true);
                }
            },
            actions: {
                close: close,
                reset: reset,
                submit: submit,
                presubmit: presubmit,
                cancelsubmit: cancelsubmit,
                selectDevice: selectDevice,
                clearDevice: clearDevice,
                selectSentinel: selectSentinel,
                removeSentinel: removeSentinel,
                clearSentinel: clearSentinel,
                cancelShipment: cancelShipment,
                completeShipment: completeShipment,
                goToShipmentMap: goToShipmentMap,
                clearEndGeofence: clearEndGeofence,
                clearEndGeofence2: clearEndGeofence2,
                clearBeginGeofence: clearBeginGeofence,
                selectEndGeofence: selectEndGeofence,
                selectEndGeofence2: selectEndGeofence2,
                selectBeginGeofence: selectBeginGeofence,
                goToShipmentReports: goToShipmentReports
            }
        };
        activate();
        return vm;

        ////////////////////////////////////////////

        function activate() {
            vm.feedback.clear();
            $('#endDate').datepicker();
            $('#endTime').timepicker({ 'timeFormat': DatetimeValidatorService.localTimeFormat()});
            $('#beginDate').datepicker();
            $('#beginTime').timepicker({ 'timeFormat': DatetimeValidatorService.localTimeFormat()});
            
            $rootScope.$on('CLIENT_FOCUS_CHANGED', function (event, args) {
                if ($state.current.name == 'shipment.admin') {
                    $state.go('shipments.list');
                }
            });

            setPermissions();
            
            vm.editor.init();

            loadGeofences();
            load();

            $scope.$watch(
                function() {
                    return LatestShipmentTrackingReportsService.reports;
                },
                function (value) {
                    onReportsChange(value);
                }, true
            );
            $scope.$watch(
                function() {
                    return ShipmentEditorService.device.value;
                },
                function (value) {
                    onDeviceChange();
                }, true
            );
            $scope.$watch(
                function() {
                    return ShipmentEditorService.endGeofence.value;
                },
                function (value) {
                    onEndGeofenceChange();
                }, true
            );
            $scope.$watch(
                function() {
                    return ShipmentEditorService.endGeofence2.value;
                },
                function (value) {
                    onEndGeofence2Change();
                }, true
            );
            $scope.$watch(
                function() {
                    return ShipmentEditorService.beginGeofence.value;
                },
                function (value) {
                    onBeginGeofenceChange();
                }, true
            );
            $scope.$watch(
                function() {
                    return SentinelUiSession.focus.trackingConfig;
                },
                function (value) {
                    vm.editor.referencePrefix = value && value.referencePrefix ? value.referencePrefix : null;
                }, true
            );
        }

        function cancelShipment() {
            if (!vm.editor.canEdit) {
                vm.feedback.addError('Shipment can not be changed');
                return null;
            }
            vm.feedback.clear();

            var promise = ShipmentsService.cancelShipment(vm.editor.shipment.shipmentInfo.shipmentId).$promise;
            promise.then(
                function(result) {
                    var referenceNumber = vm.editor.referencePrefix ?  vm.editor.referencePrefix + vm.editor.referenceNumber.value : vm.editor.referenceNumber.value;
                    vm.feedback.addSuccess('Shipment ' + referenceNumber + ' has been cancelled');
                    vm.editor.shipment.shipmentInfo.status = 'Cancelled';
                    vm.editor.canEdit = false;
                },
                function (error) {
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function changeSentryFilter(filter,forScanner){

            if(filter === "")
                filter = "1";
            console.log("changeSentryFilter",filter);

            filter = filter.replace(/\//g, '');
            if(filter.trim().length==0)
                return;

            $rootScope.loading = true;
         var promise = SentryAccountApiService.getDevicesForASML(SentinelUiSession.focus,filter).$promise;

          promise.then(
                function(result) {
                    console.log("Sentys",result);
                    vm.availableDevices = result;
                    //onReportsChange();
                    if(result && result.length==1 && forScanner && forScanner===true){
                        vm.actions.selectDevice(result[0]);
                        document.getElementById("addSentinelInput").focus(); 
                    } else if(result && result.length==0 && forScanner && forScanner===true){
                        vm.deviceSearchText = "";
                    }
                },
                function(error) {
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                   $rootScope.loading = false;
            });
            
        }

        function endGeofenceFilter(geofence) {
            if (vm.endGeofenceSearchText === null || vm.endGeofenceSearchText === '') {
                return true;
            }

            var text = vm.endGeofenceSearchText.toLowerCase();
            return geofence.name.toLowerCase().indexOf(text) >= 0;
        }

        function endGeofence2Filter(geofence) {
            if (vm.endGeofence2SearchText === null || vm.endGeofence2SearchText === '') {
                return true;
            }

            var text = vm.endGeofence2SearchText.toLowerCase();
            return geofence.name.toLowerCase().indexOf(text) >= 0;
        }

        function beginGeofenceFilter(geofence) {
            if (vm.beginGeofenceSearchText === null || vm.beginGeofenceSearchText === '') {
                return true;
            }

            var text = vm.beginGeofenceSearchText.toLowerCase();
            return geofence.name.toLowerCase().indexOf(text) >= 0;
        }

        function loadGeofences() {
            vm.availableGeofences = [];
            var polygonPromise = PolygonGeofencesService.getGeofences(SentinelUiSession.focus).$promise;
            polygonPromise.then(
                function (result) {
                    vm.availableGeofences = vm.availableGeofences.concat(result);
                },
                function (error) {
                    vm.feedback.addError(error.data.message);
                }
            );
            var radialPromise = RadialGeofencesService.getGeofences(SentinelUiSession.focus).$promise;
            radialPromise.then(
                function (result) {
                    vm.availableGeofences = vm.availableGeofences.concat(result);
                },
                function (error) {
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function selectDevice(device) {
            //console.log("selectDevice",device);
            vm.editor.device.isPristine = false;
            vm.editor.device.value = device;
            vm.deviceNameText = device.imei;

            if (device.friendlyName) {
                vm.deviceNameText = device.friendlyName + " [" + device.imei + "]";
            }
        }

        function selectEndGeofence(g) {
            vm.editor.endGeofence.isPristine = false;
            vm.editor.endGeofence.value = g;
            vm.endGeofenceNameText = g.name + ", " + g.address + "(" + g.type +  ")";
        }

        function selectEndGeofence2(g) {
            vm.editor.endGeofence2.isPristine = false;
            vm.editor.endGeofence2.value = g;
            vm.endGeofence2NameText = g.name + ", " + g.address + "(" + g.type +  ")";
        }

        function selectBeginGeofence(g) {
            vm.editor.beginGeofence.isPristine = false;
            vm.editor.beginGeofence.value = g;
            vm.beginGeofenceNameText = g.name + ", " + g.address + "(" + g.type +  ")";
        }

        function clearDevice() {
            vm.mode.isEditingDevice = true;
            vm.editor.device.value = null;
            vm.editor.device.isPristine = true;

            loadDevices();
        }

        function clearEndGeofence() {
            vm.editor.endGeofence.value = null;
            vm.editor.endGeofence.isPristine = true;
        }

        function clearEndGeofence2() {
            vm.editor.endGeofence2.value = null;
            vm.editor.endGeofence2.isPristine = true;
        }

        function clearBeginGeofence() {
            vm.editor.beginGeofence.value = null;
            vm.editor.beginGeofence.isPristine = true;
        }

        function selectSentinel(sentinel) {
            var exists = _.find(vm.editor.sentinels,function(s){return s.deviceId === sentinel.deviceId;});
            if(!exists)
                vm.editor.sentinels.push(sentinel);
        }

        function removeSentinel(sentinel, $index) {
            vm.editor.sentinels.splice($index, 1);
        }

         function clearSentinel() {
            vm.editor.sentinels = [];
        }

        function close() {
            vm.editor.clear();
            $state.go($stateParams.referrer, $stateParams.referrerParams);
        }

        function completeShipment() {
            if (!vm.editor.canEdit) {
                vm.feedback.addError('Shipment can not be changed');
                return null;
            }
            vm.feedback.clear();

            var promise = ShipmentsService.completeShipment(vm.editor.shipment.shipmentInfo.shipmentId).$promise;
            promise.then(
                function(result) {
                    var referenceNumber = vm.editor.referencePrefix ?  vm.editor.referencePrefix + vm.editor.referenceNumber.value : vm.editor.referenceNumber.value;
                    vm.feedback.addSuccess('Shipment ' + referenceNumber + ' has been completed manually');
                    vm.editor.shipment.shipmentInfo.status = 'Completed';
                    vm.editor.canEdit = false;
                },
                function (error) {
                    vm.feedback.addError(error.data.message);
                }
            );
        }

         function sentinelFilter(filter,forScanner) {
            if(filter === "")
                filter = "0";

            filter = filter.replace(/\//g, '');
            if(filter.trim().length==0)
                return;
                
            console.log("sentinelFilter",filter);

              
            $rootScope.loading = true;
             var promise = SentinelAccountApiService.getSentinelsForASML(SentinelUiSession.focus, filter).$promise;

              promise.then(
                    function(result) {
                        console.log("Sentinels",result);
                        vm.availableSentinels = result;
                        //onReportsChange();
                        if(result && result.length==1 && forScanner && forScanner===true){
                            vm.actions.selectSentinel(result[0]);
                            vm.sentinelSearchText = "";
                        } else if(result && result.length==0 && forScanner && forScanner===true){
                            vm.sentinelSearchText = "";
                        }
                    },
                    function(error) {
                        vm.feedback.addError(error.data.message);
                    }
                ).finally(function(){
                       $rootScope.loading = false;
                });
                    
        }

        function deviceFilter(device) {
            if (vm.deviceSearchText === null || vm.deviceSearchText === '') {
                return true;
            }

            var text = vm.deviceSearchText.toLowerCase();
            return device.deviceTagId.indexOf(text) >= 0 || device.deviceName.toLowerCase().indexOf(text) >= 0;
        }

        function goToShipmentMap() {
            if (vm.editor.shipment) {
                $state.go('shipment.map',{ shipmentId: vm.editor.shipment.shipmentInfo.shipmentId, referrer: 'shipments.reports' });
            }
        }

        function goToShipmentReports() {
            if (vm.editor.shipment) {
                $state.go('shipment.reports',{ shipmentId: vm.editor.shipment.shipmentInfo.shipmentId, referrer: 'shipments.reports'  });
            }
        }

        function load() {
            $rootScope.loading = true;
            var promise = ShipmentsService.getShipment($stateParams.shipmentId).$promise;
            promise.then(
                function(result) {
                    var shipment = result;
                    vm.editor.edit(shipment);
                    $state.current.data.subTitle = vm.editor.shipment.shipmentInfo.referenceNumber;
                },
                function (error) {
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                loadSentinels();
            });
        }

        function loadDevices() {
            $rootScope.loading = true;
            vm.availableDevices = [];

            var promise = SentryAccountApiService.getDevicesForASML(SentinelUiSession.focus,"1").$promise;

            promise.then(
                function(result) {
                    //console.log("Sentrys", result);
                    vm.availableDevices = result;
                    //onReportsChange();
                },
                function(error) {
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function loadSentinels() {
            vm.availableSentinels = [];
            var promise= SentinelAccountApiService.getSentinelsForASML(SentinelUiSession.focus,"0").$promise;
            promise.then(
                function(result) {
                    //console.log("Sentinels", result);
                    vm.availableSentinels = result;
                    //onReportsChange();
                },
                function(error) {
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function onDeviceChange() {
            //console.log("onDeviceChange",vm.editor);
            if (vm.editor.device.value === null) {
                vm.deviceNameText = null;
                return;
            }

            vm.deviceNameText = vm.editor.device.value.imei;

            if (vm.editor.device.value.friendlyName) {
                vm.deviceNameText = vm.editor.device.value.friendlyName + " [" + vm.editor.device.value.imei + "]";
            }
        }

        function onEndGeofenceChange() {
            if (vm.editor.endGeofence.value === null) {
                vm.endGeofenceNameText = null;
                return;
            }

            var geofence = vm.editor.endGeofence.value;
            vm.endGeofenceNameText = geofence.name + ", " + geofence.address + "(" + geofence.type +  ")";
        }

        function onEndGeofence2Change() {
            if (vm.editor.endGeofence2.value === null) {
                vm.endGeofence2NameText = null;
                return;
            }

            var geofence = vm.editor.endGeofence2.value;
            vm.endGeofence2NameText = geofence.name + ", " + geofence.address + "(" + geofence.type +  ")";
        }

        function onBeginGeofenceChange(g) {
            if (vm.editor.beginGeofence.value === null) {
                vm.beginGeofenceNameText = null;
                return;
            }

            var geofence = vm.editor.beginGeofence.value;
            vm.beginGeofenceNameText = geofence.name + ", " + geofence.address + "(" + geofence.type +  ")";
        }
        
        function onReportsChange() {
            _.forEach(vm.availableDevices, function(device) {
                device.lastReport = {
                    age: null,
                    battery: null,
                    location: null,
                    isOnShipment: null
                };

                _.forEach(LatestShipmentTrackingReportsService.reports, function(report) {
                    if (report.deviceTagId === device.deviceTagId) {
                        device.lastReport.age = moment(report.serverTimeStamp).toNow();
                        device.lastReport.battery = report.batteryPercent;
                        return false;
                    }
                });
            });
        }

        function reset() {
            vm.mode.isEditingDevice = false;
            vm.editor.reset();

            if (!vm.editor.shipment) {
                $state.current.data.subTitle = null;
            }
            else {
                $state.current.data.subTitle = vm.editor.shipment.shipmentInfo.referenceNumber;
            }
        }

        function setPermissions() {
            vm.hasPermission.toChange =
                SentinelUiSession.user.isSystemAdmin ||
                SentinelUiSession.user.isAccountAdmin ||
                SentinelUiSession.user.isAccountEditor;
        }

        function cancelsubmit(){
            vm.isCompleting = false;
        }

        function presubmit(){
            var shipmentInfoToUpdate = vm.editor.preSaveShipmentInfo();
            if(vm.editor.shipment.shipmentInfo.status === "Overdue" && shipmentInfoToUpdate && 
                shipmentInfoToUpdate.status === "Complete"){
                    vm.isCompleting = true;
                return;
            } else {
                vm.isCompleting = false;
                submit();
            }

        }

        function submit() {
            vm.feedback.clear();

            var promise = vm.editor.saveShipmentInfo();
            if (!promise) {
                return;
            }

            $rootScope.loading = true;
            promise.$promise.then(
                function (result) {
                    var referenceNumber = vm.editor.referencePrefix ?  vm.editor.referencePrefix + vm.editor.referenceNumber.value : vm.editor.referenceNumber.value;
                    vm.editor.shipment.shipmentInfo = result;
                    vm.feedback.addSuccess('Shipment ' + referenceNumber + ' has been saved');

                },
                function (error) {
                    console.log(error);
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                $rootScope.loading = false;
                vm.isCompleting = false;
            });

        }

    }
})();