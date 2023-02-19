(function() {
    'use strict';

    angular
        .module('ui-sentinel.shipments.templatesAdmin')
        .controller('TemplateAdminController', TemplateAdminController);

    TemplateAdminController.$inject = ['$scope', '$rootScope', '$state', '$stateParams', 'SentinelUiSession', 'FeedbackService', 'ShipmentTemplatesService', 'TrackingConfigService', 'PolygonGeofencesService', 'RadialGeofencesService', 'TemplateEditorService', 'SentryAccountApiService', 'SentinelAccountApiService', 'ShipmentNotificationsService'];

    function TemplateAdminController($scope, $rootScope, $state, $stateParams, SentinelUiSession, FeedbackService, ShipmentTemplatesService, TrackingConfigService, PolygonGeofencesService, RadialGeofencesService, TemplateEditorService, SentryAccountApiService, SentinelAccountApiService, ShipmentNotificationsService) {
        var isPolygonsLoaded = false,
            isRadialsLoaded = false;
 

        var vm = {
            availableDevices: [],
            availableSentinels: [],
            availableSubscribers: [],
            trackingConfig: null,
            deviceNameText: null,
            subscriberSearchText: null,
            editor: TemplateEditorService,
            availableGeofences: [],
            feedback: FeedbackService,
            isCreateMode: true,
            isEditMode: false,
            isDeleteMode: false,
            formattedStops: formattedStops,
            hasPermission: {
                toChange: false
            },
            deviceSearchText: null,
            sentinelSearchText: null,
            changeSentryFilter: changeSentryFilter,
            sentinelFilter: sentinelFilter,
            deviceFilter: deviceFilter,
            subscriberFilter: subscriberFilter,
            listLimit: 5,
            actions: {
                deleteTemplate: deleteTemplate,
                saveTemplate: saveTemplate,
                selectDevice: selectDevice,
                clearDevice: clearDevice,
                gotoNewTemplate: gotoNewTemplate,
                selectSentinel: selectSentinel,
                removeSentinel: removeSentinel,
                clearSentinel: clearSentinel,
                selectSubscriber: selectSubscriber,
                removeSubscriber: removeSubscriber,
                clearSubscriber: clearSubscriber,
                getEmailSubscriber: getEmailSubscriber,
                toggleTrackDeviceReturn: toggleTrackDeviceReturn,
                reset: reset,
                close: close,
                addStop: addStop,
                removeStop: removeStop,
                beginDelete: beginDelete,
                cancelDelete: cancelDelete
            }
        };
        activate();
        return vm;

        function activate() {
            //vm.feedback.clear();
            $rootScope.$on('CLIENT_FOCUS_CHANGED', function(event, args) {
                if ($state.current.name == 'shipmenttemplate.admin' || $state.current.name == 'shipmenttemplate.new') {
                    $state.go('shipmenttemplates.list');
                }
            });

            $scope.$watch(
                function() {
                    return TemplateEditorService.device.value;
                },
                function(value) {
                    onDeviceChange();
                }, true
            );

            $rootScope.$on('$stateChangeSuccess', function(event, args) {
                if ($state.current.name == 'shipmenttemplate.admin' || $state.current.name == 'shipmenttemplate.new') {
                    initController();
                }
            });

            $rootScope.$on('SHIPMENT_STOP_REMOVED', function(event, args) {
                if ($state.current.name == 'shipmenttemplate.new') {
                    vm.editor.removeStop(args.index);
                } else if($state.current.name == 'shipmenttemplate.admin'){
                    console.log(args);
                    $rootScope.loading = true;
                    var promise = ShipmentTemplatesService.deleteStop(SentinelUiSession.focus, vm.editor.template.id,args.destinationId).$promise;
                    promise.then(
                        function(result) {
                            $rootScope.loading = false;
                            vm.editor.removeStop(args.index);
                        },
                        function(error) {
                            $rootScope.loading = false;
                            vm.feedback.addError(error.data.message);
                        }
                    );
                }
            });

            $rootScope.$on('SHIPMENT_STOP_EDITED', function(event, args) {
                console.log("SHIPMENT_STOP_EDITED",args);
                var stopAlreadyExist = false;
                if(vm.editor.stops && vm.editor.stops["other"] && vm.editor.stops["other"].length>0){
                    console.log("others",vm.editor.stops["other"]);
                   for(var i=0;i<vm.editor.stops["other"].length;i++){
                       var s = vm.editor.stops["other"][i];
                      if(!s.destinationId) 
                       continue;
                     if(s.destinationId == args.stop.destinationId)
                        continue;
                      console.log("stop",args.stop);
                       console.log("s",s);
                       if(args.stop.type === s.type){
                           if(s.type === "address"){
                               if(args.stop.address.value === s.address.value){
                                   stopAlreadyExist = true;
                                   break;
                               }
                           } else if(s.type === "geofence"){
                               if(args.stop.geofence.name === s.geofence.name){
                                   stopAlreadyExist = true;
                                   break;
                               }
                           }
                       }
                   }
               }
               console.log("stopAlreadyExist",stopAlreadyExist);
               if(stopAlreadyExist){
                   vm.editor.removeStop(args.stop.stopId);
                   vm.feedback.addError("Stop already exists");
                   $(window).scrollTop(0,0);
                   return;
               }
               if($state.current.name == 'shipmenttemplate.admin'){
                
                     var stop = vm.editor.stopToSave('Stop',args.stop);
                     $rootScope.loading = true;
                    var promise = ShipmentTemplatesService.updateStop(SentinelUiSession.focus, vm.editor.template.id,stop).$promise;
                    promise.then(
                        function(result) {
                            $rootScope.loading = false;
                        },
                        function(error) {
                            $rootScope.loading = false;
                            vm.feedback.addError(error.data.message);
                        }
                    );
                }
            });

            $rootScope.$on('SHIPMENT_STOP_ADDED', function(event, args) {
                console.log("SHIPMENT_STOP_ADDED",args);
                
                var stopAlreadyExist = false;
                     if(vm.editor.stops && vm.editor.stops["other"] && vm.editor.stops["other"].length>0){
                         console.log("others",vm.editor.stops["other"]);
                        for(var i=0;i<vm.editor.stops["other"].length;i++){
                            var s = vm.editor.stops["other"][i];
                           if(s.stopId == args.stop.stopId) 
                                continue;
                           console.log("stop",args.stop);
                            console.log("s",s);
                            if(args.stop.type === s.type){
                                if(s.type === "address"){
                                    if(args.stop.address.value === s.address.value){
                                        stopAlreadyExist = true;
                                        break;
                                    }
                                } else if(s.type === "geofence"){
                                    if(args.stop.geofence.name === s.geofence.name){
                                        stopAlreadyExist = true;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    console.log("stopAlreadyExist",stopAlreadyExist);
                    if(stopAlreadyExist){
                        vm.editor.removeStop(args.stop.stopId);
                        vm.feedback.addError("Stop already exists");
                        $(window).scrollTop(0,0);
                        return;
                    }
               if($state.current.name == 'shipmenttemplate.admin'){
                    var stop = vm.editor.stopToSave('Stop',args.stop);
                     var stops = [];
                     stops.push(stop);
                     $rootScope.loading = true;
                    var promise = ShipmentTemplatesService.addStops(SentinelUiSession.focus, vm.editor.template.id,stops).$promise;
                    promise.then(
                        function(result) {
                            console.log("result",result);
                            args.stop.destinationId = result[0].destinationId;
                            $rootScope.loading = false;
                        },
                        function(error) {
                            $rootScope.loading = false;
                            vm.feedback.addError(error.data.message);
                        }
                    );
                }
            });

            setPermissions();
            initController();
        }

        function gotoNewTemplate(){
            $state.go('shipmenttemplate.new');
        }

        function initController() {
            vm.deviceNameText = null;
            vm.editor.clear();
            vm.isCreateMode = true;
            vm.isEditMode = false;
            vm.isDeleteMode = false;

            loadTrackingConfig();
            isPolygonsLoaded = false;
            isRadialsLoaded = false;
            loadGeofences();
            loadDevices();
            loadSentinels();
            loadSubscribers();

            if ($state.current.name === 'shipmenttemplate.admin') {
                vm.isCreateMode = false;
                vm.isEditMode = true;
                loadTemplate();
            }
        }

        function loadSubscribers() {
            vm.availableSubscribers = [];
            $rootScope.loading = true;
            var contactsPromise = ShipmentNotificationsService.getContacts(SentinelUiSession.focus).$promise;
            contactsPromise.then(
                function(result) {
                    $rootScope.loading = false;
                    _.forEach(result, function(subscriber) {
                        vm.availableSubscribers.push(subscriber);
                    });
                },
                function(error) {
                    $rootScope.loading = false;
                    //vm.feedback.addError(error.data.message);
                }
            );
        }

        function initEditor() {
            if (!isPolygonsLoaded || !isRadialsLoaded) {
                return;
            }

            if ($state.current.name === 'shipmenttemplate.new') {
                vm.editor.create(vm.availableGeofences);
                reset();
            } else {
                vm.isCreateMode = false;
                vm.isEditMode = true;
                loadTemplate();
            }
        }

        function getEmailSubscriber(selected) {
            var s = _.find(vm.availableSubscribers, function(subscriber) {
                return subscriber.id == selected.id;
            });
            if (s)
                return s.emailAddress;

            return "";
        }

        function onDeviceChange() {
            if (vm.editor.device.value === null) {
                vm.deviceNameText = null;
                return;
            }

            vm.deviceNameText = vm.editor.device.value.imei;

            if (vm.editor.device.value.friendlyName) {
                vm.deviceNameText = vm.editor.device.value.friendlyName + " [" + vm.editor.device.value.imei + "]";
            }
        }

        function selectDevice(device) {
            vm.editor.device.isPristine = false;
            vm.editor.device.value = device;
            vm.deviceNameText = device.imei;

            if (device.friendlyName) {
                vm.deviceNameText = device.friendlyName + " [" + device.imei + "]";
            }
        }

        function selectSentinel(sentinel) {
            var exists = _.find(vm.editor.sentinels, function(s) { return s.deviceId === sentinel.deviceId; });
            if (!exists)
                vm.editor.sentinels.push(sentinel);
        }

        function removeSentinel(sentinel, $index) {
            vm.editor.sentinels.splice($index, 1);
        }

        function clearSentinel() {
            vm.editor.sentinels = [];
        }

        function selectSubscriber(subscriber) {
            var exists = _.find(vm.editor.subscribers, function(s) { return s.id === subscriber.id; });
            if (!exists)
                vm.editor.subscribers.push({
                    id: subscriber.id
                });
        }

        function removeSubscriber(s, $index) {
            vm.editor.subscribers.splice($index, 1);
        }

        function subscriberFilter(subscriber) {
            if (vm.subscriberSearchText === null || vm.subscriberSearchText === '') {
                return true;
            }

            var text = vm.subscriberSearchText.toLowerCase();
            return subscriber.emailAddress.toLowerCase().indexOf(text) >= 0;
        }

        function clearSubscriber() {
            vm.editor.subscribers = [];
        }

        function sentinelFilter(filter) {
            if (filter === "")
                filter = "0";

            console.log("sentinelFilter", filter);


            $rootScope.loading = true;
            var promise = SentinelAccountApiService.getSentinelsForASML(SentinelUiSession.focus,filter).$promise;

            promise.then(
                function(result) {
                    console.log("Sentinels", result);
                    vm.availableSentinels = result;
                    //onReportsChange();
                },
                function(error) {
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function() {
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


        function changeSentryFilter(filter) {

            if (filter === "")
                filter = "1";
            console.log("changeSentryFilter", filter);

            $rootScope.loading = true;
            var promise = SentryAccountApiService.getDevicesForASML(SentinelUiSession.focus,filter).$promise;

            promise.then(
                function(result) {
                    console.log("Sentys", result);
                    vm.availableDevices = result;
                    //onReportsChange();
                },
                function(error) {
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function() {
                $rootScope.loading = false;
            });

        }

        function clearDevice() {
            vm.editor.device.value = null;
            vm.editor.device.isPristine = true;

            loadDevices();
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
            ).finally(function() {
                $rootScope.loading = false;
            });
        }

        function loadSentinels() {
            vm.availableSentinels = [];
            var promise = SentinelAccountApiService.getSentinelsForASML(SentinelUiSession.focus,"0").$promise;
            promise.then(
                function(result) {
                    console.log("Sentinels", result);
                    vm.availableSentinels = result;
                    //onReportsChange();
                },
                function(error) {
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function() {
                $rootScope.loading = false;
            });
        }


        function addStop() {
            $('#btn-add-stop').blur();
            vm.editor.addStop('address');
        }

        function beginDelete() {
            vm.isDeleteMode = true;
        }

        function cancelDelete() {
            vm.isDeleteMode = false;
        }

        function close() {
            vm.editor.clear();
            $state.go('shipmenttemplates.list');
        }

        function deleteTemplate() {
            vm.feedback.clear();
            $rootScope.loading = true;
            var promise = ShipmentTemplatesService.removeTemplate(vm.editor.template).$promise;
            promise.then(
                function(result) {
                    $rootScope.loading = false;
                    close();
                },
                function(error) {
                    $rootScope.loading = false;
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function loadTemplate() {
            $rootScope.loading = true;
            var promise = ShipmentTemplatesService.getTemplate($stateParams.templateId).$promise;
            promise.then(
                function(result) {
                    var promise2 = ShipmentTemplatesService.getStops(SentinelUiSession.focus,$stateParams.templateId).$promise;
                        promise2.then(
                            function(stops) {
                                result.stops = stops;
                                vm.editor.edit(result, vm.availableGeofences);
                                reset();
                            },
                            function(error) {
                                vm.feedback.addError(error.data.message);
                            }
                        ).finally(function() {
                            //$rootScope.loading = false;
                            loadSentinels();
                        });
                },
                function(error) {
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function toFormattedStop(templateStop) {

            var stop = {
                type: templateStop.stopType,
                address: null,
                isGeofence: false
            };

            if (templateStop.geofenceId) {
                var geofence = _.find(vm.availableGeofences, { geofenceId: templateStop.geofenceId });
                if (geofence) {
                    stop.isGeofence = true;
                    stop.address = geofence.name + ' (geofence)';
                }
            } else {
                stop.address = templateStop.address;
            }

            return stop;
        }

        function formattedStops(template) {
            var stops = [];

            /*_.forEach(template.stops, function(templateStop) {
                if (templateStop.stopType.toLowerCase() === 'origin') {
                    stops.push(toFormattedStop(templateStop));
                }
            });*/

            _.forEach(template.stops, function(templateStop) {
                stops.push(toFormattedStop(templateStop));
            });

            /*_.forEach(template.stops, function(templateStop) {
                if (templateStop.stopType.toLowerCase() === 'destination') {
                    stops.push(toFormattedStop(templateStop));
                }
            });*/

            return stops;
        }

        function loadGeofences() {
            vm.availableGeofences = [];
            var polygonPromise = PolygonGeofencesService.getGeofences(SentinelUiSession.focus).$promise;
            polygonPromise.then(
                function(result) {
                    vm.availableGeofences = vm.availableGeofences.concat(result);
                    isPolygonsLoaded = true;
                    initEditor();
                },
                function(error) {
                    vm.feedback.addError(error.data.message);
                }
            );
            var radialPromise = RadialGeofencesService.getGeofences(SentinelUiSession.focus).$promise;
            radialPromise.then(
                function(result) {
                    vm.availableGeofences = vm.availableGeofences.concat(result);
                    isRadialsLoaded = true;
                    initEditor();
                },
                function(error) {
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function loadTrackingConfig() {
            var promise = TrackingConfigService.getConfig(SentinelUiSession.focus).$promise;
            promise.then(
                function(result) {
                    vm.trackingConfig = result;
                },
                function(error) {
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function removeStop(stopId) {
            vm.editor.removeStop(stopId);
        }

        function reset() {
            console.log("reset");
            $('#btn-reset').blur();

            vm.editor.reset();

            if (vm.editor.template) {
                $state.current.data.subTitle = vm.editor.template.name;
            }

        }

        function saveTemplate() {
            $rootScope.loading = true;
            var isModeEdit = vm.editor.template && vm.editor.template.id;
            var promise = vm.editor.save();
            if (promise) {
                promise.then(
                    function(result) {
                        console.log("saveTemplate",result);
                        var message = vm.editor.name.value + ' has been ' + (vm.isCreateMode ? 'created' : 'saved');
                        vm.feedback.addSuccess(message);
                        if(!isModeEdit){
                            var promise2 = vm.editor.createStops(result);
                            if(promise2 !== null){
                                promise2.then(
                                    function(r){
                                        $state.go('shipmenttemplate.admin', { templateId: result.id });
                                    },
                                    function(e){
                                        vm.feedback.addError(e.data.message);
                                    }
                                );
                            } else
                                $state.go('shipmenttemplate.admin', { templateId: result.id });
                        } else {
                            $state.go('shipmenttemplate.admin', { templateId: result.id });
                        }
                    },
                    function(error) {
                        console.log(error);
                        if (error.status === 400 && error.data.message.indexOf('already in use') > -1) {
                            vm.editor.name.errors.isDuplicate = true;
                            return;
                        }

                        vm.feedback.addError(error.data.message);
                    }
                ).finally(function() {
                    $rootScope.loading = false;
                });
            }
        }

        function setPermissions() {
            vm.hasPermission.toChange =
                SentinelUiSession.user.isSystemAdmin ||
                SentinelUiSession.user.isAccountAdmin ||
                SentinelUiSession.user.isAccountEditor;
        }

        function toggleTrackDeviceReturn() {
            vm.editor.trackDeviceReturn.value = !vm.editor.trackDeviceReturn.value;
        }
    }
})();