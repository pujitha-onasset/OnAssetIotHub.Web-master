(function() {
    'use strict';

    angular
        .module('ui-sentinel.shipments.shipmentNew')
        .controller('ShipmentNewController', ShipmentNewController);

    ShipmentNewController.$inject = ['$rootScope','$timeout', '$scope', '$state', 'DevicesService', 'SentinelUiSession', 'FeedbackService', 'LatestDeviceTrackingReportsService', 'TemplateEditorService', 'ShipmentEditorService', 'PolygonGeofencesService', 'RadialGeofencesService', 'ShipmentTemplatesDataLoaderService', 'DatetimeValidatorService','SentryAdminApiService', 'SentinelAdminApiService','SentinelAccountApiService', 'SentryAccountApiService','ShipmentTemplatesService'];
    function ShipmentNewController($rootScope,$timeout, $scope, $state, DevicesService, SentinelUiSession, FeedbackService, LatestDeviceTrackingReportsService, TemplateEditorService, ShipmentEditorService, PolygonGeofencesService, RadialGeofencesService, ShipmentTemplatesDataLoaderService, DatetimeValidatorService, SentryAdminApiService, SentinelAdminApiService, SentinelAccountApiService, SentryAccountApiService,ShipmentTemplatesService) {

        var vm = {
            feedback: FeedbackService,
            availableDevices: [],
            availableSentinels: [],
            availableGeofences: [],
            lastReports: [],
            filterSentrysTimeout: null,
            filterSentinelsTimeout: null,
            deviceSearchText: null,
            endGeofenceSearchText: null,
            endGeofence2SearchText: null,
            beginGeofenceSearchText: null,
            sentinelSearchText: null,
            sentinelFilter: sentinelFilter,
            endGeofenceFilter: endGeofenceFilter,
            endGeofence2Filter: endGeofence2Filter,
            beginGeofenceFilter: beginGeofenceFilter,
            changeSentryFilter: changeSentryFilter,
            templateSearchText: null,
            templateCount: 0,
            isTemplateSearchMode: false,
            templateEditor: TemplateEditorService,
            templateFilter: templateFilter,
            selectedAlarmFilter: selectedAlarmFilter,
            availableTemplates: [],
            listLimit: 5,
            itemsPerPage: 5,
            availableAlarms: [],
            shipmentEditor: ShipmentEditorService,
            currentPage: 'start',
            filter: 'all',
            page: 1,
            saveAsTemplatePage: {
                isShowing: false,
                close: closeSaveAsTemplate,
                save: createTemplate
            },
            startPage: {
                isShowingTemplates: false,
                selectedTemplateName: null,
                selectedTemplate: null,
                deviceNameText: null,
                endGeofenceNameText: null,
                endGeofence2NameText: null,
                beginGeofenceNameText: null,
                isValid: false
            },
            stopsPage: {
                isPristine: true,
                isValid: false                
            },
            alarmsPage: {
                alarms: [],
                isVisited: false,
                isValid: isAlarmsValid
            },
            finishPage: {
                isValid: false
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
                create: create,
                next: next,
                back: back,
                validateSubscribers: validateSubscribers,
                addStop: addStop,
                removeStop: removeStop,
                selectDevice: selectDevice,
                selectSentinel: selectSentinel,
                removeSentinel: removeSentinel,
                clearDevice: clearDevice,
                clearSentinel: clearSentinel,
                clearEndGeofence: clearEndGeofence,
                clearEndGeofence2: clearEndGeofence2,
                clearBeginGeofence: clearBeginGeofence,
                selectEndGeofence: selectEndGeofence,
                selectEndGeofence2: selectEndGeofence2,
                selectBeginGeofence: selectBeginGeofence,
                formatSentinelValue: formatSentinelValue,
                //toggleTrackDeviceReturn: toggleTrackDeviceReturn,
                showTemplates: showTemplates,
                searchTemplates: searchTemplates,
                hideTemplates: hideTemplates,
                selectTemplate: selectTemplate,
                updateTemplate: updateTemplate,
                beginSaveAsTemplate: beginSaveAsTemplate
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
                if ($state.current.name === 'shipment-new') {
                    vm.shipmentEditor.init();
                    vm.availableTemplates = [];
                    ShipmentTemplatesDataLoaderService.load();
                    loadDevices();
                    loadSentinels();
                    resetWizard();
                    $state.go('shipments.list');
                }
            });

            $rootScope.$on('SHIPMENT_STOP_REMOVED', function (event, args) {
                removeStop(args.index);
            });

            $rootScope.$on('SHIPMENT_STOP_ADDED', function(event, args) {
                console.log("SHIPMENT_STOP_ADDED",args);
                //console.log("stops",vm.shipmentEditor.stops);
                
                    var stopAlreadyExist = false;
                    if(vm.shipmentEditor.stops && vm.shipmentEditor.stops["other"] && vm.shipmentEditor.stops["other"].length>0){
                        console.log("others",vm.shipmentEditor.stops["other"]);
                    for(var i=0;i<vm.shipmentEditor.stops["other"].length;i++){
                        var s = vm.shipmentEditor.stops["other"][i];
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
                    vm.shipmentEditor.removeStop(args.stop.stopId);
                    vm.feedback.addError("Stop already exists");
                    $(window).scrollTop(0,0);
                    return;
                }

            });


            vm.shipmentEditor.init();

            loadDevices();
            loadSentinels();
            loadGeofences();

            $scope.$watchCollection(
                function() {
                    return ShipmentTemplatesDataLoaderService.templates;
                },
                function (value) {
                    onTemplatesChange();
                }
            );
            $scope.$watch(
                function() {
                    return ShipmentTemplatesDataLoaderService.totalTemplates;
                },
                function (value) {
                   vm.templateCount = ShipmentTemplatesDataLoaderService.totalTemplates;
                }, true
            );
            $scope.$watch(
                function() {
                    return ShipmentTemplatesDataLoaderService.isSearchRequired;
                },
                function (value) {
                    vm.isTemplateSearchMode = ShipmentTemplatesDataLoaderService.isSearchRequired;
                }, true
            );
            /*$scope.$watchCollection(
                function() {
                    return LatestDeviceTrackingReportsService.reports;
                },
                function (value) {
                    onReportsChange(value);
                }
            );*/
            $scope.$watch(
                function() {
                    return vm.currentPage;
                },
                function (value) {
                    if (vm.currentPage === 'alarms') {
                        vm.alarmsPage.isVisited = true;
                    }
                    vm.finishPage.isValid = isWizardValid();
                }, true
            );
            $scope.$watch(
                function() {
                    return SentinelUiSession.focus.trackingConfig;
                },
                function (value) {
                    vm.shipmentEditor.referencePrefix = value && value.referencePrefix ? value.referencePrefix : null;
                }, true
            );


        }

        function addStop() {
            vm.shipmentEditor.addStop('address');
        }

        function formatSentinelValue(sentinel){
            if(sentinel.friendlyName && sentinel.friendlyName!=null && sentinel.friendlyName!=""){
                return sentinel.friendlyName + " [" + sentinel.deviceId + "]";
            }
            return sentinel.deviceId;
        }

        function addStops(shipment){
        
            if(!vm.shipmentEditor.stops.other || vm.shipmentEditor.stops.other.length==0)
                return;

            var promise = vm.shipmentEditor.saveNewStops(shipment);
            
            if (!promise) {
                return;
            }
            
            promise.$promise.then(
                function (result) {
                    
                },
                function (error) {
                    console.log("error",error);
                    console.log("error.data.message",error.data.message);
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function addAlarms(shipment) {
            console.log("shipment created",shipment);
            var sentinels = vm.shipmentEditor.sentinels;
            _.forEach(vm.alarmsPage.alarms, function (availableAlarm) {
                if (availableAlarm.isAdded) {
                    var addPromise = DevicesService.addAlarm(vm.shipmentEditor.device.value, availableAlarm, shipment.shipmentInfo.shipmentId).$promise;
                    addPromise.then(
                        function (result) {
                            console.log("addAlarms",result);
                            _.forEach(sentinels,function(s){
                                var addPromise = DevicesService.addAlarmSentinel(s, availableAlarm, shipment.shipmentInfo.shipmentId).$promise;
                                addPromise.then(
                                    function (result) {
                                        console.log("addAlarms",result);
                                    },
                                    function (error) { vm.feedback.addError('Could not add ' + availableAlarm.alarmName); }
                                );
                            });

                        },
                        function (error) { vm.feedback.addError('Could not add ' + availableAlarm.alarmName); }
                    );
                }

                /*if (!availableAlarm.isAdded) {
                    DevicesService.removeAlarm(vm.shipmentEditor.device.value, availableAlarm, shipment);
                }*/
            });
        }

        function applyTemplateStop(templateStop, shipmentStop) {
            if (shipmentStop.address) {
                shipmentStop.address.value = null;
                shipmentStop.address.isChanging = false;
            }
            if (shipmentStop.locationSearch) {
                shipmentStop.locationSearch.value = null;
                shipmentStop.locationSearch.location = null;
                shipmentStop.locationSearch.availableLocations = [];
            }
            if (shipmentStop.geofence) {
                shipmentStop.geofence.value = null;
                shipmentStop.geofence.name = null;
                shipmentStop.geofence.isChanging = false;
            }


            if (templateStop.type === 'address') {
                shipmentStop.type = templateStop.type;
                if (templateStop.address.value) {
                    shipmentStop.address.isChanging = false;
                    shipmentStop.address.value = templateStop.address.value;
                    shipmentStop.locationSearch.value = templateStop.address.value;

                    var geoCoder = new google.maps.Geocoder();
                    geoCoder.geocode({ 'address': shipmentStop.address.value}, function (results, status) {
                        if (status === google.maps.GeocoderStatus.OK && results.length === 1) {
                            shipmentStop.locationSearch.location = results[0];
                            shipmentStop.address.value = shipmentStop.locationSearch.location.formatted_address;
                            $scope.$apply();
                        }
                    });
                }
                else {
                    shipmentStop.address.isChanging = true;
                }
            }

            if (templateStop.type === 'geofence' && templateStop.geofence !== null) {
                shipmentStop.type = templateStop.type;
                if (templateStop.geofence.name) {
                    shipmentStop.geofence.value = templateStop.geofence.value;
                    shipmentStop.geofence.name = templateStop.geofence.name;
                    shipmentStop.geofence.isChanging = false;
                }
                else {
                    shipmentStop.geofence.isChanging = true;
                }

            }

        }

        function back() {
            switch (vm.currentPage) {
                case 'stops': vm.currentPage = 'start'; break;
                case 'alarms': vm.currentPage = 'stops'; break;
                case 'alarms': vm.currentPage = 'start'; break;
                case 'finish': vm.currentPage = 'alarms'; break;
                default: vm.currentPage = 'start'; break;
            }
        }

        function beginSaveAsTemplate() {
            vm.saveAsTemplatePage.isShowing = true;
            vm.templateEditor.clear();
            var editorBeginDateMoment = moment(vm.shipmentEditor.beginDate.date,"L");
            var editorEndDateMoment = moment(vm.shipmentEditor.endDate.date, "L");
            if (editorBeginDateMoment.isValid() && editorEndDateMoment.isValid()) {
                var duration = editorEndDateMoment.startOf('day').diff(editorBeginDateMoment.startOf('day'), 'days');
                vm.templateEditor.duration.value = duration >= vm.templateEditor.duration.min && duration <= vm.templateEditor.duration.max ? duration : null;
            }
        }

        function clearDevice() {
            vm.shipmentEditor.device.value = null;
            vm.shipmentEditor.device.isPristine = true;
        }

        function clearEndGeofence() {
            vm.shipmentEditor.endGeofence.value = null;
            vm.shipmentEditor.endGeofence.isPristine = true;
        }

        function clearEndGeofence2() {
            vm.shipmentEditor.endGeofence2.value = null;
            vm.shipmentEditor.endGeofence2.isPristine = true;
        }

        function clearBeginGeofence() {
            vm.shipmentEditor.beginGeofence.value = null;
            vm.shipmentEditor.beginGeofence.isPristine = true;
        }

        function clearSentinel() {
            vm.shipmentEditor.sentinels = [];
        }

        function close() {
            vm.shipmentEditor.clear();
            $state.go('shipments.list');
        }

        function closeSaveAsTemplate() {
            vm.saveAsTemplatePage.isShowing = false;
            
        }

        function create() {
            vm.feedback.clear();
            var promise = vm.shipmentEditor.saveNew();
            
            if (!promise) {
                return;
            }
            $rootScope.loading = true;
            promise.$promise.then(
                function (result) {
                    $rootScope.loading = false;
                    var referenceNumber = vm.shipmentEditor.referencePrefix ?  vm.shipmentEditor.referencePrefix + vm.shipmentEditor.referenceNumber.value : vm.shipmentEditor.referenceNumber.value;
                    vm.feedback.addSuccess('Shipment ' + referenceNumber + ' has been created');
                    addStops(result);
                    addAlarms(result);
                    resetWizard();
                },
                function (error) {
                    $rootScope.loading = false;
                    console.log("error",error);
                    if (vm.shipmentEditor.referenceNumber.hasError() ) {
                        console.log("hasError",vm.shipmentEditor.referenceNumber.hasError());
                        vm.currentPage = 'start';
                        return;
                    }

                    if (error.data.modelState) {
                        console.log("error.data.modelState",error.data.modelState);
                        var stateModelError = error.data.modelState[Object.keys(error.data.modelState)][0];
                        vm.feedback.addError(stateModelError);
                        return;
                    }
                    console.log("error.data.message",error.data.message);
                    console.log(vm.feedback);
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function createTemplate() {
            vm.templateEditor.name.validate();
            vm.templateEditor.duration.validate();

            if (vm.templateEditor.name.hasError() || vm.templateEditor.duration.hasError()) {
                return;
            }

            //vm.templateEditor.trackDeviceReturn.value = vm.shipmentEditor.trackDeviceReturn.value;
            vm.templateEditor.subscribers = vm.shipmentEditor.subscribers;
            vm.templateEditor.shipmentEmails.value = vm.shipmentEditor.shipmentEmails.value;
            vm.templateEditor.device = vm.shipmentEditor.device;
            vm.templateEditor.sentinels = vm.shipmentEditor.sentinels;

            /*vm.shipmentEditor.stops.origin.validate();
            if (!vm.shipmentEditor.stops.origin.hasError()) {
                setTemplateStop(vm.templateEditor.stops.origin, vm.shipmentEditor.stops.origin);
            }

            vm.shipmentEditor.stops.destination.validate();
            if (!vm.shipmentEditor.stops.destination.hasError()) {
                setTemplateStop(vm.templateEditor.stops.destination, vm.shipmentEditor.stops.destination);
            }
            */

            console.log("vm.shipmentEditor.stops.other",vm.shipmentEditor.stops.other);

            _.forEach(vm.shipmentEditor.stops.other, function(stop) {
                stop.validate();
                if (!stop.hasError()) {
                    vm.templateEditor.stops.other.push(stop);
                    //var templateStop = vm.templateEditor.addStop('blank');
                    //setTemplateStop(templateStop, stop);
                }
            });
            
            vm.templateEditor.validateStops();
            if (vm.templateEditor.stops.hasError()) {
                return;
            }

            var templateName = vm.templateEditor.name.value;
            var promise = vm.templateEditor.save();
            $rootScope.loading = true;
            if (promise !== null) {
                promise.then(
                    function (result) {
                        $rootScope.loading = false;
                        vm.feedback.addSuccess(templateName + ' has been created');
                        var promise2 = vm.templateEditor.createStops(result);
                        if(promise2 !== null){
                            promise2.then(
                                function(r){
                                    vm.templateEditor.edit(result, vm.availableGeofences);
                                    vm.startPage.selectedTemplate = result;
                                    vm.startPage.selectedTemplateName = templateName;
                                    closeSaveAsTemplate();
                                },
                                function(e){
                                    vm.feedback.addError(e.data.message);
                                }
                            );
                        } else {
                            vm.templateEditor.edit(result, vm.availableGeofences);
                            vm.startPage.selectedTemplate = result;
                            vm.startPage.selectedTemplateName = templateName;
                            closeSaveAsTemplate();
                        }
                       
                    },
                    function (error) {
                        $rootScope.loading = false;
                        vm.feedback.addError(error.data.message);
                    }
                );
            }
        }

        function changeSentryFilter(filter,forScanner){

            if(filter === "" || filter === null)
                filter = "1";

            filter = filter.replace(/\//g, '');
            if(filter.trim().length==0)
                return;

            console.log("changeSentryFilter",filter);

            $rootScope.loading = true;
            var promise = SentryAccountApiService.getDevicesForASML(SentinelUiSession.focus,filter).$promise;

            promise.then(
                function(result) {
                    console.log("Sentys",result);
                    vm.availableDevices = result;
                    if(result && result.length==1 && forScanner && forScanner===true){
                        vm.actions.selectDevice(result[0]);
                        document.getElementById("addSentinelInput").focus(); 
                    } else if(result && result.length==0 && forScanner && forScanner===true){
                        vm.deviceSearchText = "";
                    }
                    //onReportsChange();
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

        function sentinelFilter(filter, forScanner) {
            if(filter === "")
                filter = "0";

            filter = filter.replace(/\//g, '');
            if(filter.trim().length==0)
                return;

            console.log("sentinelFilter",filter);

            $rootScope.loading = true;
             var promise = SentinelAccountApiService.getSentinelsForASML(SentinelUiSession.focus,filter).$promise;

              promise.then(
                    function(result) {
                        console.log("Sentinels",result);
                        vm.availableSentinels = result;
                        if(result && result.length==1 && forScanner && forScanner===true){
                            vm.actions.selectSentinel(result[0]);
                            vm.sentinelSearchText = "";
                        } else if(result && result.length==0 && forScanner && forScanner===true){
                            vm.sentinelSearchText = "";
                        }
                        //onReportsChange();
                    },
                    function(error) {
                        vm.feedback.addError(error.data.message);
                    }
                ).finally(function(){
                       $rootScope.loading = false;
                });
                    
        }

        function formattedStops(template) {
            var stops = [];

            /*_.forEach(template.stops, function(templateStop) {
                if (templateStop.stopType.toLowerCase() === 'origin') {
                    stops.push(toFormattedStop(templateStop));
                }
            });*/

            _.forEach(template.stops, function(templateStop) {
                if (templateStop.stopType.toLowerCase() === 'stop') {
                    stops.push(toFormattedStop(templateStop));
                }
            });

            /*_.forEach(template.stops, function(templateStop) {
                if (templateStop.stopType.toLowerCase() === 'destination') {
                    stops.push(toFormattedStop(templateStop));
                }
            });*/

            return stops;
        }

        function hideTemplates() {
            vm.startPage.isShowingTemplates = false;
            vm.templateSearchText = null;
            vm.availableTemplates = [];
        }

        function isAlarmsValid() {
            return vm.alarmsPage.isVisited;
        }

        function isWizardValid() {
            return vm.shipmentEditor.isValid && isAlarmsValid();
        }

        function loadDevices() {
            vm.availableDevices = [];
            vm.startPage.deviceNameText = null;
            $rootScope.loading = true;
            /*var promise= SentinelUiSession.user.isAnAdmin ?
                    SentryAdminApiService.getLatestAssignmentsForAdmin(vm.filter, vm.page, vm.itemsPerPage).$promise :
                     SentryAccountApiService.getLatestAssignments(vm.filter, vm.page).$promise;*/
            var promise = SentryAccountApiService.getDevicesForASML(SentinelUiSession.focus,"1").$promise;

          promise.then(
                function(result) {
                    console.log("Sentys",result);
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
                    console.log("Sentinels",result);
                    vm.availableSentinels = result;
                    //onReportsChange();
                },
                function(error) {
                    vm.feedback.addError(error.data.message);
                }
            );
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

        function next() {
            switch (vm.currentPage) {
                case 'start':
                    validateStart();
                    if (vm.startPage.isValid) {
                        vm.currentPage = 'stops';
                        console.log("Alarms....");
                    }
                    break;
                case 'stops':
                    validateStops();
                    vm.stopsPage.isValid = !vm.shipmentEditor.stops.hasError();
                    if (vm.stopsPage.isValid) {
                        vm.currentPage = 'alarms';
                    }
                    break;
                case 'alarms': vm.currentPage = 'finish'; break;
                default: vm.currentPage = 'start'; break;
            }
        }

        /*function onReportsChange() {
            _.forEach(vm.availableDevices, function(device) {
                device.lastReport = {
                    age: null,
                    battery: null,
                    location: null,
                    isOnShipment: null
                };

                _.forEach(LatestDeviceTrackingReportsService.reports, function(report) {
                    if (report.deviceTagId === device.deviceTagId) {
                        device.lastReport.age = moment(report.serverTimeStamp).fromNow();
                        device.lastReport.battery = report.batteryPercent;
                        return false;
                    }
                });
            });
        }*/

        function onTemplatesChange() {
            var templates = ShipmentTemplatesDataLoaderService.templates;
            _.forEach(templates, function(template) {
                template.formattedStops = formattedStops(template);
            });
            vm.availableTemplates = templates;
        }

        function removeStop(stopId) {
            vm.shipmentEditor.removeStop(stopId);
        }

        function resetWizard() {
            vm.shipmentEditor.reset();

            vm.startPage = {
                isShowingTemplates: false,
                selectedTemplateName: null,
                selectedTemplate: null,
                deviceNameText: null,
                isValid: false
            };
            vm.stopsPage = {
                isPristine: true,
                isValid: false
            };
            vm.alarmsPage = {
                alarms: [],
                isVisited: false,
                isValid: isAlarmsValid
            };
            vm.finishPage = {
                isValid: false
            };
            vm.currentPage = 'start';
        }

        function searchTemplates() {
            if (!vm.startPage.isShowingTemplates) {
                return;
            }
            vm.availableTemplates = [];

            if (!ShipmentTemplatesDataLoaderService.isSearchRequired) {
                ShipmentTemplatesDataLoaderService.load();
                return;
            }

            if (vm.templateSearchText && vm.templateSearchText.length > 1) {
                ShipmentTemplatesDataLoaderService.search(vm.templateSearchText, 10);
                return;
            }

            ShipmentTemplatesDataLoaderService.clear();
        }

        function selectedAlarmFilter(alarm) {
            return alarm.isAdded;
        }

        function selectDevice(device) {
            vm.shipmentEditor.device.isPristine = false;
            vm.shipmentEditor.device.value = device;
            vm.startPage.deviceNameText = device.imei;

            if (device.friendlyName) {
                vm.startPage.deviceNameText = device.friendlyName + " [" + device.imei + "]";
            }
        }

        function selectEndGeofence(g) {
            vm.shipmentEditor.endGeofence.isPristine = false;
            vm.shipmentEditor.endGeofence.value = g;
            vm.startPage.endGeofenceNameText = g.name + ", " + g.address + "(" + g.type +  ")";
        }

        function selectEndGeofence2(g) {
            vm.shipmentEditor.endGeofence2.isPristine = false;
            vm.shipmentEditor.endGeofence2.value = g;
            vm.startPage.endGeofence2NameText = g.name + ", " + g.address + "(" + g.type +  ")";
        }

        function selectBeginGeofence(g) {
            vm.shipmentEditor.beginGeofence.isPristine = false;
            vm.shipmentEditor.beginGeofence.value = g;
            vm.startPage.beginGeofenceNameText = g.name + ", " + g.address + "(" + g.type +  ")";
        }

        function selectSentinel(sentinel) {
            var exists = _.find(vm.shipmentEditor.sentinels,function(s){return s.deviceId === sentinel.deviceId;});
            if(!exists)
                vm.shipmentEditor.sentinels.push(sentinel);
        }

        function removeSentinel(sentinel, $index) {
            vm.shipmentEditor.sentinels.splice($index, 1);
        }

        function selectTemplate(template) {
            console.log("selectTemplate",template);
            vm.startPage.isShowingTemplates = false;
            $rootScope.loading = true;
            var promise2 = ShipmentTemplatesService.getStops(SentinelUiSession.focus,template.id).$promise;
            promise2.then(
                function(stops) {
                    template.stops = stops;
                    vm.startPage.selectedTemplate = template;
                    vm.startPage.selectedTemplateName = template.name;
                    vm.templateEditor.clear();
                    vm.templateEditor.edit(template, vm.availableGeofences);
                    var beginDateMoment = moment(vm.shipmentEditor.beginDate.date,"L");
                    var endDateMoment = beginDateMoment.add(vm.templateEditor.duration.value, 'days').endOf('day').startOf('minute');
                    vm.shipmentEditor.endDate.value = endDateMoment.toDate();
                    vm.shipmentEditor.endDate.date = endDateMoment.format('L');
                    vm.shipmentEditor.endDate.time =  endDateMoment.format('LT');

                    //vm.shipmentEditor.trackDeviceReturn.value = vm.templateEditor.trackDeviceReturn.value;
                    vm.shipmentEditor.subscribers = vm.templateEditor.subscribers;
                    vm.shipmentEditor.shipmentEmails.value =  template.shipmentEmails !== null ? vm.shipmentEditor.joinEmails(template.shipmentEmails): null;
                    selectDevice({imei:template.deviceTagId});
                    _.forEach(template.sentinels,function(s){
                        vm.shipmentEditor.sentinels.push(s);
                    });

                    /*applyTemplateStop(vm.templateEditor.stops.origin, vm.shipmentEditor.stops.origin);
                    applyTemplateStop(vm.templateEditor.stops.destination, vm.shipmentEditor.stops.destination);
                    */
                    vm.shipmentEditor.stops.other = [];
                    _.forEach(vm.templateEditor.stops.other, function(templateStop) {
                        if (templateStop.type !== 'blank') {
                            var shipmentStop = vm.shipmentEditor.addStop(templateStop.type);
                            applyTemplateStop(templateStop, shipmentStop);
                        }
                    });
                },
                function(error) {
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function() {
                $rootScope.loading = false;
            });
        }

        function setTemplateStop(templateStop, shipmentStop) {
            if (shipmentStop.type === 'address' && shipmentStop.address.value) {
                templateStop.type = shipmentStop.type;
                templateStop.address.value = shipmentStop.address.value;
                //templateStop.location = shipmentStop.location;
            }
            if (shipmentStop.type === 'geofence' && shipmentStop.geofence.value) {
                templateStop.type = shipmentStop.type;
                templateStop.geofence.value = shipmentStop.geofence.value;
            }
        }

        function showTemplates() {
            vm.startPage.isShowingTemplates = true;
            searchTemplates();
        }

        function templateFilter(template) {
            if (ShipmentTemplatesDataLoaderService.isSearchRequired || !vm.templateSearchText) {
                return true;
            }

            var textToMatch = vm.templateSearchText.toLowerCase();

            if (template.name.toLowerCase().indexOf(textToMatch) > -1) {
                return true;
            }

            var foundInStop = false;
            _.forEach(template.formattedStops, function (stop) {
                if (stop.address && stop.address.toLowerCase().indexOf(textToMatch) > -1) {
                    foundInStop = true;
                    return false;
                }
            });
            return foundInStop;
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
                    stop.address = geofence.name + ' (geofence)' ;
                }
            }
            else {
                stop.address = templateStop.address;
            }

            return stop;
        }

        /*function toggleTrackDeviceReturn() {
            $('#btn-track-return').blur();
            vm.shipmentEditor.trackDeviceReturn.value = !vm.shipmentEditor.trackDeviceReturn.value;
        }*/

        function updateTemplate() {
            //vm.templateEditor.trackDeviceReturn.value = vm.shipmentEditor.trackDeviceReturn.value;
            //vm.templateEditor.subscribers = vm.shipmentEditor.subscribers;
            vm.templateEditor.device = vm.shipmentEditor.device;
            vm.templateEditor.sentinels = vm.shipmentEditor.sentinels;
            vm.templateEditor.shipmentEmails.value = vm.shipmentEditor.shipmentEmails.value;
            var editorBeginDateMoment = moment(vm.shipmentEditor.beginDate.date, "L");
            var editorEndDateMoment = moment(vm.shipmentEditor.endDate.date, "L");
            if (editorBeginDateMoment.isValid() && editorEndDateMoment.isValid()) {
                var duration = editorEndDateMoment.startOf('day').diff(editorBeginDateMoment.startOf('day'), 'days');
                vm.templateEditor.duration.value = duration >= vm.templateEditor.duration.min && duration <= vm.templateEditor.duration.max ? duration : null;
            }

            /*setTemplateStop(vm.templateEditor.stops.origin, vm.shipmentEditor.stops.origin);
            setTemplateStop(vm.templateEditor.stops.destination, vm.shipmentEditor.stops.destination);
            */
            vm.templateEditor.stops.other = [];
            _.forEach(vm.shipmentEditor.stops.other, function(stop) {
                vm.templateEditor.stops.other.push(stop);
                //var templateStop = vm.templateEditor.addStop('blank');
                //setTemplateStop(templateStop, stop);
            });
            
            var promise = vm.templateEditor.save();
            if (promise !== null) {
                promise.then(
                    function (result) {
                        vm.feedback.addSuccess(vm.startPage.selectedTemplateName + ' has been saved');
                        /*var promise2 = vm.templateEditor.createStops(result);
                        if(promise2 !== null){
                            promise2.then(
                                function(r){

                                },
                                function(e){
                                    vm.feedback.addError(e.data.message);
                                }
                            );
                        }*/
                    },
                    function (error) {
                        vm.feedback.addError(error.data.message);
                    }
                );
            }
        }

        function validateStart() {
            vm.shipmentEditor.referenceNumber.validate();
            vm.shipmentEditor.endDate.validate();
            vm.shipmentEditor.beginDate.validate();
            vm.shipmentEditor.device.validate();
            vm.shipmentEditor.endGeofence.validate();
            vm.shipmentEditor.endGeofence2.validate();
            vm.shipmentEditor.beginGeofence.validate();
            vm.shipmentEditor.shipmentEmails.validate();

            vm.startPage.isDevicePristine = false;

            vm.startPage.isValid = !vm.shipmentEditor.referenceNumber.hasError() &&
                    !vm.shipmentEditor.device.hasError();

            if(vm.shipmentEditor.endTrackingStrategyType.value === 'date/time'){
                vm.startPage.isValid =  vm.startPage.isValid && !vm.shipmentEditor.endDate.hasError();
            }

            if(vm.shipmentEditor.beginTrackingStrategyType.value === 'date/time'){
                vm.startPage.isValid =  vm.startPage.isValid && !vm.shipmentEditor.beginDate.hasError();
            } 

            if(vm.shipmentEditor.beginTrackingStrategyType.value === 'ArrivalGeofence'){
                vm.startPage.isValid =  vm.startPage.isValid && !vm.shipmentEditor.endGeofence.hasError();
            }

             if(vm.shipmentEditor.beginTrackingStrategyType.value === 'DepartureGeofence'){
                vm.startPage.isValid =  vm.startPage.isValid && !vm.shipmentEditor.beginGeofence.hasError();
            }

            if(vm.shipmentEditor.endTrackingStrategyType.value === 'ArrivalGeofence'){
                vm.startPage.isValid =  vm.startPage.isValid && !vm.shipmentEditor.endGeofence2.hasError();
            } 
        }

        function validateStops() {
            //todo: this should be done by editor
            // vm.shipmentEditor.stops.origin.validate();
            // vm.shipmentEditor.stops.destination.validate();
            _.forEach(vm.shipmentEditor.stops.other, function(stop) {
                 stop.validate();
             });
            vm.shipmentEditor.validateStops();
            vm.stopsPage.isValid = vm.shipmentEditor.stops.hasError();
        }

        function validateSubscribers() {
            vm.shipmentEditor.shipmentEmails.validate();
            vm.startPage.isSubscribersValid = vm.shipmentEditor.shipmentEmails.hasError();
        }

    }
})();