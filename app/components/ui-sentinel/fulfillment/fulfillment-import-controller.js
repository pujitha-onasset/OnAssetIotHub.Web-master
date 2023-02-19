(function() {
    'use strict';

    angular
        .module('ui-sentinel.fulfillment')
        .controller('FulfillmentImportController', FulfillmentImportController);

    FulfillmentImportController.$inject = ['$rootScope', '$scope', '$state', 'VisionSession', 'VisionFeedbackService', 'VisionApiSearchService', 'ImportService', 'VisionApiClientsService', 'VisionApiDevicesService', 'VisionApiDeviceGroupsService', 'VisionApiDevicesConfigurationService', 'VisionApiRadialGeofencesService', 'VisionApiPolygonGeofencesService', 'VisionApiRoutesService', 'VisionApiAlarmContactsService', 'VisionApiShipmentNotificationsService', 'VisionApiShipmentTemplatesService', 'VisionApiUsersService', 'VisionApiAlarmsService' ];
    function FulfillmentImportController($rootScope, $scope, $state, VisionSession, VisionFeedbackService, VisionApiSearchService, ImportService, VisionApiClientsService, VisionApiDevicesService, VisionApiDeviceGroupsService, VisionApiDevicesConfigurationService, VisionApiRadialGeofencesService, VisionApiPolygonGeofencesService, VisionApiRoutesService, VisionApiAlarmContactsService, VisionApiShipmentNotificationsService, VisionApiShipmentTemplatesService, VisionApiUsersService, VisionApiAlarmsService ) {
        var tasks = {
            login: 'login',
            selectSourceClient: 'selectSourceClient',
            confirmClientExactMatch: 'confirmClientExactMatch',
            searchForTargetClient: 'searchForTargetClient',
            taskMenu: 'taskMenu',
            importClientOrSearch: 'importClientOrSearch',
            importClient: 'importClient',
            startSyncDeviceGroup: 'startSyncDeviceGroup',
            confirmImportDeviceGroup: 'confirmImportDeviceGroup',
            startDeviceGroupSync: 'startDeviceGroupSync',
            deviceSyncInProgress: 'deviceSyncInProgress',
            geofenceSyncInProgress: 'geofenceSyncInProgress',
            routesSyncInProgress: 'routesSyncInProgress',
            alarmContactSyncInProgress: 'alarmContactSyncInProgress',
            shippingContactSyncInProgress: 'shippingContactSyncInProgress',
            shippingNotificationSyncInProgress: 'shippingNotificationSyncInProgress',
            shippingTemplatesSyncInProgress: 'shippingTemplatesSyncInProgress',
            userSyncInProgress : 'userSyncInProgress',
            alarmSyncInProgress : 'alarmSyncInProgress',
            confirmSourceClient: 'confirmSourceClient'
        };



        var sourceList = [];
        if (ImportService.currentHost != "https://apicargoview.att.com")
            sourceList.push({ name: 'CargoView Production', url: "https://apicargoview.att.com" });
        if (ImportService.currentHost != "https://api-vision.onasset.com")
            sourceList.push({ name: 'Vision Production', url: "https://api-vision.onasset.com" });
        if (ImportService.currentHost != "api-visionqa.onasset.com")
            sourceList.push({ name: 'Vision QA', url: "https://api-visionqa.onasset.com" });

        var vm = {
            tasks: tasks,
            task: tasks.login,
            sourceList: sourceList,
            source: null,
            username: null,
            password: null,
            token: null,
            loginError: null,
            clientList: [],
            clientOptions: [],
            sourceClient: null,
            candidateClient: null,
            targetCandidate: null,
            searchForTargetClientFilter: null,
            targetClientList: [],
            sourceDeviceGroupList: [],
            syncDeviceGroupBy: 'all',
            devicesToSync: [],
            geofencesToSync: [],
            geofenceIdMaps: [],
            routesToSync: [],
            routeIdMaps: [],
            alarmContactsToSync: [],
            alarmContactIdMaps: [],
            shippingContactsToSync: [],
            shippingNotificationSettingsToSync: [],
            shippingTemplatesToSync: [],
            usersToSync: [],
            alarmsToSync: [],
            alarmIdMaps: [],

            imeiList: null,
            inProgress: false,

            devicesAddedComplete: false,
            devicesMovedComplete: false,
            devicesConfiguredComplete: false,
            polygonSyncComplete: false,
            radialSyncComplete: false,
            routeSyncComplete: false,
            alarmsAddedComplete: false,
            alarmRulesComplete: false,
            alarmActionsComplete: false,
            alarmSubscribersComplete: false,
            alarmDevicesComplete: false,
            alarmContactSyncComplete: false,
            alarmSyncComplete: false,
            shippingContactSyncComplete: false,
            shippingSettingsSyncComplete: false,
            shippingTemplateSyncComplete: false,
            userSyncComplete: false,
            
            results: null,
            feedback: VisionFeedbackService,
            selectSourceClient: selectSourceClient,
            selectClientExactMath: selectClientExactMath,
            selectTargetClient: selectTargetClient,
            startSearchForTargetClient: startSearchForTargetClient,
            searchForTargetClients: searchForTargetClients,
            startImportSourceClient: startImportSourceClient,
            cancelSearchForTargetClient: cancelSearchForTargetClient,
            cancelImportSourceClient: cancelImportSourceClient,
            saveImportSourceClient: saveImportSourceClient,
            startDeviceGroupSync: startDeviceGroupSync,
            syncDeviceGroup: syncDeviceGroup,
            cancelDeviceGroupSync: cancelDeviceGroupSync,
            addDevicesToTargetEnv: addDevicesToTargetEnv,
            moveDevicesToTargetGroup: moveDevicesToTargetGroup,
            changeOpStateForDevicesInTargetGroup: changeOpStateForDevicesInTargetGroup,
            redirectSourceDevices: redirectSourceDevices,
            startRadialGeofencesToSync: startRadialGeofencesToSync,
            startPolygonGeofencesToSync: startPolygonGeofencesToSync,
            startRoutesToSync: startRoutesToSync,
            startAlarmContactsToSync: startAlarmContactsToSync,
            startShippingContactsToSync: startShippingContactsToSync,
            startShippingNotificationsToSync: startShippingNotificationsToSync,
            startShipmentTemplatesToSync: startShipmentTemplatesToSync,
            startUsersToSync: startUsersToSync,
            startAlarmsToSync: startAlarmsToSync,
            startAlarmRulesToSync: startAlarmRulesToSync,
            startAlarmConfigActionSync: startAlarmConfigActionSync,
            startAlarmSubscriberSync: startAlarmSubscriberSync,
            startAlarmDevicesSync: startAlarmDevicesSync,
            confirmSourceClient: confirmSourceClient,
            startLoadSourceClients: startLoadSourceClients,
            taskMenu: taskMenu,
            login: login,
            reset: reset
        };

        activate();
        return vm;

        function activate() {
            $rootScope.$on('CLIENT_FOCUS_CHANGED', function (event, args) {
                if ($rootScope.$state.current.name == 'fulfillment.import') {
                    reset();
                }
            });

            $scope.$watchCollection(
                function() {
                    return vm.devicesToSync;
                },
                function (value) {
                }
            );
            $scope.$watchCollection(
                function() {
                    return vm.geofencesToSync;
                },
                function (value) {
                }
            );

        }

        function reset() {
            vm.task = tasks.login;
            vm.clientList= [];
            vm.sourceClient= null;
            vm.candidateClient= null;
            vm.targetCandidate= null;
            vm.searchForTargetClientFilter= null;
            vm.targetClientList= [];
            vm.sourceDeviceGroupList= [];
            vm.syncDeviceGroupBy= 'all';
            vm.devicesToSync= [];
            vm.geofencesToSync= [];
            vm.geofenceIdMaps= [];
            vm.routesToSync= [];
            vm.routeIdMaps= [];
            vm.alarmContactsToSync= [];
            vm.alarmContactIdMaps= [];
            vm.shippingContactsToSync= [];
            vm.shippingNotificationSettingsToSync= [];
            vm.shippingTemplatesToSync= [];
            vm.usersToSync= [];
            vm.alarmsToSync= [];
            vm.alarmIdMaps= [];

            vm.imeiList= null;
            vm.inProgress= false;

            vm.devicesAddedComplete= false;
            vm.devicesMovedComplete= false;
            vm.devicesConfiguredComplete= false;
            vm.polygonSyncComplete= false;
            vm.radialSyncComplete= false;
            vm.routeSyncComplete= false;
            vm.alarmsAddedComplete= false;
            vm.alarmRulesComplete= false;
            vm.alarmActionsComplete= false;
            vm.alarmSubscribersComplete= false;
            vm.alarmDevicesComplete= false;
            vm.alarmContactSyncComplete= false;
            vm.alarmSyncComplete= false;
            vm.shippingContactSyncComplete= false;
            vm.shippingSettingsSyncComplete= false;
            vm.shippingTemplateSyncComplete= false;
            vm.userSyncComplete= false;

            vm.results= null;
        }

        function login() {
            reset();

            vm.feedback.clear();
            if (!vm.source) {
                vm.feedback.addError("Select a source environment");
                return;
            }
            if (!vm.username) {
                vm.feedback.addError("Enter a username");
                return;
            }
            if (!vm.password) {
                vm.feedback.addError("Enter a password");
                return;
            }

            var p = ImportService.getToken(vm.source.url, vm.username, vm.password).$promise;
            p.then(
                function (result) {
                    vm.token = result.access_token;
                    vm.username = null;
                    vm.password = null;
                    startLoadSourceClients();
                },
                function (error) {
                    vm.feedback.addError(error.data.error_description);
                }
            );
        }
        
        function startLoadSourceClients() {
            vm.task = tasks.selectSourceClient;
            loadSourceClients();            
        }

        function taskMenu() {
            vm.task = tasks.taskMenu;
        }
        
        function loadSourceClients() {
            vm.feedback.clear();
            if (!vm.clientList || vm.clientList.length === 0) {
                var p = ImportService.getClientsFromSource(vm.source.url, vm.token).$promise;
                p.then(
                    function(results) {
                        vm.clientList = results;
                    },
                    function(error) {
                        vm.feedback.addError(error.data.error_description);
                    }
                );
            }
        }

        function checkForExactClientMatch() {
            var p = VisionApiSearchService.searchClients(vm.sourceClient.clientName, true).$promise;
            p.then(
                function (result) {
                    if (result.results && result.results.length === 1) {
                        vm.exactMatchClient = result.results[0];
                        vm.task = tasks.confirmClientExactMatch;
                        return;
                    }

                    vm.task = tasks.importClientOrSearch;
                },
                function (error) {
                    vm.feedback.addError(error.data.error_description);
                }
            );
        }

        function selectSourceClient(client) {
            vm.sourceClient = client;
            vm.sourceClientParent = null;
            var p = ImportService.getParentOfClient(vm.source.url, vm.token, client).$promise;
            p.then(
                function (parent) {
                    vm.sourceClientParent = parent;
                    checkForExactClientMatch();
                },
                function (error) {
                    console.log(error);
                    vm.feedback.addError(error.data.error_description);
                }
            );
        }

        function selectClientExactMath() {
            vm.targetClient = vm.exactMatchClient;
            vm.task = tasks.taskMenu;
        }

        function selectTargetClient(client) {
            var p = VisionApiSearchService.searchClients(client.clientName, true).$promise;
            p.then(
                function (result) {
                    if (result.results && result.results.length === 1) {
                        vm.exactMatchClient = result.results[0];
                        vm.task = tasks.confirmClientExactMatch;
                        return;
                    }

                    vm.task = tasks.importClientOrSearch;
                },
                function (error) {
                    vm.feedback.addError(error.data.error_description);
                }
            );
        }

        function startSearchForTargetClient() {
            vm.searchForTargetClientFilter = vm.sourceClient.clientName;
            vm.targetClientList = [];
            vm.task = tasks.searchForTargetClient;
        }

        function searchForTargetClients() {
            vm.isSearching = true;
            vm.targetClientList = [];
            var p = VisionApiSearchService.searchClients(vm.searchForTargetClientFilter, false).$promise;
            p.then(
                function (result) {
                    vm.targetClientList = result ? result.results : [];
                    vm.isSearching = false;
                },
                function (error) {
                    vm.feedback.addError(error.data.error_description);
                    vm.isSearching = false;
                }
            );
        }

        function cancelSearchForTargetClient() {
            vm.searchForTargetClientFilter = null;
            vm.targetClientList = [];
            vm.task = tasks.importClientOrSearch;
        }

        function cancelImportSourceClient() {
            vm.sourceClient = null;
            vm.sourceClientParent = null;
            vm.task = tasks.selectSourceClient;
        }

        function startImportSourceClient() {
            var p = VisionApiClientsService.getClients().$promise;
            p.then(
                function(results) {
                    vm.importClientParentList = results;
                    var matchedParent = _.find(results, function(c){
                        return c.clientName === vm.sourceClientParent.clientName;
                    });
                    vm.importClientName = vm.sourceClient.clientName;
                    vm.importClientParent = matchedParent;
                    vm.task = tasks.importClient;
                },
                function(error){
                    vm.feedback.addError(error.data.error_description);
                }
            );
        }

        function saveImportSourceClient() {
            if (!vm.importClientName) {
                vm.feedback.addError("Client name required");
                return;
            }
            if (!vm.importClientParent) {
                vm.feedback.addError("Client name required");
                return;
            }

            var newClient = {
                clientName: vm.importClientName,
                parentGuid: vm.importClientParent.clientGuid
            };
            var p = VisionApiClientsService.addClient(newClient).$promise;
            p.then(
                function(result){
                    vm.targetClient = result;
                    vm.targetClientParent = vm.importClientParent;
                    vm.importClient = null;
                    vm.importClientParent = null;
                    vm.importClientParentList = null;
                    vm.task = tasks.taskMenu;
                    vm.feedback.addSuccess("Import successful");
                },
                function(error){
                    vm.feedback.addError(error.data.error_description);
                }
            );


        }

        function startDeviceGroupSync() {
            vm.inProgress = false;
            vm.sourceDeviceGroupList = [];
            vm.sourceDeviceGroup = null;
            vm.targetDeviceGroup = null;
            vm.syncDeviceGroupBy = 'all';
            vm.imeiList = null;
            
            vm.devicesAddedComplete = false;
            vm.devicesConfiguredComplete = false;
            vm.devicesMovedComplete = false;
            
            var p = ImportService.getDeviceGroups(vm.source.url, vm.token, vm.sourceClient).$promise;
            p.then(
                function (results) {
                    vm.sourceDeviceGroupList = results;
                    vm.task = tasks.startDeviceGroupSync;
                },
                function (error) {
                    console.log(error);
                    vm.feedback.addError(error.data.error_description);
                }
            );
        }

        function cancelDeviceGroupSync() {
            vm.sourceDeviceGroupList = [];
            vm.sourceDeviceGroup = null;
            vm.targetDeviceGroup = null;
            vm.syncDeviceGroupBy = 'all';
            vm.sourceDeviceList = null;
            vm.task = tasks.taskMenu;
        }

        function syncDeviceGroup() {
            //search for group of same name in target
            var p = VisionApiDeviceGroupsService.getGroups(vm.targetClient).$promise;
            p.then(
                function(groups) {

                    var group = _.find(groups, function(g) {
                        return g.groupName === vm.sourceDeviceGroup.groupName;
                    });

                    if (group) {
                        vm.targetDeviceGroup = group;
                        getDevicesFromSourceDeviceGroup();
                        return;
                    }

                    //create the group
                    var createPromise = VisionApiDeviceGroupsService.addGroup(vm.targetClient, vm.sourceDeviceGroup).$promise;
                    createPromise.then(
                        function (result) {
                            vm.targetDeviceGroup = group;
                            getDevicesFromSourceDeviceGroup();
                        },
                        function (error) {
                            vm.feedback.addError(error.data.error_description);
                        }
                    );
                },
                function (error) {
                    vm.feedback.addError(error.data.error_description);
                }
            );

        }

        function getDevicesFromSourceDeviceGroup() {
            vm.feedback.clear();
            vm.devicesToSync = [];
            var p = ImportService.getDeviceGroupDevices(vm.source.url, vm.token, vm.sourceDeviceGroup).$promise;
            p.then(
                function (devices) {
                    if (vm.syncDeviceGroupBy === 'all') {
                        _.forEach(devices, function (d) {
                            angular.extend(d,{
                                added: '',
                                moved: '',
                                opstate: '',
                                redirected: ''
                            });
                        });
                        vm.devicesToSync = devices;
                        vm.task = tasks.deviceSyncInProgress;
                        return;
                    }

                    if (!vm.imeiList || vm.imeiList.length === 0) {
                        vm.feedback.addError('A list of IMEIs is required');
                        vm.devicesToSync = [];
                        return;
                    }

                    var imeiList = vm.imeiList.split('\n');
                    var sourceDevices = [];
                    var isDeviceError = false;
                    _.forEach(imeiList, function (imei) {
                        var device = _.find(devices, function (d) {
                            return d.deviceTagId === imei;
                        });
                        if (!device) {
                            vm.feedback.addError(imei + ' does not exist in the source device group.  Please correct the list.');
                            vm.devicesToSync = [];
                            isDeviceError = true;
                            return false;
                        }
                        angular.extend(device,{
                            added: '',
                            moved: '',
                            opstate: '',
                            redirected: ''
                        });
                        sourceDevices.push(device);

                    });

                    if (isDeviceError) {
                        return;
                    }
                    vm.devicesToSync = sourceDevices;
                    vm.task = tasks.deviceSyncInProgress;
                },
                function (error) {
                    console.log(error);
                    vm.feedback.addError(error.data.error_description);
                }
            );
        }

        function addDevicesToTargetEnv() {
            vm.inProgress = true;
            if (!vm.devicesToSync || vm.devicesToSync.length === 0) {
                vm.inProgress = false;
                vm.devicesAddedComplete = true;
                return;
            }

            var i = 0;
            _.forEach(vm.devicesToSync, function (device) {
                var p = VisionApiDevicesService.addDevice(device.deviceTagId, device.deviceName).$promise;
                p.then(
                    function (result) {
                        device.added = 'Yes';
                        if (++i >= vm.devicesToSync.length) {
                            vm.inProgress = false;
                            vm.devicesAddedComplete = true;
                        }
                    },
                    function (error) {
                        device.added = 'ERROR';
                        console.log(error);
                        vm.feedback.addError(error.data.error_description);
                        if (++i >= vm.devicesToSync.length)
                            vm.inProgress = false;
                    }
                );
            });

        }

        function moveDevicesToTargetGroup() {
            vm.inProgress = true;
            if (!vm.devicesToSync || vm.devicesToSync.length === 0) {
                vm.inProgress = false;
                vm.devicesMovedComplete = true;
                return;
            }

            var i = 0;
            _.forEach(vm.devicesToSync, function (device) {
                var p = VisionApiDeviceGroupsService.addDeviceToGroup(vm.targetDeviceGroup, device).$promise;
                p.then(
                    function (result) {
                        device.moved = 'Yes';
                        if (++i >= vm.devicesToSync.length) {
                            vm.inProgress = false;
                            vm.devicesMovedComplete = true;
                        }
                    },
                    function (error) {
                        device.moved = 'ERROR';
                        console.log(error);
                        vm.feedback.addError(error.data.error_description);
                        if (++i >= vm.devicesToSync.length)
                            vm.inProgress = false;
                    }
                );
            });

        }

        function changeOpStateForDevicesInTargetGroup() {
            vm.inProgress = true;
            if (!vm.devicesToSync || vm.devicesToSync.length === 0) {
                vm.inProgress = false;
                vm.devicesConfiguredComplete = true;
                return;
            }

            var i = 0;
            _.forEach(vm.devicesToSync, function (device) {
                var p = ImportService.getDeviceOperationState(vm.source.url, vm.token, device).$promise;
                p.then(
                    function (config) {
                        var q = VisionApiDevicesConfigurationService.changeOperationState(device, config.operationState).$promise;
                        q.then(
                            function (result) {
                                device.opstate = 'Yes';
                                if (++i >= vm.devicesToSync.length) {
                                    vm.inProgress = false;
                                    vm.devicesConfiguredComplete = true;
                                }
                            },
                            function (error) {
                                device.opstate = 'ERROR';
                                console.log(error);
                                vm.feedback.addError(error.data.error_description);
                                if (++i >= vm.devicesToSync.length)
                                    vm.inProgress = false;
                            }
                        );
                    },
                    function (error) {
                        device.opstate = 'ERROR';
                        console.log(error);
                        vm.feedback.addError(error.data.error_description);
                        if (++i >= vm.devicesToSync.length)
                            vm.inProgress = false;
                    }
                );
            });
        }
        
        function redirectSourceDevices() {
            vm.inProgress = true;
            if (!vm.devicesToSync || vm.devicesToSync.length === 0) {
                vm.inProgress = false;
                return;
            }
           
            var i = 0;
            _.forEach(vm.devicesToSync, function (device) {
                var p = ImportService.redirectDevice(vm.source.url, vm.token, device).$promise;
                p.then(
                    function (result) {
                        device.redirected = 'Yes';
                        if (++i >= vm.devicesToSync.length)
                            vm.inProgress = false;
                    },
                    function (error) {
                        device.redirected = 'ERROR';
                        console.log(error);
                        vm.feedback.addError(error.data.error_description);
                        if (++i >= vm.devicesToSync.length)
                            vm.inProgress = false;
                    }
                );
            });
        }
        
        function startRadialGeofencesToSync() {
            vm.task = tasks.geofenceSyncInProgress;
            vm.radialSyncComplete = false;
            getRadialGeofences();
        }

        function startPolygonGeofencesToSync() {
            vm.task = tasks.geofenceSyncInProgress;
            vm.polygonSyncComplete = false;
            getPolygonGeofences();
        }

        function startRoutesToSync() {
            vm.task = tasks.routesSyncInProgress;
            vm.routeSyncComplete = false;
            getRoutesToSync();
        }

        function startAlarmContactsToSync() {
            vm.task = tasks.alarmContactSyncInProgress;
            vm.alarmContactSyncComplete = false;
            getAlarmContactsToSync();
        }

        function startShippingContactsToSync() {
            vm.task = tasks.shippingContactSyncInProgress;
            getShippingContactsToSync();
        }

        function getRadialGeofences() {
            vm.inProgress = true;
            vm.feedback.clear();
            vm.geofencesToSync = [];
            var p = ImportService.getRadialGeofences(vm.source.url, vm.token, vm.sourceClient).$promise;
            p.then(
                function (geofences) {
                    if (!geofences || geofences.length === 0) {
                        vm.inProgress = false;
                        return;
                    }

                    _.forEach(geofences, function (g) {
                        angular.extend(g,{
                            added: ''
                        });
                    });
                    vm.geofencesToSync = geofences;
                    syncRadialGeofences();
                },
                function (error) {
                    vm.inProgress = false;
                    console.log(error);
                    vm.feedback.addError(error.data.error_description);                    
                }
            );
        }

        function syncRadialGeofences() {
            vm.inProgress = true;
            if (!vm.geofencesToSync || vm.geofencesToSync.length === 0) {
                vm.inProgress = false;
                vm.radialSyncComplete = true;
                return;
            }

            var t = VisionApiRadialGeofencesService.getGeofences(vm.targetClient).$promise;
            t.then(
                function (targetGeofences) {
                    var i = 0;
                    _.forEach(vm.geofencesToSync, function (geofence) {

                        var targetGeofence = _.find(targetGeofences, function (g) {
                            return g.name === geofence.name;
                        });
                        if (targetGeofence) {
                            geofence.added = 'Yes';
                            vm.geofenceIdMaps.push({sourceId: geofence.geofenceId, targetId: targetGeofence.geofenceId});
                            if (++i >= vm.geofencesToSync.length) {
                                vm.inProgress = false;
                                vm.radialSyncComplete = true;
                            }
                            return;  //continue;
                        }

                        var p = VisionApiRadialGeofencesService.addGeofence(vm.targetClient, geofence).$promise;
                        p.then(
                            function (result) {
                                geofence.added = 'Yes';
                                vm.geofenceIdMaps.push({sourceId: geofence.geofenceId, targetId: result.geofenceId});
                                if (++i >= vm.geofencesToSync.length) {
                                    vm.inProgress = false;
                                    vm.radialSyncComplete = true;
                                }
                            },
                            function (error) {
                                geofence.added = 'ERROR';
                                console.log(error);
                                vm.feedback.addError(error.data.error_description);
                                if (++i >= vm.geofencesToSync.length) {
                                    vm.inProgress = false;
                                }
                            }
                        );
                    });

                    if (i >= vm.geofencesToSync.length) {
                        vm.inProgress = false;
                    }
                },
                function (error) {
                    console.log(error);
                    vm.feedback.addError(error.data.error_description);
                    vm.inProgress = false;
                }
            );
        }

        function getPolygonGeofences() {
            vm.inProgress = true;
            vm.feedback.clear();
            vm.geofencesToSync = [];
            var p = ImportService.getPolygonGeofences(vm.source.url, vm.token, vm.sourceClient).$promise;
            p.then(
                function (geofences) {
                    if (!geofences || geofences.length === 0) {
                        vm.inProgress = false;
                        return;
                    }

                    _.forEach(geofences, function (g) {
                        angular.extend(g,{
                            added: ''
                        });
                    });
                    vm.geofencesToSync = geofences;
                    syncPolygonGeofences();
                },
                function (error) {
                    vm.inProgress = false;
                    console.log(error);
                    vm.feedback.addError(error.data.error_description);
                }
            );
        }

        function syncPolygonGeofences() {
            vm.inProgress = true;
            if (!vm.geofencesToSync || vm.geofencesToSync.length === 0) {
                vm.inProgress = false;
                vm.polygonSyncComplete = true;
                return;
            }

            var t = VisionApiPolygonGeofencesService.getGeofences(vm.targetClient).$promise;
            t.then(
                function (targetGeofences) {
                    var i = 0;
                    _.forEach(vm.geofencesToSync, function (geofence) {

                        var targetGeofence = _.find(targetGeofences, function (g) {
                            return g.name === geofence.name;
                        });
                        if (targetGeofence) {
                            geofence.added = 'Yes';
                            vm.geofenceIdMaps.push({sourceId: geofence.geofenceId, targetId: targetGeofence.geofenceId});
                            if (++i >= vm.geofencesToSync.length) {
                                vm.inProgress = false;
                                vm.polygonSyncComplete = true;
                            }
                            return;  //continue;
                        }

                        var p = VisionApiPolygonGeofencesService.addGeofence(vm.targetClient, geofence).$promise;
                        p.then(
                            function (result) {
                                geofence.added = 'Yes';
                                vm.geofenceIdMaps.push({sourceId: geofence.geofenceId, targetId: result.geofenceId});
                                if (++i >= vm.geofencesToSync.length) {
                                    vm.inProgress = false;
                                    vm.polygonSyncComplete = true;
                                }
                            },
                            function (error) {
                                geofence.added = 'ERROR';
                                console.log(error);
                                vm.feedback.addError(error.data.error_description);
                                if (i >= vm.geofencesToSync.length)
                                    vm.inProgress = false;
                            }
                        );
                    });

                    if (i >= vm.geofencesToSync.length) {
                        vm.inProgress = false;
                    }
                },
                function (error) {
                    console.log(error);
                    vm.feedback.addError(error.data.error_description);
                    vm.inProgress = false;
                }
            );
        }

        function getRoutesToSync() {
            vm.inProgress = true;
            vm.feedback.clear();
            vm.routesToSync = [];
            var p = ImportService.getRoutes(vm.source.url, vm.token, vm.sourceClient).$promise;
            p.then(
                function (routes) {
                    if (!routes || routes.length === 0) {
                        vm.inProgress = false;
                        return;
                    }

                    _.forEach(routes, function (g) {
                        angular.extend(g,{
                            added: ''
                        });
                    });
                    vm.routesToSync = routes;
                    syncRoutes();
                },
                function (error) {
                    vm.inProgress = false;
                    console.log(error);
                    vm.feedback.addError(error.data.error_description);
                }
            );
        }

        function syncRoutes() {
            vm.inProgress = true;
            if (!vm.routesToSync || vm.routesToSync.length === 0) {
                vm.routeSyncComplete = true;
                vm.inProgress = false;
                return;
            }

            var t = VisionApiRoutesService.getRoutes(vm.targetClient).$promise;
            t.then(
                function (targetRoutes) {
                    var i = 0;
                    _.forEach(vm.routesToSync, function (route) {

                        var targetRoute = _.find(targetRoutes, function (g) {
                            return g.name === route.name;
                        });
                        if (targetRoute) {
                            route.added = 'Yes';
                            vm.routeIdMaps.push({sourceId: route.routeId, targetId: targetRoute.routeId});
                            if (++i >= vm.routesToSync.length) {
                                vm.inProgress = false;
                                vm.routeSyncComplete = true;
                            }
                            return;  //continue;
                        }

                        var p = VisionApiRoutesService.addRoute(vm.targetClient, route).$promise;
                        p.then(
                            function (result) {
                                route.added = 'Yes';
                                vm.routeIdMaps.push({sourceId: route.routeId, targetId: targetRoute.routeId});
                                if (++i >= vm.routesToSync.length) {
                                    vm.inProgress = false;
                                    vm.routeSyncComplete = true;
                                }

                            },
                            function (error) {
                                route.added = 'ERROR';
                                console.log(error);
                                vm.feedback.addError(error.data.error_description);
                                if (++i >= vm.routesToSync.length)
                                    vm.inProgress = false;
                            }
                        );
                    });

                    if (i >= vm.routesToSync.length) {
                        vm.inProgress = false;
                    }
                },
                function (error) {
                    console.log(error);
                    vm.feedback.addError(error.data.error_description);
                    vm.inProgress = false;
                }
            );
        }

        function getAlarmContactsToSync() {
            vm.inProgress = true;
            vm.feedback.clear();
            vm.alarmContactsToSync = [];
            var p = ImportService.getAlarmContacts(vm.source.url, vm.token, vm.sourceClient).$promise;
            p.then(
                function (alarmContacts) {
                    if (!alarmContacts || alarmContacts.length === 0) {
                        vm.inProgress = false;
                        return;
                    }

                    _.forEach(alarmContacts, function (c) {
                        angular.extend(c,{
                            added: ''
                        });
                    });
                    vm.alarmContactsToSync = alarmContacts;
                    syncAlarmContacts();
                },
                function (error) {
                    vm.inProgress = false;
                    console.log(error);
                    vm.feedback.addError(error.data.error_description);
                }
            );
        }

        function syncAlarmContacts() {
            vm.inProgress = true;
            if (!vm.alarmContactsToSync || vm.alarmContactsToSync.length === 0) {
                vm.inProgress = false;
                vm.alarmContactSyncComplete = true;
                return;
            }

            var t = VisionApiAlarmContactsService.getContacts(vm.targetClient).$promise;
            t.then(
                function (targets) {
                    var i = 0;
                    _.forEach(vm.alarmContactsToSync, function (alarmContact) {

                        var target = _.find(targets, function (g) {
                            return g.name === alarmContact.name;
                        });
                        if (target) {
                            alarmContact.added = 'Yes';
                            vm.alarmContactIdMaps.push({sourceId: alarmContact.contactId, targetId: target.contactId});
                            if (++i >= vm.alarmContactsToSync.length) {
                                vm.inProgress = false;
                                vm.alarmContactSyncComplete = true;
                            }

                            return;  //continue;
                        }

                        var p = VisionApiAlarmContactsService.addContact(vm.targetClient, alarmContact).$promise;
                        p.then(
                            function (result) {
                                alarmContact.added = 'Yes';
                                vm.alarmContactIdMaps.push({sourceId: alarmContact.contactId, targetId: target.contactId});
                                if (++i >= vm.alarmContactsToSync.length) {
                                    vm.inProgress = false;
                                    vm.alarmContactSyncComplete = true;
                                }
                            },
                            function (error) {
                                alarmContact.added = 'ERROR';
                                console.log(error);
                                vm.feedback.addError(error.data.error_description);
                                if (++i >= vm.alarmContactsToSync.length)
                                    vm.inProgress = false;
                            }
                        );
                    });

                    if (i >= vm.alarmContactsToSync.length) {
                        vm.inProgress = false;
                    }

                },
                function (error) {
                    console.log(error);
                    vm.feedback.addError(error.data.error_description);
                    vm.inProgress = false;
                }
            );
        }

        function getShippingContactsToSync() {
            vm.inProgress = true;
            vm.feedback.clear();
            vm.shippingContactsToSync = [];
            var p = ImportService.getShippingContacts(vm.source.url, vm.token, vm.sourceClient).$promise;
            p.then(
                function (contacts) {
                    if (!contacts || contacts.length === 0) {
                        vm.inProgress = false;
                        return;
                    }

                    _.forEach(contacts, function (c) {
                        angular.extend(c,{
                            added: ''
                        });
                    });
                    vm.shippingContactsToSync = contacts;
                    syncShippingContacts();
                },
                function (error) {
                    vm.inProgress = false;
                    console.log(error);
                    vm.feedback.addError(error.data.error_description);
                }
            );
        }

        function syncShippingContacts() {
            vm.inProgress = true;
            if (!vm.shippingContactsToSync || vm.shippingContactsToSync.length === 0) {
                vm.inProgress = false;
                vm.shippingContactSyncComplete = true;
                return;
            }

            var t = VisionApiShipmentNotificationsService.getContacts(vm.targetClient).$promise;
            t.then(
                function (targets) {
                    var i = 0;
                    _.forEach(vm.shippingContactsToSync, function (contact) {

                        var target = _.find(targets, function (g) {
                            return g.emailAddress === contact.emailAddress;
                        });
                        if (target) {
                            contact.added = 'Yes';
                            if (++i >= vm.shippingContactsToSync.length) {
                                vm.inProgress = false;
                                vm.shippingContactSyncComplete = true;
                            }
                            return;  //continue;
                        }

                        contact.clientGuid = vm.targetClient.clientGuid;
                        var p = VisionApiShipmentNotificationsService.addContact(vm.targetClient, contact).$promise;
                        p.then(
                            function (result) {
                                contact.added = 'Yes';
                                if (++i >= vm.shippingContactsToSync.length) {
                                    vm.inProgress = false;
                                    vm.shippingContactSyncComplete = true;
                                }
                            },
                            function (error) {
                                contact.added = 'ERROR';
                                console.log(error);
                                vm.feedback.addError(error.data.error_description);
                                if (++i >= vm.shippingContactsToSync.length)
                                    vm.inProgress = false;
                            }
                        );
                    });

                    if (i >= vm.shippingContactsToSync.length) {
                        vm.inProgress = false;
                    }
                },
                function (error) {
                    console.log(error);
                    vm.feedback.addError(error.data.error_description);
                    vm.inProgress = false;
                }
            );
        }

        function startShippingNotificationsToSync() {
            vm.task = tasks.shippingNotificationSyncInProgress;
            vm.shippingSettingsSyncComplete = false;
            getShippingNotificationsToSync();
        }

        function getShippingNotificationsToSync() {
            vm.inProgress = true;
            vm.feedback.clear();
            vm.shippingNotificationSettingsToSync = [];
            var p = ImportService.getShippingNotifications(vm.source.url, vm.token, vm.sourceClient).$promise;
            p.then(
                function (notifications) {
                    if (!notifications || notifications.length === 0) {
                        vm.inProgress = false;
                        return;
                    }

                    _.forEach(notifications, function (c) {
                        angular.extend(c,{
                            added: ''
                        });
                    });
                    vm.shippingNotificationSettingsToSync = notifications;
                    syncShippingNotifications();
                },
                function (error) {
                    vm.inProgress = false;
                    console.log(error);
                    vm.feedback.addError(error.data.error_description);
                }
            );
        }

        function syncShippingNotifications() {
            vm.inProgress = true;
            if (!vm.shippingNotificationSettingsToSync || vm.shippingNotificationSettingsToSync.length === 0) {
                vm.inProgress = false;
                return;
            }

            var t = VisionApiShipmentNotificationsService.getContacts(vm.targetClient).$promise;
            t.then(
                function (targets) {
                    var i = 0;
                    _.forEach(vm.shippingNotificationSettingsToSync, function (notification) {

                        var target = _.find(targets, function (n) {
                            return n.notificationType === notification.notificationType;
                        });

                        notification.clientGuid = vm.targetClient.clientGuid;
                        var p;
                        switch (notification.notificationType.toLowerCase()) {
                            case 'stoparrival':
                                p = VisionApiShipmentNotificationsService.updateArrival(vm.targetClient, notification).$promise;
                                break;
                            case 'shipmentcompleted':
                                p = VisionApiShipmentNotificationsService.updateCompleted(vm.targetClient, notification).$promise;
                                break;
                            case 'shipmentcreated':
                                p = VisionApiShipmentNotificationsService.updateCreated(vm.targetClient, notification).$promise;
                                break;
                            case 'stopdeparture':
                                p = VisionApiShipmentNotificationsService.updateDeparture(vm.targetClient, notification).$promise;
                                break;
                            case 'shipmentoverdue':
                                p = VisionApiShipmentNotificationsService.updateOverdue(vm.targetClient, notification).$promise;
                                break;
                            default:
                                console.log(error);
                                vm.feedback.addError(error.data.error_description);
                                vm.inProgress = false;
                                return;
                        }
                        p.then(
                            function (result) {
                                notification.added = 'Yes';
                                if (++i >= vm.shippingNotificationSettingsToSync.length) {
                                    vm.inProgress = false;
                                    vm.shippingSettingsSyncComplete = true;
                                }

                            },
                            function (error) {
                                notification.added = 'ERROR';
                                console.log(error);
                                vm.feedback.addError(error.data.error_description);
                                if (++i >= vm.shippingNotificationSettingsToSync.length)
                                    vm.inProgress = false;
                            }
                        );
                    });
                },
                function (error) {
                    console.log(error);
                    vm.feedback.addError(error.data.error_description);
                    vm.inProgress = false;
                }
            );
        }

        function startShipmentTemplatesToSync() {
            if (!vm.polygonSyncComplete) {
                vm.feedback.addError('Polygon Geofences need to be synchronized first');
                return;
            }
            if (!vm.radialSyncComplete) {
                vm.feedback.addError('Radial Geofences need to be synchronized first');
                return;
            }            
            
            vm.shippingTemplateSyncComplete = false;
            vm.task = tasks.shippingTemplatesSyncInProgress;
            getShippingTemplatesToSync();
        }

        function getShippingTemplatesToSync() {
            vm.inProgress = true;
            vm.feedback.clear();
            vm.shippingTemplatesToSync = [];
            var p = ImportService.getShippingTemplates(vm.source.url, vm.token, vm.sourceClient).$promise;
            p.then(
                function (templates) {
                    if (!templates || templates.length === 0) {
                        vm.inProgress = false;
                        return;
                    }

                    _.forEach(templates, function (c) {
                        angular.extend(c,{
                            added: ''
                        });
                    });
                    vm.shippingTemplatesToSync = templates;
                    syncShippingTemplates();
                },
                function (error) {
                    vm.inProgress = false;
                    console.log(error);
                    vm.feedback.addError(error.data.error_description);
                }
            );
        }

        function syncShippingTemplates() {
            vm.inProgress = true;
            if (!vm.shippingTemplatesToSync || vm.shippingTemplatesToSync.length === 0) {
                vm.inProgress = false;
                vm.shippingTemplateSyncComplete = true;
                return;
            }

            var t = VisionApiShipmentTemplatesService.getTemplates(vm.targetClient, 1, 500).$promise;
            t.then(
                function (targets) {
                    var i = 0;
                    _.forEach(vm.shippingTemplatesToSync, function (template) {

                        var target = _.find(targets, function (t) {
                            return t.name === template.name;
                        });
                        if (target) {
                            template.added = 'Yes';
                            if (++i >= vm.shippingTemplatesToSync.length) {
                                vm.inProgress = false;
                                vm.shippingTemplateSyncComplete = true;
                            }
                            return;  //continue;
                        }

                        template.clientGuid = vm.targetClient.clientGuid;
                        _.forEach(template.stops, function (stop) {
                            if (!stop.geofenceId) {
                                return; //continue;
                            }
                            var targetGeoMap = _.find(vm.geofenceIdMaps, function (map) {
                                return map.sourceId === stop.geofenceId;
                            });

                            if (!targetGeoMap) {
                                template.added = 'ERROR';
                                vm.feedback.addError('Could not find target geofence Id for ' + template.name);
                                vm.inProgress = false;
                                return false;
                            }

                            stop.geofenceId = targetGeoMap.targetId;
                        });

                        if (!vm.inProgress) {
                            return false;
                        }

                        var p = VisionApiShipmentTemplatesService.createTemplate(vm.targetClient, template).$promise;
                        p.then(
                            function (result) {
                                template.added = 'Yes';
                                if (++i >= vm.shippingTemplatesToSync.length) {
                                    vm.inProgress = false;
                                    vm.shippingTemplateSyncComplete = true;
                                }
                            },
                            function (error) {
                                template.added = 'ERROR';
                                console.log(error);
                                vm.feedback.addError(error.data.error_description);
                                if (++i >= vm.shippingTemplatesToSync.length)
                                    vm.inProgress = false;
                            }
                        );
                    });

                    if (i >= vm.shippingTemplatesToSync.length) {
                        vm.inProgress = false;
                    }

                },
                function (error) {
                    console.log(error);
                    vm.feedback.addError(error.data.error_description);
                    vm.inProgress = false;
                }
            );
        }

        function startUsersToSync() {
            vm.task = tasks.userSyncInProgress;
            vm.userSyncComplete = false;
            getUsersToSync();
        }

        function getUsersToSync() {
            vm.inProgress = true;
            vm.feedback.clear();
            vm.usersToSync = [];
            var p = ImportService.getUsers(vm.source.url, vm.token, vm.sourceClient).$promise;
            p.then(
                function (users) {
                    if (!users || users.length === 0) {
                        vm.inProgress = false;
                        return;
                    }

                    _.forEach(users, function (user) {
                        if (!user.isActive) {
                            return; //continue
                        }

                        angular.extend(user,{
                            added: ''
                        });
                        vm.usersToSync.push(user);
                    });
                    syncUsers();
                },
                function (error) {
                    vm.inProgress = false;
                    console.log(error);
                    vm.feedback.addError(error.data.error_description);
                }
            );
        }

        function syncUsers() {
            vm.inProgress = true;
            if (!vm.usersToSync || vm.usersToSync.length === 0) {
                vm.inProgress = false;
                vm.userSyncComplete = true;
                return;
            }

            var t = VisionApiUsersService.getUsersOfClient(vm.targetClient).$promise;
            t.then(
                function (targetUsers) {
                    var i = 0;
                    _.forEach(vm.usersToSync, function (user) {

                        var targetUser = _.find(targetUsers, function (u) {
                            return u.email === user.email;
                        });
                        if (targetUser) {
                            user.added = 'Yes';
                            if (++i >= vm.usersToSync.length) {
                                vm.inProgress = false;
                                vm.userSyncComplete = true;
                            }
                            return;  //continue;
                        }

                        user.clientGuid = vm.targetClient.clientGuid;
                        var p = VisionApiUsersService.createUser(user).$promise;
                        p.then(
                            function (result) {
                                user.added = 'Yes';
                                if (++i >= vm.usersToSync.length) {
                                    vm.inProgress = false;
                                    vm.userSyncComplete = true;
                                }
                            },
                            function (error) {
                                user.added = 'ERROR';
                                console.log(error);
                                vm.feedback.addError(error.data.error_description);
                                if (++i >= vm.usersToSync.length)
                                    vm.inProgress = false;
                            }
                        );
                    });

                    if (i >= vm.usersToSync.length) {
                        vm.inProgress = false;
                    }
                },
                function (error) {
                    console.log(error);
                    vm.feedback.addError(error.data.error_description);
                    vm.inProgress = false;
                }
            );
        }

        function startAlarmsToSync() {
            if (!vm.polygonSyncComplete) {
                vm.feedback.addError('Polygon Geofences need to be synchronized first');
                return;
            }
            if (!vm.radialSyncComplete) {
                vm.feedback.addError('Radial Geofences need to be synchronized first');
                return;
            }
            if (!vm.routeSyncComplete) {
                vm.feedback.addError('Routes need to be synchronized first');
                return;
            }
            if (!vm.alarmContactSyncComplete) {
                vm.feedback.addError('Alarm Contacts need to be synchronized first');
                return;
            }
            if (!vm.devicesAddedComplete || !vm.devicesMovedComplete) {
                vm.feedback.addError('Devices need to be added and moved first');
                return;
            }

            vm.alarmsAddedComplete = false;
            vm.alarmActionsComplete = false;
            vm.alarmContactSyncComplete = false;
            vm.alarmRulesComplete = false;
            vm.alarmDevicesComplete = false;
            
            vm.task = tasks.alarmSyncInProgress;
            getAlarmsToSync();
        }

        function getAlarmsToSync() {
            vm.inProgress = true;
            vm.feedback.clear();
            vm.alarmsToSync = [];
            var alarmsToSync = [];
            var p = ImportService.getAlarms(vm.source.url, vm.token, vm.sourceClient).$promise;
            p.then(
                function (alarms) {
                    if (!alarms || alarms.length === 0) {
                        vm.inProgress = false;
                        return;
                    }

                    _.forEach(alarms, function (alarm) {
                        angular.extend(alarm,{
                            added: '',
                            rulesAdded: '',
                            configActionsAdded: '',
                            subscribersAdded: '',
                            devicesAdded: ''
                        });
                        alarmsToSync.push(alarm);
                    });
                    vm.alarmsToSync = alarmsToSync;
                    syncAlarms();
                },
                function (error) {
                    vm.inProgress = false;
                    console.log(error);
                    vm.feedback.addError(error.data.error_description);
                }
            );
        }

        function syncAlarms() {
            vm.alarmIdMaps = [];
            vm.inProgress = true;
            if (!vm.alarmsToSync || vm.alarmsToSync.length === 0) {
                vm.inProgress = false;
                vm.alarmsAddedComplete = true;
                return;
            }

            var t = VisionApiAlarmsService.getAlarms(vm.targetClient).$promise;
            t.then(
                function (targetAlarms) {
                    var i = 0;
                    _.forEach(vm.alarmsToSync, function (sourceAlarm) {

                        var targetAlarm = _.find(targetAlarms, function (ta) {
                            return ta.alarmName === sourceAlarm.alarmName;
                        });
                        if (targetAlarm) {
                            vm.alarmIdMaps.push({sourceAlarm: sourceAlarm, targetAlarm: targetAlarm });
                            sourceAlarm.added = 'Yes';
                            if (++i >= vm.alarmsToSync.length) {
                                vm.inProgress = false;
                                vm.alarmsAddedComplete = true;
                            }
                            return;  //continue;
                        }

                        var p = VisionApiAlarmsService.addAlarm(vm.targetClient, sourceAlarm).$promise;
                        p.then(
                            function (result) {
                                sourceAlarm.added = 'Yes';
                                vm.alarmIdMaps.push({sourceAlarm: sourceAlarm, targetAlarm: targetAlarm });
                                if (++i >= vm.alarmsToSync.length) {
                                    vm.inProgress = false;
                                    vm.alarmsAddedComplete = true;
                                }  
                            },
                            function (error) {
                                sourceAlarm.added = 'ERROR';
                                console.log(error);
                                vm.feedback.addError(error.data.error_description);
                                if (++i >= vm.usersToSync.length)
                                    vm.inProgress = false;
                            }
                        );
                    });

                    if (++i >= vm.alarmsToSync.length) {
                        vm.inProgress = false;
                    }
                },
                function (error) {
                    console.log(error);
                    vm.feedback.addError(error.data.error_description);
                    vm.inProgress = false;
                }
            );
        }

        function startAlarmRulesToSync() {
            vm.alarmRulesComplete = false;
            getSourceRules();
        }

        function getSourceRules() {
            vm.inProgress = true;
            if (!vm.alarmIdMaps || vm.alarmIdMaps.length === 0) {
                vm.inProgress = false;
                return;
            }

            var i = 0;
            _.forEach(vm.alarmIdMaps, function (alarmMap) {
                var sourceRulePromise = ImportService.getRulesForAlarm(vm.source.url, vm.token, alarmMap.sourceAlarm).$promise;
                sourceRulePromise.then(
                    function (sourceRules) {
                        alarmMap.sourceAlarm.rules = sourceRules;
                        if (++i >= vm.alarmIdMaps.length) {
                            syncTargetRules();
                        }
                    },
                    function (error) {
                        console.log(error);
                        alarmMap.sourceAlarm.rulesAdded = 'ERROR';
                        vm.feedback.addError(error.data.error_description);
                        vm.inProgress = false;
                    }
                );

                if (!vm.inProgress) {
                    return false;
                }

            });
        }

        function syncTargetRules() {
            var i = 0;
            _.forEach(vm.alarmIdMaps, function (alarmMap) {
                var tr = VisionApiAlarmsService.getRules(alarmMap.targetAlarm).$promise;
                tr.then(
                    function (targetRules) {
                        if (targetRules.length > 0) {
                            //assume someone has already set up the alarm, so exit
                            alarmMap.sourceAlarm.rulesAdded = 'Yes';

                            if (++i >= vm.alarmIdMaps.length) {
                                vm.inProgress = false;
                                vm.alarmRulesComplete = true;
                                return false;
                            }

                            return;
                        }

                        //add the rules from the sourceAlarm
                        var j = 0;
                        _.forEach(alarmMap.sourceAlarm.rules, function (sourceRule) {

                            var fixedConditions = [];
                            _.forEach( sourceRule.conditions, function (c) {
                                if (!vm.inProgress) {
                                    return false;
                                }

                                var needsGeofenceFix = c && c.toLowerCase().indexOf('geofence') >= 0 && c.split(' ').length === 2;
                                if (needsGeofenceFix) {
                                    var geoSplit = c.split(' ');
                                    var geoMap = _.find(vm.geofenceIdMaps, function(m) {
                                        return m.sourceId === parseInt(geoSplit[1]);
                                    });
                                    if (!geoMap) {
                                        alarmMap.sourceAlarm.rulesAdded = 'ERROR';
                                        vm.feedback.addError('Could not find target geofence for rule of ' + alarmMap.sourceAlarm.alarmName);
                                        vm.inProgress = false;
                                        return;
                                    }
                                    fixedConditions.push(geoSplit[0] + ' ' + geoMap.targetId);
                                    return; //continue
                                }

                                var needsRouteFix = c && c.toLowerCase().indexOf('route') >= 0 && c.split(' ').length === 2;
                                if (needsRouteFix) {
                                    var routeSplit = c.split(' ');
                                    var routeMap = _.find(vm.routeIdMaps, function(m) {
                                        return m.sourceId === parseInt(routeSplit[1]);
                                    });
                                    if (!routeMap) {
                                        alarmMap.sourceAlarm.rulesAdded = 'ERROR';
                                        vm.feedback.addError('Could not find target route for rule of ' + alarmMap.sourceAlarm.alarmName);
                                        vm.inProgress = false;
                                        return;
                                    }
                                    fixedConditions.push(routeSplit[0] + ' ' + routeMap.targetId);
                                    return; //continue
                                }

                                fixedConditions.push(c);
                            });

                            //exit if a geofence or route could not be mapped
                            if (!vm.inProgress) {
                                return false;
                            }
                            
                            var targetRule = {
                                alarmId: alarmMap.targetAlarm.alarmId,
                                ruleName: sourceRule.ruleName,
                                description: sourceRule.description,
                                conditions: fixedConditions

                            };
                            var addRulePromise = VisionApiAlarmsService.addRule(alarmMap.targetAlarm, targetRule).$promise;
                            addRulePromise.then(
                                function (newRule) {

                                    if (++j >= alarmMap.sourceAlarm.rules.length) {
                                        alarmMap.sourceAlarm.rulesAdded = 'Yes';
                                        if (++i >= vm.alarmIdMaps.length) {
                                            vm.inProgress = false;
                                            vm.alarmRulesComplete = true;
                                        }
                                    }
                                },
                                function (error) {
                                    console.log(error);
                                    alarmMap.sourceAlarm.rulesAdded = 'ERROR';
                                    vm.feedback.addError(error.data.error_description);
                                    vm.inProgress = false;
                                }
                            );

                            if (!vm.inProgress) {
                                return false;
                            }
                        });
                    },
                    function (error) {
                        console.log(error);
                        alarmMap.sourceAlarm.rulesAdded = 'Yes';
                        vm.feedback.addError(error.data.error_description);
                        vm.inProgress = false;
                    }
                );

                if (!vm.inProgress) {
                    return false;
                }
            });
        }

        function getSourceAlarmDevices() {
            vm.inProgress = true;
            if (!vm.alarmIdMaps || vm.alarmIdMaps.length === 0) {
                vm.inProgress = false;
                return;
            }

            var i = 0;
            _.forEach(vm.alarmIdMaps, function (alarmMap) {
                var sourceDevicePromise = ImportService.getDevicesForAlarm(vm.source.url, vm.token, alarmMap.sourceAlarm).$promise;
                sourceDevicePromise.then(
                    function (sourceDevices) {
                        alarmMap.sourceAlarm.devices = sourceDevices;
                        if (++i >= vm.alarmIdMaps.length) {
                            syncTargetAlarmDevices();
                        }
                    },
                    function (error) {
                        console.log(error);
                        alarmMap.sourceAlarm.devicesAdded = 'ERROR';
                        vm.feedback.addError(error.data.error_description);
                        vm.inProgress = false;
                    }
                );

                if (!vm.inProgress) {
                    return false;
                }

            });
        }

        function syncTargetAlarmDevices() {
            var i = 0;
            _.forEach(vm.alarmIdMaps, function (alarmMap) {
                var j = 0;

                if (!alarmMap.sourceAlarm.devices || alarmMap.sourceAlarm.devices.length === 0) {
                    alarmMap.sourceAlarm.devicesAdded = 'Yes';
                    if (++i >= vm.alarmIdMaps.length) {
                        vm.inProgress = false;
                        vm.alarmDevicesComplete = true;
                        return false;
                    }
                }

                _.forEach(alarmMap.sourceAlarm.devices, function (sourceDevice) {
                    var p = VisionApiAlarmsService.addDevice(alarmMap.targetAlarm, sourceDevice).$promise;
                    p.then(
                        function (assignedDevices) {
                            if (++j >= alarmMap.sourceAlarm.devices.length) {
                                alarmMap.sourceAlarm.devicesAdded = 'Yes';
                                if (++i >= vm.alarmIdMaps.length) {
                                    vm.inProgress = false;
                                    vm.alarmDevicesComplete = true;
                                }                            }
                        },
                        function (error) {
                            console.log(error);
                            alarmMap.sourceAlarm.devicesAdded = 'ERROR';
                            vm.feedback.addError(error.data.error_description);
                            vm.inProgress = false;
                        }
                    );

                    if (!vm.inProgress) {
                        return false;
                    }
                });

                if (!vm.inProgress) {
                    return false;
                }
            });
        }

        function getSourceAlarmActions() {
            vm.inProgress = true;
            if (!vm.alarmIdMaps || vm.alarmIdMaps.length === 0) {
                vm.inProgress = false;
                return;
            }

            var i = 0;
            _.forEach(vm.alarmIdMaps, function (alarmMap) {
                var p = ImportService.getConfigActionForAlarm(vm.source.url, vm.token, alarmMap.sourceAlarm).$promise;
                p.then(
                    function (sourceAction) {
                        alarmMap.sourceAlarm.configAction = sourceAction;
                        if (++i >= vm.alarmIdMaps.length) {
                            syncTargetAlarmActions();
                        }
                    },
                    function (error) {
                        console.log(error);
                        alarmMap.sourceAlarm.configActionsAdded = 'ERROR';
                        vm.feedback.addError(error.data.error_description);
                        vm.inProgress = false;
                    }
                );

                if (!vm.inProgress) {
                    return false;
                }

            });
        }

        function syncTargetAlarmActions() {
            var i = 0;
            _.forEach(vm.alarmIdMaps, function (alarmMap) {
                console.log(alarmMap.sourceAlarm);
                if (!alarmMap.sourceAlarm.configAction ||
                    (!alarmMap.sourceAlarm.configAction.standardInterval && !alarmMap.sourceAlarm.configAction.extendedInterval))
                {
                    alarmMap.sourceAlarm.configActionsAdded = 'Yes';
                    if (++i >= vm.alarmIdMaps.length) {
                        vm.inProgress = false;
                        vm.alarmActionsComplete = true;
                        
                        return false; //break
                    }
                    return;  //continue
                }

                var action = {
                    alarmId: alarmMap.targetAlarm.alarmId,
                    standardInterval: alarmMap.sourceAlarm.configAction.standardInterval,
                    extendedInterval: alarmMap.sourceAlarm.configAction.extendedInterval
                };

                var p = VisionApiAlarmsService.changeConfigAction(alarmMap.targetAlarm, action).$promise;
                p.then(
                    function (result) {
                        alarmMap.sourceAlarm.configActionsAdded = 'Yes';
                        if (++i >= vm.alarmIdMaps.length) {
                            vm.inProgress = false;
                            vm.alarmActionsComplete = true;
                        }
                    },
                    function (error) {
                        console.log(error);
                        alarmMap.sourceAlarm.configActionsAdded = 'ERROR';
                        vm.feedback.addError(error.data.error_description);
                        vm.inProgress = false;
                    }
                );

                if (!vm.inProgress) {
                    return false;
                }
            });
        }

        function getSourceAlarmSubscribers() {
            vm.inProgress = true;
            if (!vm.alarmIdMaps || vm.alarmIdMaps.length === 0) {
                vm.inProgress = false;
                return;
            }

            var i = 0;
            _.forEach(vm.alarmIdMaps, function (alarmMap) {
                var p = ImportService.getSubscribersForAlarm(vm.source.url, vm.token, alarmMap.sourceAlarm).$promise;
                p.then(
                    function (sourceSubscribers) {
                        alarmMap.sourceAlarm.subscribers = sourceSubscribers;
                        if (++i >= vm.alarmIdMaps.length) {
                            syncTargetAlarmSubscribers();
                        }
                    },
                    function (error) {
                        console.log(error);
                        alarmMap.sourceAlarm.subscribersAdded = 'ERROR';
                        vm.feedback.addError(error.data.error_description);
                        vm.inProgress = false;
                    }
                );

                if (!vm.inProgress) {
                    return false;
                }

            });
        }

        function syncTargetAlarmSubscribers() {
            var i = 0;
            _.forEach(vm.alarmIdMaps, function (alarmMap) {
                var j = 0;

                if (!alarmMap.sourceAlarm.subscribers || alarmMap.sourceAlarm.subscribers.length === 0) {
                    alarmMap.sourceAlarm.subscribersAdded = 'Yes';
                    if (++i >= vm.alarmIdMaps.length) {
                        vm.inProgress = false;
                        vm.alarmSubscribersComplete = true;
                        return false;
                    }
                }

                _.forEach(alarmMap.sourceAlarm.subscribers, function (sourceSubscriber) {
                    var targetMap = _.find(vm.alarmContactIdMaps, function (map) {
                        return map.sourceId === sourceSubscriber.contactId;
                    });

                    if (!targetMap) {
                        alarmMap.sourceAlarm.subscribersAdded = 'ERROR';
                        vm.feedback.addError('Could not find targetSubscriberId');
                        vm.inProgress = false;
                        return false;
                    }

                    var sub = {
                        contactId: targetMap.targetId
                    };
                    var p = VisionApiAlarmsService.addSubscriber(alarmMap.targetAlarm, sub).$promise;
                    p.then(
                        function (assignedSubs) {
                            if (++j >= alarmMap.sourceAlarm.subscribers.length) {

                                alarmMap.sourceAlarm.subscribersAdded = 'Yes';
                                if (++i >= vm.alarmIdMaps.length) {
                                    vm.inProgress = false;
                                    vm.alarmSubscribersComplete = true;
                                    
                                }
                            }
                        },
                        function (error) {
                            console.log(error);
                            alarmMap.sourceAlarm.subscribersAdded = 'ERROR';
                            vm.feedback.addError(error.data.error_description);
                            vm.inProgress = false;
                        }
                    );

                    if (!vm.inProgress) {
                        return false;
                    }
                });

                if (!vm.inProgress) {
                    return false;
                }
            });
        }

        function startAlarmDevicesSync() {
            vm.alarmDevicesComplete = false;

            getSourceAlarmDevices();
        }

        function startAlarmSubscriberSync() {
            vm.alarmSubscribersComplete = false;

            getSourceAlarmSubscribers();
        }

        function startAlarmConfigActionSync() {
            vm.alarmActionsComplete = false;

            getSourceAlarmActions();
        }

        function confirmSourceClient(client) {
            console.log(client);
            vm.task = tasks.confirmSourceClient;
            var clientOptions = [client];
            var p = ImportService.getChildrenOfClient(vm.source.url, vm.token, client).$promise;
            p.then(
                function (children) {
                    _.forEach(children, function(child) {
                        clientOptions.push(child);
                    });
                    vm.clientOptions = clientOptions;
                },
                function (error) {
                    console.log(error);
                    vm.feedback.addError(error.data.error_description);
                    vm.inProgress = false;
                }
            );
        }
    }
})();

