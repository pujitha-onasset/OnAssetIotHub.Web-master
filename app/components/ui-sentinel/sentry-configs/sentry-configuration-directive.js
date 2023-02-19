(function () {
    'use strict';

    angular
        .module('ui-sentinel.sentry-configs')
        .directive('sentryConfiguration', SentryConfigurationDirective);

    function SentryConfigurationDirective() {
        var directive = {
            restrict: 'A',
            controller: ThisDirectiveController,
            controllerAs: 'sentryConfiguration',
            templateUrl: 'ui-sentinel-sentry-configs/sentry-configuration-directive.html',
            link: link
        };
        return directive;

        function link(scope, element, attrs, controller) {
           
            scope.$watch(
                function(scope) {
                    return scope.sentryConfigsByDeviceUi.imei;
                },
                function (newValue, oldValue) {
                    controller.device = newValue;
                }, true
            );
            scope.$watch(
                function(scope) {
                    return scope.sentryConfigsByDeviceUi.configuration;
                },
                function (newValue, oldValue) {
                    controller.configuration = newValue;
                    controller.actions.reload();
                }, true
            );
            scope.$watch(
                function(scope) {
                    return scope.sentryConfigsByDeviceUi.assignmentAccountId;
                },
                function (newValue, oldValue) {
                    controller.assignmentAccountId = newValue;
                    controller.actions.reload();
                }, true
            );
           
        }        
    }

    ThisDirectiveController.$inject = ['$rootScope','SentryConfigurationService', 'DeviceCommandsService', 'SentinelUiSession', 'FeedbackService', 'UomTemperatureConverter', 'SentryAdminApiService'];
    function ThisDirectiveController($rootScope,SentryConfigurationService, DeviceCommandsService, SentinelUiSession, FeedbackService, UomTemperatureConverter, SentryAdminApiService) {
        var RANGES = {
            battery: { min: 0, max: 100 },
            humidity: { min: 0, max: 100 },
            light: { min: 0, max: 1000 },
            pressure: { min: 50, max: 110 },
            shock: { min: 2, max: 15 },
            temperatureC: { min: -20, max: 60 },
            temperatureF: { min: -4, max: 140 },
            probeC: { min: -150, max: 150 },
            probeF: { min: -238, max: 302 },
            minutes: {min: 5, max: 120},
            hours: {min: 1, max: 48}
        };


        var vm = {
            device: null,
            configuration: null,
            hasPending: false,
            assignmentAccountId:null,
            feedback: FeedbackService,
            pending: [],
            extendedReportingInterval: {
                current: {"reportingIntervalInMinutes":null,
                    "isExtendedReportingIntervalOn":false},
                pending: null,
                form: {
                    isChanging: false,
                    on: null,
                    unit: 'minutes',
                    value: null,
                    max: RANGES.minutes.max,
                    min: RANGES.minutes.min,
                    onChange: function() {
                        this.min = RANGES[this.unit].min;
                        this.max = RANGES[this.unit].max;
                    },
                    changeUnit: function(unit) {
                        this.unit = unit;
                        this.onChange();
                    }
                }
            },
            dataLog: {
                pending: null
            },
            firmware: {
                current: null,
                pending: null
            },
            ftpServer: {
                current: null,
                pending: null,
                form: {
                    isChanging: false,
                    serverUrl: null,
                    serverPort: null
                }
            },
            light: {
                current: {isMonitoringOn:false},
                pending: null,
                form: {
                    isChanging: false,
                    on: null,
                    minutes: 60,
                    below: null,
                    above: null,
                    aboveMax: RANGES.light.max,
                    aboveMin: RANGES.light.min,
                    belowMax: RANGES.light.max,
                    belowMin: RANGES.light.min,
                    onChange: function() {
                        this.aboveMin = this.below || this.below === RANGES.light.min ?
                            (this.below !== RANGES.light.max ? this.below + 1 : RANGES.light.max) :
                            RANGES.light.min;

                        this.belowMax = this.above || this.above === RANGES.battery.min ?
                            (this.above !== RANGES.light.min ? this.above - 1 : RANGES.light.min) :
                            RANGES.light.max;
                    }
                }
            },
            operationState: {
                current: {operationState:null},
                pending: null,
                form: {
                    isChanging: false,
                    operationState: null
                }
            },
            humidity: {
                current: {isMonitoringOn:false},
                pending: null,
                form: {
                    isChanging: false,
                    on: null,
                    minutes: 15,
                    above: null,
                    below: null,
                    aboveMax: RANGES.humidity.max,
                    aboveMin: RANGES.humidity.min,
                    belowMax: RANGES.humidity.max,
                    belowMin: RANGES.humidity.min,
                    onChange: function() {
                        this.aboveMin = this.below || this.below === RANGES.humidity.min ?
                            (this.below !== RANGES.humidity.max ? this.below + 1 : RANGES.humidity.max) :
                            RANGES.humidity.min;

                        this.belowMax = this.above || this.above === RANGES.battery.min ?
                            (this.above !== RANGES.humidity.min ? this.above - 1 : RANGES.humidity.min) :
                            RANGES.humidity.max;
                    }
                }
            },
            refresh: {
                pending: null
            },
            reportServer: {
                gateways: ["OnAssetDev1.azure-devices.net","oaiprodus.azure-devices.net"],
                current: {serverAddress:null},
                pending: null,
                form: {
                    isChanging: false,
                    server:null,
                    port:8883
                }
            },
            pressure: {
                current: {isMonitoringOn:false},
                pending: null,
                form: {
                    isChanging: false,
                    on: null,
                    minutes: 15,
                    above: null,
                    below: null,
                    aboveMax: RANGES.pressure.max,
                    aboveMin: RANGES.pressure.min,
                    belowMax: RANGES.pressure.max,
                    belowMin: RANGES.pressure.min,
                    onChange: function() {
                        this.aboveMin = this.below || this.below === RANGES.pressure.min ?
                            (this.below !== RANGES.pressure.max ? this.below + 1 : RANGES.pressure.max) :
                            RANGES.pressure.min;

                        this.belowMax = this.above || this.above === RANGES.battery.min ?
                            (this.above !== RANGES.pressure.min ? this.above - 1 : RANGES.pressure.min) :
                            RANGES.pressure.max;
                    }
                }
            },
            refresh: {
                pending: null
            },
            reportServer: {
                gateways: ["OnAssetDev1.azure-devices.net","oaiprodus.azure-devices.net"],
                current: {serverAddress:null},
                pending: null,
                form: {
                    isChanging: false,
                    server:null,
                    port:8883
                }
            },
            shock: {
                current: {isMonitoringOn:false},
                pending: null,
                form: {
                    isChanging: false,
                    on: null,
                    minutes: 60,
                    above: null,
                    max: RANGES.shock.max,
                    min: RANGES.shock.min
                }
            },
            standardReportingInterval: {
                current:  {reportingIntervalInMinutes:null},
                pending: null,
                form: {
                    isChanging: false,
                    unit: 'minutes',
                    value: null,
                    max: RANGES.minutes.max,
                    min: RANGES.minutes.min,
                    onChange: function() {
                        this.min = RANGES[this.unit].min;
                        this.max = RANGES[this.unit].max;
                    },
                    changeUnit: function(unit) {
                        this.unit = unit;
                        this.onChange();
                    }
                }
            },
             // wifi: {
            //     current: {wifi:null},
            //     pending: null,
            //     form: {
            //         isChanging: false,
            //         wifi: null
            //     }
            // },
            wifi: {
                current: {
                          isConfigured:false, 
                          ssid: null,
                          password:null
                        },
                pending: null,
                form: {
                    isChanging: false,
                    on: null,
                    minutes: 15,
                    ssid: null,
                    password:null
                }
            },
            temperature: {
                current: {isMonitoringOn:false},
                pending: null,
                form: {
                    isChanging: false,
                    on: null,
                    minutes: 15,
                    below: null,
                    above: null,
                    unit: 'c',
                    aboveMax: RANGES.temperatureC.max,
                    aboveMin: RANGES.temperatureC.min,
                    belowMax: RANGES.temperatureC.max,
                    belowMin: RANGES.temperatureC.min,
                    onChange: function() {
                        var range = this.unit === 'c' ? 'temperatureC' : 'temperatureF';

                        this.aboveMin = this.below || this.below === 0 || this.below === RANGES[range].min ?
                            (this.below !== RANGES[range].max ? this.below + 1 : RANGES[range].max) :
                            RANGES[range].min;

                        this.aboveMax = RANGES[range].max;

                        this.belowMax = this.above || this.above === 0 || this.above === RANGES[range].min ?
                            (this.above !== RANGES[range].min ? this.above - 1 : RANGES[range].min) :
                            RANGES[range].max;

                        this.belowMin = RANGES[range].min;

                    },
                    changeUnit: function(unit) {
                        this.unit = unit;
                        this.onChange();
                    }
                },
                fahrenheit: UomTemperatureConverter.fahrenheit

            },
            panel: {
                isCollapsed: true,
                toggle: function () {
                    this.isCollapsed = !this.isCollapsed;
                    if (!this.isCollapsed) { load(); }
                }
            },
            hasPermission: {
                toReadAdminConfigs: false,
                toChangeAdminConfigs: false,
                toChangeConfigs: false,
                toCancelCommands: false
            },
            mode: {
                isChanging: false
            },
            actions: {
                operationState: {
                    begin: beginChangeOperationState,
                    end: endChangeOperationState,
                    cancel: cancelChangeOperationState,
                    submit: submitChangeOperationState
                },
                dataLog: {
                    request: requestDataLog,
                    cancel: cancelDataLog
                },
                dataFrequency: {
                    begin: beginChangeReportingInterval,
                    end: endChangeReportingInterval,
                    submit: submitChangeReportingInterval,
                    cancel: cancelChangeReportingInterval
                },
                light: {
                    begin: beginChangeLight,
                    end: endChangeLight,
                    submit: submitChangeLight,
                    cancel: cancelChangeLight
                },
                pressure: {
                    begin: beginChangePressure,
                    end: endChangePressure,
                    submit: submitChangePressure,
                    cancel: cancelChangePressure
                },
                humidity: {
                    begin: beginChangeHumidity,
                    end: endChangeHumidity,
                    submit: submitChangeHumidity,
                    cancel: cancelChangeHumidity
                },
                shock: {
                    begin: beginChangeShock,
                    end: endChangeShock,
                    submit: submitChangeShock,
                    cancel: cancelChangeShock
                },                
                temperature: {
                    begin: beginChangeTemperature,
                    end: endChangeTemperature,
                    submit: submitChangeTemperature,
                    cancel: cancelChangeTemperature
                },
                reportServer: {
                    begin: beginChangeReportServer,
                    end: endChangeReportServer,
                    submit: submitChangeReportServer,
                    cancel: cancelChangeReportServer
                },
                ftpServer: {
                    begin: beginChangeFtpServer,
                    end: endChangeFtpServer,
                    submit: submitChangeFtpServer,
                    cancel: cancelChangeFtpServer
                },
                wifi: {
                    begin: beginChangeWifi,
                    end: endChangeWifi,
                    submit: submitChangeWifi,
                    cancel: cancelChangeWifi
              },
                refreshConfig: refreshConfig,
                cancelFirmwareCommand: cancelFirmwareCommand,
                reload: load
            }
        };
        activate();
        return vm;

        ///////////////////////////////////////////////////

        function activate() {
            setPermissions();
        }

        function beginChangeOperationState() {
            vm.operationState.form.operationState = vm.operationState.current.operationState;
            vm.operationState.form.isChanging = true;
        }

        function endChangeOperationState() {
            vm.operationState.form.operationState = null;
            vm.operationState.form.isChanging = false;
        }

        function submitChangeOperationState() {
            vm.feedback.clear();
            $rootScope.loading=true;            
            var promise = SentryConfigurationService.changeOperationState(vm.device,vm.assignmentAccountId, vm.operationState.form.operationState).$promise;
            promise.then(
                function (result) {
                    $rootScope.loading=false;
                    vm.operationState.pending={};
                    vm.operationState.pending.id=result.id;
                    vm.operationState.pending.operationState = result.opMode;
                    endChangeOperationState();
                },
                function (error) {
                    $rootScope.loading=false;
                    vm.feedback.addError(error.data.message);
                    endChangeOperationState();
                }
            );
        }

        function cancelChangeOperationState() {
            vm.feedback.clear();

            var pendingCommand = vm.operationState.pending;
            if (pendingCommand !== null) {
                $rootScope.loading=true;
                var promise = SentryConfigurationService.cancelOperationState(vm.assignmentAccountId,pendingCommand.id).$promise;
                promise.then(
                    function (result) {
                        $rootScope.loading=false;
                        vm.operationState.pending = null;
                    },
                    function (error) {
                        $rootScope.loading=false;
                        if (error.status === 404) {
                            vm.operationState.pending = null;
                            return;
                        }

                        vm.feedback.addError(error.data.message);
                    }
                );
            }
        }

        function beginChangeWifi() {
            if (!vm.wifi.current || !vm.wifi.current.isConfigured) {
                vm.wifi.form.on = false;
            }
            else {
                vm.wifi.form.ssid = vm.wifi.current.ssid;
                vm.wifi.form.password =null;
                vm.wifi.form.on = true;
                vm.mode.isChanging = true;
            }
            vm.wifi.form.isChanging = true;
        }
        function endChangeWifi()  {
            vm.wifi.form.ssid = null;
            vm.wifi.form.password = null;
            vm.wifi.form.on = null;
            vm.wifi.form.isChanging = false;
        }
        function submitChangeWifi() {
            vm.feedback.clear();
            var noCommand = true;
            var command = {
                deviceId: vm.device,
                clientId: vm.assignmentAccountId,
                isConfigured: vm.wifi.form.on
            };
            if (vm.wifi.form.on) {
                command.pollingIntervalInMinutes = vm.wifi.form.minutes;
                vm.wifi.form.ssid = vm.wifi.form.ssid;
                vm.wifi.form.password = vm.wifi.form.password;
                command.ssid = vm.wifi.form.ssid;
                command.password = vm.wifi.form.password;
            }
			
            if (vm.wifi.current.pollingIntervalInMinutes !== command.pollingIntervalInMinutes ||
                vm.wifi.current.isConfigured !== command.isConfigured ||
                vm.wifi.current.ssid !== command.ssid ||
                vm.wifi.current.password !== command.password) {

                noCommand = false;
                $rootScope.loading=true;
                var promise = SentryConfigurationService.changeWifi(command).$promise;
                promise.then(
                    function (result) {
                        $rootScope.loading=false;
                        command.commandId = result.commandId;
                        command.id = result.id;
                        vm.wifi.pending = command;
                        vm.hasPending = true;
                        endChangeWifi();
                    },
                    function (error) {
                        $rootScope.loading=false;
                        vm.feedback.addError(error.data.message);
                        endChangeWifi();
                    }
                );
            }

            if (noCommand) {
                endChangeWifi();
            }
        }
        function cancelChangeWifi() {
            vm.feedback.clear();
            var pendingCommand = vm.wifi.pending;
            if (pendingCommand !== null) {
                $rootScope.loading=true;
                var promise = DeviceCommandsService.cancelCommand(vm.assignmentAccountId, pendingCommand.commandId,pendingCommand.id).$promise;
                promise.then(
                    function (result) {
                        $rootScope.loading=false;
                        vm.wifi.pending = null;
                        updateHasPending();
                    },
                    function (error) {
                        $rootScope.loading=false;
                        if (error.status === 404) {
                            vm.wifi.pending = null;
                            updateHasPending();
                            return;
                        }
                        vm.feedback.addError(error.data.message);
                    }
                );
            }
        }

        function beginChangeReportingInterval() {
            if (vm.standardReportingInterval.current.reportingIntervalInMinutes <= RANGES.minutes.max) {
                vm.standardReportingInterval.form.value = vm.standardReportingInterval.current.reportingIntervalInMinutes;
                vm.standardReportingInterval.form.unit = 'minutes';
                vm.standardReportingInterval.form.changeUnit(vm.standardReportingInterval.form.unit);
            }
            else {
                vm.standardReportingInterval.form.value = Math.round(vm.standardReportingInterval.current.reportingIntervalInMinutes / 60 * 10) / 10;
                vm.standardReportingInterval.form.unit = 'hours';
                vm.standardReportingInterval.form.changeUnit(vm.standardReportingInterval.form.unit);
            }
            
            if (vm.extendedReportingInterval.current.reportingIntervalInMinutes <= RANGES.minutes.max) {
                vm.extendedReportingInterval.form.value = vm.extendedReportingInterval.current.reportingIntervalInMinutes;
                vm.extendedReportingInterval.form.unit = 'minutes';
                vm.extendedReportingInterval.form.changeUnit(vm.extendedReportingInterval.form.unit);
            }
            else {
                vm.extendedReportingInterval.form.value = Math.round(vm.extendedReportingInterval.current.reportingIntervalInMinutes / 60 * 10) / 10;
                vm.extendedReportingInterval.form.unit = 'hours';
                vm.extendedReportingInterval.form.changeUnit(vm.extendedReportingInterval.form.unit);
            }

            vm.extendedReportingInterval.form.on = vm.extendedReportingInterval.current.isExtendedReportingIntervalOn;
            vm.standardReportingInterval.form.isChanging = true;
            vm.extendedReportingInterval.form.isChanging = true;
        }

        function endChangeReportingInterval() {
            vm.standardReportingInterval.form.isChanging = false;
            vm.extendedReportingInterval.form.isChanging = false;
        }

        function submitChangeReportingInterval() {
            vm.feedback.clear();
            var noCommandForStandard = true;
            var noCommandForExtended = true;
            var stdIntMinutes = vm.standardReportingInterval.form.unit === 'minutes' ? Math.round(vm.standardReportingInterval.form.value) : Math.round(vm.standardReportingInterval.form.value * 60);
            var extIntMinutes = vm.extendedReportingInterval.form.unit === 'minutes' ? Math.round(vm.extendedReportingInterval.form.value) : Math.round(vm.extendedReportingInterval.form.value * 60);

            if (vm.standardReportingInterval.current.reportingIntervalInMinutes !== stdIntMinutes) {

                noCommandForStandard = false;
                var stdCommand = {
                    deviceId: vm.device,
                    clientId: vm.assignmentAccountId,
                    reportingIntervalInMinutes: stdIntMinutes
                };
                $rootScope.loading=true;
                var stdPromise = SentryConfigurationService.changeStandardReportingInterval( stdCommand).$promise;
                stdPromise.then(
                    function (result) {

                        stdCommand.commandId = result.commandId;
                        stdCommand.id = result.id; 
                        vm.standardReportingInterval.pending = stdCommand;
                        vm.standardReportingInterval.pending.text = 'Every ' + Math.round(vm.standardReportingInterval.form.value) + ' ' + vm.standardReportingInterval.form.unit ;
                        updateHasPending();
                        endChangeReportingInterval();
                        if (vm.extendedReportingInterval.current.isExtendedReportingIntervalOn !== vm.extendedReportingInterval.form.on ||
                            (vm.extendedReportingInterval.current.reportingIntervalInMinutes !== extIntMinutes && extIntMinutes)) {

                            noCommandForExtended = false;
                            var extCommand = {
                                deviceId: vm.device,
                                clientId: vm.assignmentAccountId,
                                isExtendedReportingIntervalOn: vm.extendedReportingInterval.form.on
                            };
                            if (vm.extendedReportingInterval.form.on) {
                                extCommand.reportingIntervalInMinutes = extIntMinutes;
                            }

                            var extPromise = SentryConfigurationService.changeExtendedReportingInterval( extCommand).$promise;
                            extPromise.then(
                                function (result) {
                                    extCommand.commandId = result.commandId;
                                    extCommand.id = result.id;
                                    vm.extendedReportingInterval.pending = extCommand;
                                    vm.extendedReportingInterval.pending.text = extCommand.isExtendedReportingIntervalOn ?  'Every ' + Math.round(vm.extendedReportingInterval.form.value) + ' ' + vm.extendedReportingInterval.form.unit + ' while at rest' : null;
                                    if (!vm.standardReportingInterval.pending) {
                                        vm.standardReportingInterval.pending = { text: 'Every ' + Math.round(vm.standardReportingInterval.form.value) + ' ' + vm.standardReportingInterval.form.unit + (extCommand.isExtendedReportingIntervalOn ? ' while in motion' : '') };
                                    }

                                    updateHasPending();
                                    endChangeReportingInterval();
                                    $rootScope.loading=false;
                                },
                                function (error) {
                                    vm.feedback.addError(error.data.message);
                                    $rootScope.loading=false;
                                    endChangeReportingInterval();
                                }
                            );
                        }else{
                            $rootScope.loading=false;
                        }

                        
                        endChangeReportingInterval();
                        
                    },
                    function (error) {
                        vm.feedback.addError(error.data.message);
                        $rootScope.loading=false;
                        endChangeReportingInterval();
                    }
                );
            }else{

                if (vm.extendedReportingInterval.current.isExtendedReportingIntervalOn !== vm.extendedReportingInterval.form.on ||
                    (vm.extendedReportingInterval.current.reportingIntervalInMinutes !== extIntMinutes && extIntMinutes)) {

                    noCommandForExtended = false;
                    var extCommand = {
                        deviceId: vm.device,
                        clientId: vm.assignmentAccountId,
                        isExtendedReportingIntervalOn: vm.extendedReportingInterval.form.on
                    };
                    if (vm.extendedReportingInterval.form.on) {
                        extCommand.reportingIntervalInMinutes = extIntMinutes;
                    }
                    $rootScope.loading=true;
                    var extPromise = SentryConfigurationService.changeExtendedReportingInterval( extCommand).$promise;
                    extPromise.then(
                        function (result) {
                            $rootScope.loading=false;
                            extCommand.commandId = result.commandId;
                            extCommand.id = result.id;
                            vm.extendedReportingInterval.pending = extCommand;
                            vm.extendedReportingInterval.pending.text = extCommand.isExtendedReportingIntervalOn ?  'Every ' + Math.round(vm.extendedReportingInterval.form.value) + ' ' + vm.extendedReportingInterval.form.unit + ' while at rest' : null;
                            if (!vm.standardReportingInterval.pending) {
                                vm.standardReportingInterval.pending = { text: 'Every ' + Math.round(vm.standardReportingInterval.form.value) + ' ' + vm.standardReportingInterval.form.unit + (extCommand.isExtendedReportingIntervalOn ? ' while in motion' : '') };
                            }

                            updateHasPending();
                            endChangeReportingInterval();
                        },
                        function (error) {
                            vm.feedback.addError(error.data.message);
                            $rootScope.loading=false;
                            endChangeReportingInterval();
                        }
                    );
                }

                if (noCommandForStandard && noCommandForExtended) {
                    endChangeReportingInterval();
                }
            }


        }

        function cancelChangeReportingInterval() {
            vm.feedback.clear();

            var pendingCommand = vm.standardReportingInterval.pending;
            if (pendingCommand !== null && pendingCommand.commandId) {
                $rootScope.loading=true;
                var stdPromise = DeviceCommandsService.cancelCommand(vm.assignmentAccountId, pendingCommand.commandId,pendingCommand.id).$promise;
                stdPromise.then(
                    function(result) {
                        $rootScope.loading=false;
                        vm.standardReportingInterval.pending = null;
                        updateHasPending();
                        
                        pendingCommand = vm.extendedReportingInterval.pending;
                        if (pendingCommand !== null) {
                            var extPromise = DeviceCommandsService.cancelCommand(vm.assignmentAccountId, pendingCommand.commandId,pendingCommand.id).$promise;
                            extPromise.then(
                                function(result) {
                                    vm.extendedReportingInterval.pending = null;
                                    updateHasPending();
                                },
                                function (error) {
                                    if (error.status === 404) {
                                        vm.extendedReportingInterval.pending = null;
                                        updateHasPending();
                                        return;
                                    }
                                    vm.feedback.addError(error.data.message);
                                }
                            );
                        }
                    },
                    function (error) {
                        $rootScope.loading=false;
                        if (error.status === 404) {
                            vm.standardReportingInterval.pending = null;
                            updateHasPending();
                            return;
                        }
                        vm.feedback.addError(error.data.message);
                    }
                );
            }
            else {
                vm.standardReportingInterval.pending = null;
                updateHasPending();

                pendingCommand = vm.extendedReportingInterval.pending;
                if (pendingCommand !== null) {
                    $rootScope.loading=true;
                    var extPromise = DeviceCommandsService.cancelCommand(vm.assignmentAccountId, pendingCommand.commandId,pendingCommand.id).$promise;
                    extPromise.then(
                        function(result) {
                            $rootScope.loading=false;
                            vm.extendedReportingInterval.pending = null;
                            updateHasPending();
                        },
                        function (error) {
                            $rootScope.loading=false;
                            if (error.status === 404) {
                                vm.extendedReportingInterval.pending = null;
                                updateHasPending();
                                return;
                            }
                            vm.feedback.addError(error.data.message);
                        }
                    );
                }
            }

        }

        function beginChangeTemperature() {
            if (!vm.temperature.current || !vm.temperature.current.isMonitoringOn) {
                vm.temperature.form.above = null;
                vm.temperature.form.below = null;
                vm.temperature.form.on = false;
            }
            else {
                vm.temperature.form.above = Math.min(vm.temperature.current.maxCelsius, RANGES.temperatureC.max);
                vm.temperature.form.below = Math.min(vm.temperature.current.minCelsius, RANGES.temperatureC.max);
                vm.temperature.form.on = true;
            }
            vm.temperature.form.unit = 'c';
            vm.temperature.form.isChanging = true;
        }

        function endChangeTemperature() {
            vm.temperature.form.above = null;
            vm.temperature.form.below = null;
            vm.temperature.form.on = null;
            vm.temperature.form.isChanging = false;
        }

        function submitChangeTemperature() {
            vm.feedback.clear();

            var noCommand = true;
            var command = {
                deviceId: vm.device,
                clientId: vm.assignmentAccountId,
                isMonitoringOn: vm.temperature.form.on
            };
            if (vm.temperature.form.on) {
                command.pollingIntervalInMinutes = vm.temperature.form.minutes;
                vm.temperature.form.below = Math.round(vm.temperature.form.below * 100) / 100;
                vm.temperature.form.above = Math.round(vm.temperature.form.above * 100) / 100;
                command.minCelsius = vm.temperature.form.unit === 'c' ? vm.temperature.form.below : UomTemperatureConverter.celsius(vm.temperature.form.below, 'floor');
                command.maxCelsius = vm.temperature.form.unit === 'c' ? vm.temperature.form.above : UomTemperatureConverter.celsius(vm.temperature.form.above, 'ceil');
            }
            
            if (vm.temperature.current.pollingIntervalInMinutes !== command.pollingIntervalInMinutes ||
                vm.temperature.current.isMonitoringOn !== command.isMonitoringOn ||
                vm.temperature.current.minCelsius !== command.minCelsius ||
                vm.temperature.current.maxCelsius !== command.maxCelsius) {

                noCommand = false;
                $rootScope.loading=true;
                var promise = SentryConfigurationService.changeTemperature( command).$promise;
                promise.then(
                    function (result) {
                        $rootScope.loading=false;
                        command.commandId = result.commandId;
                        command.id = result.id;
                        vm.temperature.pending = command;
                        vm.hasPending = true;
                        endChangeTemperature();
                    },
                    function (error) {
                        $rootScope.loading=false;
                        vm.feedback.addError(error.data.message);
                        endChangeTemperature();
                    }
                );
            }

            if (noCommand) {
                endChangeTemperature();
            }
        }

        function cancelDataLog() {
            vm.feedback.clear();

            var pendingCommand = vm.dataLog.pending;
            if (pendingCommand !== null) {
                $rootScope.loading=true;
                var promise = DeviceCommandsService.cancelCommand(vm.assignmentAccountId, pendingCommand.commandId,pendingCommand.id).$promise;
                promise.then(
                    function (result) {
                        $rootScope.loading=false;
                        vm.dataLog.pending = null;
                    },
                    function (error) {
                        $rootScope.loading=false;
                        if (error.status === 404) {
                            vm.dataLog.pending = null;
                            return;
                        }

                        vm.feedback.addError(error.data.message);
                    }
                );
            }
        }

        function cancelChangeTemperature() {
            vm.feedback.clear();

            var pendingCommand = vm.temperature.pending;
            if (pendingCommand !== null) {
                $rootScope.loading=true;
                var promise = DeviceCommandsService.cancelCommand(vm.assignmentAccountId, pendingCommand.commandId,pendingCommand.id).$promise;
                promise.then(
                    function (result) {
                        $rootScope.loading=false;
                        vm.temperature.pending = null;
                        updateHasPending();
                    },
                    function (error) {
                        $rootScope.loading=false;
                        if (error.status === 404) {
                            vm.temperature.pending = null;
                            updateHasPending();
                            return;
                        }

                        vm.feedback.addError(error.data.message);
                    }
                );
            }
        }

        function beginChangeLight() {
            if (!vm.light.current || !vm.light.current.isMonitoringOn) {
                vm.light.form.above = null;
                vm.light.form.below = null;
                vm.light.form.on = false;
            }
            else {
                vm.light.form.above = Math.min(vm.light.current.maxLux, RANGES.light.max);
                vm.light.form.below = Math.min(vm.light.current.minLux, RANGES.light.max);
                vm.light.form.on = true;
            }
            vm.light.form.isChanging = true;
        }

        function endChangeLight() {
            vm.light.form.above = null;
            vm.light.form.below = null;
            vm.light.form.on = null;
            vm.light.form.isChanging = false;
        }

        function submitChangeLight() {
            vm.feedback.clear();

            var noCommand = true;
            var command = {
                deviceId: vm.device,
                clientId: vm.assignmentAccountId,
                isMonitoringOn: vm.light.form.on
            };
            if (vm.light.form.on) {
                command.pollingIntervalInMinutes = vm.light.form.minutes;
                vm.light.form.below = Math.round(vm.light.form.below);
                vm.light.form.above = Math.round(vm.light.form.above);
                command.minLux = vm.light.form.below;
                command.maxLux = vm.light.form.above;
            }

            if (vm.light.current.pollingIntervalInMinutes !== command.pollingIntervalInMinutes ||
                vm.light.current.isMonitoringOn !== command.isMonitoringOn ||
                vm.light.current.minLux !== command.minLux ||
                vm.light.current.maxLux !== command.maxLux) {

                noCommand = false;
                $rootScope.loading=true;
                var promise = SentryConfigurationService.changeLight(command).$promise;
                promise.then(
                    function (result) {
                        $rootScope.loading=false;
                        command.commandId = result.commandId;
                        command.id = result.id;
                        vm.light.pending = command;
                        vm.hasPending = true;
                        endChangeLight();
                    },
                    function (error) {
                        $rootScope.loading=false;
                        vm.feedback.addError(error.data.message);
                        endChangeLight();
                    }
                );
            }

            if (noCommand) {
                endChangeLight();
            }
        }

        function cancelChangeLight() {
            vm.feedback.clear();

            var pendingCommand = vm.light.pending;
            if (pendingCommand !== null) {
                $rootScope.loading=true;
                var promise = DeviceCommandsService.cancelCommand(vm.assignmentAccountId, pendingCommand.commandId,pendingCommand.id).$promise;
                promise.then(
                    function (result) {
                        $rootScope.loading=false;
                        vm.light.pending = null;
                        updateHasPending();
                    },
                    function (error) {
                        $rootScope.loading=false;
                        if (error.status === 404) {
                            vm.light.pending = null;
                            updateHasPending();
                            return;
                        }
                        vm.feedback.addError(error.data.message);
                    }
                );
            }
        }
        function beginChangeHumidity() {
            if (!vm.humidity.current || !vm.humidity.current.isMonitoringOn) {
                vm.humidity.form.above = null;
                vm.humidity.form.below = null;
                vm.humidity.form.on = false;
            }
            else {
                vm.humidity.form.above = Math.min(vm.humidity.current.maxHum, RANGES.humidity.max);
                vm.humidity.form.below = Math.min(vm.humidity.current.minHum, RANGES.humidity.max);
                vm.humidity.form.on = true;
            }
            vm.humidity.form.isChanging = true;            
        }

        function endChangeHumidity() {
            vm.humidity.form.above = null;
            vm.humidity.form.below = null;
            vm.humidity.form.on = null;
            vm.humidity.form.isChanging = false;
        }

        function submitChangeHumidity() {
            vm.feedback.clear();

            var noCommand = true;
            var command = {
                deviceId: vm.device,
                clientId: vm.assignmentAccountId,
                isMonitoringOn: vm.humidity.form.on
            };
            if (vm.humidity.form.on) {
                command.pollingIntervalInMinutes = vm.humidity.form.minutes;
                vm.humidity.form.below = Math.round(vm.humidity.form.below * 100) / 100;
                vm.humidity.form.above = Math.round(vm.humidity.form.above * 100) / 100;
                command.minHum = vm.humidity.form.below;
                command.maxHum = vm.humidity.form.above;
            }

            if (vm.humidity.current.pollingIntervalInMinutes !== command.pollingIntervalInMinutes ||
                vm.humidity.current.isMonitoringOn !== command.isMonitoringOn ||
                vm.humidity.current.minHum !== command.minHum ||
                vm.humidity.current.maxHum !== command.maxHum) {

                noCommand = false;
                $rootScope.loading=true;
                var promise = SentryConfigurationService.changeHumidity(command).$promise;
                promise.then(
                    function (result) {
                        $rootScope.loading=false;
                        command.commandId = result.commandId;
                        command.id = result.id;
                        vm.humidity.pending = command;
                        vm.hasPending = true;
                        endChangeHumidity();
                    },
                    function (error) {
                        $rootScope.loading=false;
                        vm.feedback.addError(error.data.message);
                        endChangeHumidity();
                    }
                );
            }

            if (noCommand) {
                endChangeHumidity();
            }
        }

        function cancelChangeHumidity() {
            vm.feedback.clear();

            var pendingCommand = vm.humidity.pending;
            if (pendingCommand !== null) {
                $rootScope.loading=true;
                var promise = DeviceCommandsService.cancelCommand(vm.assignmentAccountId, pendingCommand.commandId,pendingCommand.id).$promise;
                promise.then(
                    function (result) {
                        $rootScope.loading=false;
                        vm.humidity.pending = null;
                        updateHasPending();
                    },
                    function (error) {
                        if (error.status === 404) {
                            $rootScope.loading=false;
                            vm.humidity.pending = null;
                            updateHasPending();
                            return;
                        }
                        vm.feedback.addError(error.data.message);
                    }
                );
            }
        }
        function beginChangePressure() {
            if (!vm.pressure.current || !vm.pressure.current.isMonitoringOn) {
                vm.pressure.form.above = null;
                vm.pressure.form.below = null;
                vm.pressure.form.on = false;
            }
            else {
                vm.pressure.form.above = Math.min(vm.pressure.current.maxkPa, RANGES.pressure.max);
                vm.pressure.form.below = Math.min(vm.pressure.current.minkPa, RANGES.pressure.max);
                vm.pressure.form.on = true;
            }
            vm.pressure.form.isChanging = true;            
        }

        function endChangePressure() {
            vm.pressure.form.above = null;
            vm.pressure.form.below = null;
            vm.pressure.form.on = null;
            vm.pressure.form.isChanging = false;
        }

        function submitChangePressure() {
            vm.feedback.clear();

            var noCommand = true;
            var command = {
                deviceId: vm.device,
                clientId: vm.assignmentAccountId,
                isMonitoringOn: vm.pressure.form.on
            };
            if (vm.pressure.form.on) {
                command.pollingIntervalInMinutes = vm.pressure.form.minutes;
                vm.pressure.form.below = Math.round(vm.pressure.form.below * 100) / 100;
                vm.pressure.form.above = Math.round(vm.pressure.form.above * 100) / 100;
                command.minkPa = vm.pressure.form.below;
                command.maxkPa = vm.pressure.form.above;
            }

            if (vm.pressure.current.pollingIntervalInMinutes !== command.pollingIntervalInMinutes ||
                vm.pressure.current.isMonitoringOn !== command.isMonitoringOn ||
                vm.pressure.current.minkPa !== command.minkPa ||
                vm.pressure.current.maxkPa !== command.maxkPa) {

                noCommand = false;
                $rootScope.loading=true;
                var promise = SentryConfigurationService.changePressure( command).$promise;
                promise.then(
                    function (result) {
                        $rootScope.loading=false;
                        command.commandId = result.commandId;
                        command.id = result.id;
                        vm.pressure.pending = command;
                        vm.hasPending = true;
                        endChangePressure();
                    },
                    function (error) {
                        $rootScope.loading=false;
                        vm.feedback.addError(error.data.message);
                        endChangePressure();
                    }
                );
            }

            if (noCommand) {
                endChangePressure();
            }
        }

        function cancelChangePressure() {
            vm.feedback.clear();

            var pendingCommand = vm.pressure.pending;
            if (pendingCommand !== null) {
                $rootScope.loading=true;
                var promise = DeviceCommandsService.cancelCommand(vm.assignmentAccountId, pendingCommand.commandId,pendingCommand.id).$promise;
                promise.then(
                    function (result) {
                        $rootScope.loading=false;
                        vm.pressure.pending = null;
                        updateHasPending();
                    },
                    function (error) {
                        if (error.status === 404) {
                            $rootScope.loading=false;
                            vm.pressure.pending = null;
                            updateHasPending();
                            return;
                        }
                        vm.feedback.addError(error.data.message);
                    }
                );
            }
        }
        function beginChangeShock() {
            if (!vm.shock.current || !vm.shock.current.isMonitoringOn) {
                vm.shock.form.above = null;
                vm.shock.form.on = false;
            }
            else {
                vm.shock.form.above = Math.min(vm.shock.current.maxGForce, RANGES.shock.max);
                vm.shock.form.on = true;
            }
            vm.shock.form.isChanging = true;
        }

        function endChangeShock() {
            vm.shock.form.above = null;
            vm.shock.form.on = null;
            vm.shock.form.isChanging = false;
        }

        function submitChangeShock() {
            vm.feedback.clear();

            var noCommand = true;
            var command = {
                deviceId: vm.device,
                clientId: vm.assignmentAccountId,
                isMonitoringOn: vm.shock.form.on
            };
            if (vm.shock.form.on) {
                command.pollingIntervalInMinutes = vm.shock.form.minutes;
                vm.shock.form.above = Math.round(vm.shock.form.above * 10) / 10;
                command.maxGForce = vm.shock.form.above;
            }

            if (vm.shock.current.pollingIntervalInMinutes !== command.pollingIntervalInMinutes ||
                vm.shock.current.isMonitoringOn !== command.isMonitoringOn ||
                vm.shock.current.maxGForce !== command.maxGForce) {

                noCommand = false;
                $rootScope.loading=true;
                var promise = SentryConfigurationService.changeShock(command).$promise;
                promise.then(
                    function (result) {
                        $rootScope.loading=false;
                        command.commandId = result.commandId;
                        command.id = result.id;
                        vm.shock.pending = command;
                        updateHasPending();
                        endChangeShock();
                    },
                    function (error) {
                        $rootScope.loading=false;
                        vm.feedback.addError(error.data.message);
                        endChangeShock();
                    }
                );
            }

            if (noCommand) {
                endChangeShock();
            }
        }

        function cancelChangeShock() {
            vm.feedback.clear();

            var pendingCommand = vm.shock.pending;
            if (pendingCommand !== null) {
                $rootScope.loading=true;
                var promise = DeviceCommandsService.cancelCommand(vm.assignmentAccountId, pendingCommand.commandId,pendingCommand.id).$promise;
                promise.then(
                    function (result) {
                        $rootScope.loading=false;
                        vm.shock.pending = null;
                        updateHasPending();
                    },
                    function (error) {
                        if (error.status === 404) {
                            $rootScope.loading=false;
                            vm.shock.pending = null;
                            updateHasPending();
                            return;
                        }
                        vm.feedback.addError(error.data.message);
                    }
                );
            }
        }

        function beginChangeReportServer() {
            vm.reportServer.form.server = vm.reportServer.current.serverAddress;
            vm.reportServer.form.isChanging = true;
        }

        function endChangeReportServer() {
            vm.reportServer.form.server = null;
            vm.reportServer.form.isChanging = false;
        }

        function submitChangeReportServer() {
            vm.feedback.clear();
            if (!vm.reportServer.form.server ) {
                endChangeReportServer();
                return;
            }

             if ((vm.reportServer.current && vm.reportServer.form.server === vm.reportServer.current.serverAddress && vm.reportServer.form.port === vm.reportServer.current.port )) {
                endChangeReportServer();
                return;
            }

          /*  if (vm.reportServer.form.gatewayId === 0 || (vm.reportServer.current && vm.reportServer.form.gatewayId === vm.reportServer.current.id)) {
                endChangeReportServer();
                return;
            }

            var newGateway = _.find(vm.reportServer.gateways, function(gateway) {
                return gateway.id == vm.reportServer.form.gatewayId;
            });

            if (!newGateway) {
                endChangeReportServer();
                return;
            }*/

            var command = {
                deviceId: vm.device,
                serverAddress: vm.reportServer.form.server,
                port: vm.reportServer.form.port,
                clientId: vm.assignmentAccountId
            };
            $rootScope.loading=true;
            var promise = SentryConfigurationService.changeReportServer( command).$promise;
            promise.then(
                function (result) {
                    $rootScope.loading=false;
                    command.commandId = result.commandId;
                    command.id = result.id;
                    vm.reportServer.pending = command;
                    updateHasPending();
                    endChangeReportServer();
                },
                function (error) {
                    $rootScope.loading=false;
                    vm.feedback.addError(error.data.message);
                    endChangeReportServer();
                }
            );
        }

        function cancelChangeReportServer() {
            vm.feedback.clear();

            var pendingCommand = vm.reportServer.pending;
            console.log(pendingCommand);
            if (pendingCommand !== null) {
                $rootScope.loading=true;
                var promise = DeviceCommandsService.cancelCommand(vm.assignmentAccountId, pendingCommand.commandId,pendingCommand.id).$promise;
                promise.then(
                    function (result) {
                        $rootScope.loading=false;
                        vm.reportServer.pending = null;
                        updateHasPending();
                    },
                    function (error) {
                        $rootScope.loading=false;
                        if (error.status === 404) {
                            vm.reportServer.pending = null;
                            updateHasPending();
                            return;
                        }
                        vm.feedback.addError(error.data.message);
                    }
                );
            }
        }

        function beginChangeFtpServer() {
        }

        function endChangeFtpServer() {
        }

        function submitChangeFtpServer() {
        }

        function cancelChangeFtpServer() {
            vm.feedback.clear();

            var pendingCommand = vm.ftpServer.pending;
            if (pendingCommand !== null) {
                $rootScope.loading=true;
                var promise = DeviceCommandsService.cancelCommand(vm.assignmentAccountId, pendingCommand.commandId).$promise;
                promise.then(
                    function (result) {
                        $rootScope.loading=false;
                        vm.ftpServer.pending = null;
                        updateHasPending();

                    },
                    function (error) {
                        $rootScope.loading=false;
                        if (error.status === 404) {
                            vm.ftpServer.pending = null;
                            updateHasPending();
                            return;
                        }
                        vm.feedback.addError(error.data.message);
                    }
                );
            }
        }        

        function cancelFirmwareCommand() {
            vm.feedback.clear();

            var pendingCommand = vm.firmware.pending;
            if (pendingCommand !== null) {
                $rootScope.loading=true;
                var promise = DeviceCommandsService.cancelCommand(vm.assignmentAccountId, pendingCommand.commandId,pendingCommand.id).$promise;
                promise.then(
                    function (result) {
                        $rootScope.loading=false;
                        vm.firmware.pending = null;
                        updateHasPending();
                    },
                    function (error) {
                        $rootScope.loading=false;
                        if (error.status === 404) {
                            vm.firmware.pending = null;
                            updateHasPending();
                            return;
                        }
                        vm.feedback.addError(error.data.message);
                    }
                );
            }
        }

        function load() {
            loadPending();
            if(!vm.configuration){
                return;
            }            
            loadExtendReport(vm.configuration.extendedPeriodicReportInterval,vm.configuration.wakeOnVibration);
            loadStandartReport(vm.configuration.standardPeriodicReportInterval,vm.configuration.timeOfReport);
            loadLight(vm.configuration.lightAlarmEnabled,vm.configuration.lightLowLimit,vm.configuration.lightHighLimit);
            loadWifi(vm.configuration.wifiAlarmEnabled,vm.configuration.ssid);
            loadOperationState(vm.configuration.operationalMode);
            loadHumidity(vm.configuration.humidityAlarmEnabled,vm.configuration.humidityLowLimit,vm.configuration.humidityHighLimit);
            loadPressure(vm.configuration.pressureAlarmEnabled,vm.configuration.pressureLowLimit,vm.configuration.pressureHighLimit);
            /**convertion**/
            loadShock(vm.configuration.shockAlarmEnabled,vm.configuration.shockThreshold);
            loadTemperature(vm.configuration.ambientTemperatureAlarmEnabled,vm.configuration.ambientTemperatureLowLimit,vm.configuration.ambientTemperatureHighLimit);

           // if (vm.hasPermission.toReadAdminConfigs) {
            loadFirmware(vm.configuration.flashloaderVersion,vm.configuration.applicationVersion);
            loadReportServer(vm.configuration.serverAddress,vm.configuration.serverPort);
            loadFtpServer(vm.configuration.ftpAddress,vm.configuration.ftpPort);
           // }
        }



        function loadExtendReport (newValue,wakeOnVibration) {
            vm.extendedReportingInterval.current = null;
            console.log(newValue);
            if(vm.configuration){
                vm.extendedReportingInterval.current = {};
                vm.extendedReportingInterval.current.isExtendedReportingIntervalOn = (wakeOnVibration != "Disabled");
                vm.extendedReportingInterval.current.reportingIntervalInSeconds = newValue;
                vm.extendedReportingInterval.current.reportingIntervalInMinutes = Math.round(newValue/60);
                vm.extendedReportingInterval.current.text = vm.extendedReportingInterval.current.reportingIntervalInMinutes <= RANGES.minutes.max ?
                vm.extendedReportingInterval.current.reportingIntervalInMinutes + ' minutes' :
                Math.round(vm.extendedReportingInterval.current.reportingIntervalInMinutes / 60 * 10) / 10 + ' hours';
            }
            console.log(vm.extendedReportingInterval.current);
        }
        
        function loadStandartReport(newValue,dateLogged) {
            vm.standardReportingInterval.current = null;
           
            if(vm.configuration){
                vm.standardReportingInterval.current = {};
                vm.standardReportingInterval.current.reportingIntervalInSeconds = newValue;
                vm.standardReportingInterval.current.dateLogged = dateLogged;
                vm.standardReportingInterval.current.reportingIntervalInMinutes = Math.round(newValue/60);
                vm.standardReportingInterval.current.text = vm.standardReportingInterval.current.reportingIntervalInMinutes <= RANGES.minutes.max ?
                vm.standardReportingInterval.current.reportingIntervalInMinutes + ' minutes' :
                Math.round(vm.standardReportingInterval.current.reportingIntervalInMinutes / 60 * 10) / 10 + ' hours';
            }
        }
           
        function loadLight(isMonitoringOn,minLux,maxLux) {
          vm.light.current = null;
          if(vm.configuration){ 
              vm.light.current = {};
              vm.light.current.isMonitoringOn = isMonitoringOn;
              vm.light.current.minLux = minLux;
              vm.light.current.maxLux = maxLux;
          }
        
        }
        function loadWifi(isConfigured,ssid) {
            vm.wifi.current = null;
            if(vm.configuration){ 
                vm.wifi.current = {};
                vm.wifi.current.isConfigured = isConfigured;
                vm.wifi.current.ssid = ssid;
            }
          
          }
       
        function loadFirmware(bootVersion,applicationVersion) {
             vm.firmware.current = null;
            if(vm.configuration){ 
                vm.firmware.current = {};
                vm.firmware.current.bootVersion = bootVersion;
                vm.firmware.current.applicationVersion = applicationVersion;
            }
        }
        function loadFtpServer(serverUrl,serverPort) {
            vm.ftpServer.current = null;
            if(vm.configuration){ 
                vm.ftpServer.current = {};
                vm.ftpServer.current.serverUrl = serverUrl;
                vm.ftpServer.current.serverPort = serverPort;
            }
        }
       
        function loadOperationState(operationState) {
            vm.operationState.current = null;
            if(vm.configuration){ 
                vm.operationState.current = {};
                vm.operationState.form.operationState = null;
                if(operationState=="Local On/Off Control")
                   vm.operationState.current.operationState=0;
                else
                   vm.operationState.current.operationState=1; 
            }          
        }
        function loadPending() {
            vm.pending = [];
            vm.dataLog.pending = null;
            vm.standardReportingInterval.pending = null;
            vm.extendedReportingInterval.pending = null;
            vm.reportServer.pending = null;
            vm.firmware.pending = null;
            vm.ftpServer.pending = null;
            vm.light.pending = null;
            vm.pressure.pending = null;
            vm.shock.pending = null;
            vm.wifi.pending = null;
            vm.temperature.pending = null;
            $rootScope.loading=true;
           
            var promise = DeviceCommandsService.getPending( vm.assignmentAccountId,vm.device).$promise;
            promise.then(
                function(result) {
                    vm.pending = result;
                    setPendingCommands();
                    promise = SentryConfigurationService.getOperationState( vm.assignmentAccountId,vm.device).$promise;
                    promise.then(
                        function(result) {
                           $rootScope.loading=false;
                           if(result && result.status=="PENDING"){
                             vm.operationState.pending={};
                             vm.operationState.pending.id=result.id;
                             vm.operationState.pending.operationState = result.opMode;
                           }                           
                        },
                        function (error) {
                            $rootScope.loading=false;
                            vm.feedback.addError(error.data.message);
                        }
                    );
                },
                function (error) {
                    $rootScope.loading=false;
                    vm.feedback.addError(error.data.message);
                }
            );
      
        }
        function loadPressure(isMonitoringOn,minkPa,maxkPa) {
            vm.pressure.current = null;
            if(vm.configuration){ 
                vm.pressure.current = {};
                vm.pressure.current.isMonitoringOn=isMonitoringOn;
                vm.pressure.current.minkPa=minkPa;
                vm.pressure.current.maxkPa=maxkPa;
            }           
        }

        function loadHumidity(isMonitoringOn,minHum,maxHum) {
            vm.humidity.current = null;
            if(vm.configuration){ 
                vm.humidity.current = {};
                vm.humidity.current.isMonitoringOn=isMonitoringOn;
                vm.humidity.current.minHum=minHum;
                vm.humidity.current.maxHum=maxHum;
            }           
        }

        function loadReportServer(serverAddress,port) {
            vm.reportServer.current = null;
            if(vm.configuration){ 
                vm.reportServer.current = {};
                vm.reportServer.current.serverAddress=serverAddress;
                vm.reportServer.current.port=port;
            }
        }
        function loadShock(isMonitoringOn,maxGForce) {
            vm.shock.current = null;
            if(vm.configuration){ 
                vm.shock.current = {};
                vm.shock.current.isMonitoringOn = isMonitoringOn;
                vm.shock.current.maxGForce = maxGForce;
            }
        }
        
        function loadTemperature(isMonitoringOn,minCelsius,maxCelsius) {
             vm.temperature.current = null;
            if(vm.configuration){ 
               vm.temperature.current = {};
               vm.temperature.current.isMonitoringOn=isMonitoringOn;
               vm.temperature.current.minCelsius=minCelsius;
               vm.temperature.current.maxCelsius=maxCelsius;
           }
        }

        function refreshConfig() {
            if (!vm.hasPending) {

                var promise = SentryConfigurationService.refreshConfig(vm.assignmentAccountId,vm.device).$promise;
                promise.then(
                    function (result) {
                        vm.refresh.pending = result;
                        updateHasPending();
                    },
                    function (error) {
                        vm.feedback.addError(error.data.message);
                    }
                );
            }
        }

        function requestDataLog() {
            if (vm.dataLog.pending) {
                return;
            }

            var promise = DeviceCommandsService.requestDataLog(vm.assignmentAccountId,vm.device).$promise;
            promise.then(
                function (result) {
                    vm.dataLog.pending = {
                        deviceId: vm.device,
                        commandId: result.commandId,
                        id:result.id,
                    };
                },
                function (error) {
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function setPendingCommands() {
            var values = null;
            _.forEach(vm.pending, function(command) {
                if (_.startsWith(command.command, 'Ota_PutLogs')) {
                    vm.dataLog.pending = command;
                }
                if (_.startsWith(command.command, 'AA_StdInt')) {
                    values = command.command.split(' ');
                    vm.standardReportingInterval.pending = {
                        commandId: command.commandId,
                        id:command.id,
                        reportingIntervalInMinutes: Number(values[1] / 60),
                        text: Number(values[1]) / 60 <= RANGES.minutes.max ?
                            Number(values[1]) / 60 + ' minutes' :
                            Math.round(Number(values[1]) / 60 / 60 * 10) / 10 + ' hours' + (vm.extendedReportingInterval.pending ? ' while in motion' : '')
                    };
                }
                if (_.startsWith(command.command, 'AA_StartExtSleep')) {
                    values = command.command.split(' ');
                    vm.extendedReportingInterval.pending = {
                        commandId: command.commandId,
                        id:command.id,
                        isExtendedReportingIntervalOn: true,
                        reportingIntervalInMinutes: values[1] / 60,
                        text: Number(values[1]) / 60 <= RANGES.minutes.max ?
                            Number(values[1]) / 60 + ' minutes' :
                            Math.round(Number(values[1]) / 60 / 60 * 10) / 10 + ' hours while at rest'
                    };
                    if (vm.standardReportingInterval.pending) {
                        vm.standardReportingInterval.pending.text = vm.standardReportingInterval.pending.text + ' while in motion';
                    }
                }
                if (_.startsWith(command.command, 'AA_StopExtSleep')) {
                    vm.extendedReportingInterval.pending = {
                         commandId: command.commandId,
                        id:command.id,
                        isExtendedReportingIntervalOn: false,
                        reportingIntervalInMinutes: 0
                    };
                }
                if (_.startsWith(command.command, 'AA_PollHum')) {
                    values = command.command.split(' ');
                    if (values[2] === 'Off' || values[2] === 'OFF') {
                        vm.humidity.pending = {
                            commandId: command.commandId,
                            id: command.id,
                            isMonitoringOn: false
                        };
                    } else {
                        vm.humidity.pending = {
                            commandId: command.commandId,
                            id: command.id,
                            isMonitoringOn: true,
                            pollingIntervalInMinutes: values[3] / 60,
                            minHum: values[4],
                            maxHum: values[5]
                        };
                    }
                }
                if (_.startsWith(command.command, 'AA_PollLight')) {
                    values = command.command.split(' ');
                    if (values[2] === 'Off' || values[2] === 'OFF' ) {
                        vm.light.pending = {
                            commandId: command.commandId,
                            id:command.id,
                            isMonitoringOn: false
                        };
                    } else {
                        vm.light.pending = {
                            commandId: command.commandId,
                            id:command.id,
                            isMonitoringOn: true,
                            pollingIntervalInMinutes: values[3] / 60,
                            minLux: values[4] / 1000,
                            maxLux: values[5] / 1000
                        };
                    }
                }
                if (_.startsWith(command.command, 'AA_PollPress')) {
                    values = command.command.split(' ');
                    if (values[2] === 'Off' || values[2] === 'OFF') {
                        vm.pressure.pending = {
                            commandId: command.commandId,
                            id: command.id,
                            isMonitoringOn: false
                        };
                    } else {
                        vm.pressure.pending = {
                            commandId: command.commandId,
                            id: command.id,
                            isMonitoringOn: true,
                            pollingIntervalInMinutes: values[3] / 60,
                            minkPa: values[4] / 100,
                            maxkPa: values[5] / 100
                        };
                    }
                }
                if (_.startsWith(command.command, 'AA_PollShock')) {
                    values = command.command.split(' ');
                    if (values[1] === 'Off' || values[1] === 'OFF') {
                        vm.shock.pending = {
                            commandId: command.commandId,
                            id:command.id,
                            isMonitoringOn: false
                        };
                    } else {
                        vm.shock.pending = {
                            commandId: command.commandId,
                            id:command.id,
                            isMonitoringOn: true,
                            pollingIntervalInMinutes: values[2] / 60,
                            maxGForce: values[3] / 100
                        };
                    }
                }
                if (_.startsWith(command.command, 'AA_Shock')) {
                    values = command.command.split(' ');
                    if (values[1] === 'Off' || values[1] === 'OFF') {
                        vm.shock.pending = {
                            commandId: command.commandId,
                            id:command.id,
                            isMonitoringOn: false
                        };
                    } else {
                        vm.shock.pending = {
                            commandId: command.commandId,
                            id:command.id,
                            isMonitoringOn: true,
                            pollingIntervalInMinutes: values[2] / 60,
                            maxGForce: values[3] / 100
                        };
                    }
                }
                if (_.startsWith(command.command, 'AA_PollTemp')) {
                    values = command.command.split(' ');
                    if (values[2] === 'Of') {
                        vm.temperature.pending = {
                            commandId: command.commandId,
                            id:command.id,
                            isMonitoringOn: false
                        };
                    } else {
                        vm.temperature.pending = {
                            commandId: command.commandId,
                            id:command.id,
                            isMonitoringOn: true,
                            pollingIntervalInMinutes: values[3] / 60,
                            minCelsius: values[4] / 100,
                            maxCelsius: values[5] / 100
                        };
                    }
                }
                if (_.startsWith(command.command, 'AA_IpSet') && vm.hasPermission.toReadAdminConfigs) {
                    values = command.command.split(' ');
                    vm.reportServer.pending = {
                        commandId: command.commandId,
                        id:command.id,
                        serverAddress: values[2].split(':')[0],
                        port: values[2].split(':')[1]
                    };
                }
                if (_.startsWith(command.command, 'AA_FtpSet') && vm.hasPermission.toReadAdminConfigs) {
                    values = command.command.split(' ');
                    vm.ftpServer.pending = {
                        commandId: command.commandId,
                        id:command.id,
                        serverUrl: values[1].split(':')[0],
                        serverPort: values[1].split(':')[1]
                    };
                }
                if (_.startsWith(command.command, 'AA_SendConfig')) {
                    vm.refresh.pending = command;
                }
                if (_.startsWith(command.command, 'Wifi_Ssid')) {                
                    vm.wifi.pending = {
                        commandId: command.commandId,
                        id:command.id,
                        isConfigured: true,
                        ssid: command.ssid
                    };
                }
            });
            updateHasPending();
        }

        function setPermissions() {
            vm.hasPermission.toReadAdminConfigs =
                SentinelUiSession.user.isSystemAdmin ||
                SentinelUiSession.user.isSupportAdmin ||
                SentinelUiSession.user.isSupportObserver;

            vm.hasPermission.toChangeAdminConfigs =
                SentinelUiSession.user.isSystemAdmin;

            vm.hasPermission.toChangeConfigs = vm.hasPermission.toCancelCommands =
                SentinelUiSession.user.isSystemAdmin ||
                SentinelUiSession.user.isAccountAdmin ||
                SentinelUiSession.user.isAccountEditor;

        }

        function updateHasPending() {
            vm.hasPending = vm.extendedReportingInterval.pending ||
                    vm.firmware.pending ||
                    vm.ftpServer.pending ||
                    vm.humidity.pending ||
                    vm.light.pending ||
                    vm.operationState.pending ||
                    vm.pressure.pending ||
                    vm.refresh.pending ||
                    vm.reportServer.pending ||
                    vm.shock.pending ||
                    vm.standardReportingInterval.pending ||
                    vm.temperature.pending ||
                    vm.wifi.pending;
        }
    }

})();