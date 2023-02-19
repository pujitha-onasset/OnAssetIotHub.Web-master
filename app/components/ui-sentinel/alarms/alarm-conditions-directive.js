(function () {
    'use strict';

    angular
        .module('ui-sentinel.alarms')
        .directive('alarmConditions', AlarmConditionsDirective);

    function AlarmConditionsDirective() {
        var directive = {
            restrict: 'A',
            controller: ThisDirectiveController,
            controllerAs: 'alarmConditions',
            templateUrl: 'ui-sentinel-alarms/alarm-conditions-directive.html',
            link: link
        };
        return directive;

        function link(scope, element, attrs, controller) {
            scope.$watch(
                function(scope) {
                    return scope.alarmAdmin.alarm;
                },
                function (newValue) {
                    controller.alarm = newValue;
                }, true
            );
        }
    }

    ThisDirectiveController.$inject = ['$rootScope', '$state', 'AlarmsService', 'PolygonGeofencesService', 'RadialGeofencesService', 'RoutesService', 'FeedbackService', 'SentinelUiSession', 'UomPressureConverter'];
    function ThisDirectiveController($rootScope, $state, AlarmsService, PolygonGeofencesService, RadialGeofencesService, RoutesService, FeedbackService, SentinelUiSession, UomPressureConverter) {
        var RANGES = {
            battery: { min: 0, max: 100 },
            light: { min: 0, max: 1000 },
            pressure: { min: 50, max: 110 },
            shock: { min: 2, max: 15 },
            temperatureC: { min: -45, max: 60 },
            temperatureF: { min: -49, max: 140 },
            probeC: { min: -200, max: 480 },
            probeF: { min: -328, max: 896 },
            humidity: { min: 0, max: 100 },
            tilt: { min: 0, max: 90 },
        };


        var vm = {
            alarm: null,
            rule: null,
            feedback: FeedbackService,
            battery: {
                model: {
                    above: null,
                    below: null
                },
                form: {
                    isChanging: false,
                    above: null,
                    below: null,
                    aboveMax: RANGES.battery.max,
                    aboveMin: RANGES.battery.min,
                    belowMax: RANGES.battery.max,
                    belowMin: RANGES.battery.min,
                    onChange: function() {
                        this.aboveMin = this.below || this.below === RANGES.battery.min ?
                            (this.below !== RANGES.battery.max ? this.below + 1 : RANGES.battery.max) :
                            RANGES.battery.min;
                        
                        this.belowMax = this.above || this.above === RANGES.battery.min ?
                            (this.above !== RANGES.battery.min ? this.above - 1 : RANGES.battery.min) :
                            RANGES.battery.max;
                    }
                },
                actions: {
                    begin: batteryBeginChange,
                    end: batteryEndChange,
                    submit: batterySubmit,
                    remove: batteryRemove
                }
            },
            button: {
                model: {
                    pushed: null
                },
                form: {
                    isChanging: false,
                    pushed: null
                },
                actions: {
                    begin: buttonBeginChange,
                    end: buttonEndChange,
                    submit: buttonSubmit,
                    remove: buttonRemove
                }
            },
            geofence: {
                model: {
                    option: null,
                    geofence: null
                },
                form: {
                    filterText: null,
                    isChanging: false,
                    option: null,
                    geofence: null,
                    geofences: null,
                    geofenceLimit: 5,
                    filter: geofenceFilter
                },
                actions: {
                    begin: geofenceBeginChange,
                    end: geofenceEndChange,
                    submit: geofenceSubmit,
                    remove: geofenceRemove,
                    selectGeofence: selectGeofence,
                    goToGeofence: goToGeofence
                }
            },
            light: {
                model: {
                    above: null,
                    below: null
                },
                form: {
                    isChanging: false,
                    above: null,
                    below: null,
                    aboveMax: RANGES.light.max,
                    aboveMin: RANGES.light.min,
                    belowMax: RANGES.light.max,
                    belowMin: RANGES.light.min,
                    onChange: function() {
                        this.aboveMin = this.below || this.below === RANGES.light.min ?
                            (this.below !== RANGES.light.max ? this.below + 1 : RANGES.light.max) :
                            RANGES.light.min;

                        this.belowMax = this.above || this.above === RANGES.l.min ?
                            (this.above !== RANGES.light.min ? this.above - 1 : RANGES.light.min) :
                            RANGES.light.max;
                    }
                },
                actions: {
                    begin: lightBeginChange,
                    end: lightEndChange,
                    submit: lightSubmit,
                    remove: lightRemove
                }
            },
            humidity: {
                model: {
                    above: null,
                    below: null
                },
                form: {
                    isChanging: false,
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
                },
                actions: {
                    begin: humidityBeginChange,
                    end: humidityEndChange,
                    submit: humiditySubmit,
                    remove: humidityRemove
                }
            },
            location: {
                model: {
                    method: null
                },
                form: {
                    isChanging: false,
                    method: null
                },
                actions: {
                    begin: locationBeginChange,
                    end: locationEndChange,
                    submit: locationSubmit,
                    remove: locationRemove
                }
            },
            motion: {
                model: {
                    detected: null
                },
                form: {
                    isChanging: false,
                    above: null
                },
                actions: {
                    begin: motionBeginChange,
                    end: motionEndChange,
                    submit: motionSubmit,
                    remove: motionRemove
                }
            },
            pressure: {
                model: {
                    above: null,
                    below: null
                },
                form: {
                    isChanging: false,
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
                },
                actions: {
                    begin: pressureBeginChange,
                    end: pressureEndChange,
                    submit: pressureSubmit,
                    remove: pressureRemove
                }
            },
            route: {
                model: {
                    option: null,
                    route: null
                },
                form: {
                    filterText: null,
                    isChanging: false,
                    option: null,
                    route: null,
                    routes: null,
                    routeLimit: 5,
                    filter: routeFilter
                },
                actions: {
                    begin: routeBeginChange,
                    end: routeEndChange,
                    submit: routeSubmit,
                    remove: routeRemove,
                    selectRoute: selectRoute,
                    goToRoute: goToRoute
                }
            },
            shock: {
                model: {
                    above: null
                },
                form: {
                    isChanging: false,
                    above: null,
                    max: RANGES.shock.max,
                    min: RANGES.shock.min
                },
                actions: {
                    begin: shockBeginChange,
                    end: shockEndChange,
                    submit: shockSubmit,
                    remove: shockRemove
                }
            },
            storeAndForward: {
                model: {
                    option: null
                },
                form: {
                    isChanging: false,
                    option: null
                },
                actions: {
                    begin: storeAndForwardBeginChange,
                    end: storeAndForwardEndChange,
                    submit: storeAndForwardSubmit,
                    remove: storeAndForwardRemove
                }
            },
            temperature: {
                model: {
                    above: null,
                    aboveUnit: null,
                    below: null,
                    belowUnit: null
                },
                form: {
                    isChanging: false,
                    above: null,
                    below: null,
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
                actions: {
                    begin: temperatureBeginChange,
                    end: temperatureEndChange,
                    submit: temperatureSubmit,
                    remove: temperatureRemove
                }
            },
            temperatureProbe: {
                model: {
                    above: null,
                    aboveUnit: null,
                    below: null,
                    belowUnit: null
                },
                form: {
                    isChanging: false,
                    above: null,
                    below: null,
                    unit: 'c',
                    aboveMax: RANGES.probeC.max,
                    aboveMin: RANGES.probeC.min,
                    belowMax: RANGES.probeC.max,
                    belowMin: RANGES.probeC.min,
                    onChange: function() {
                        var range = this.unit === 'c' ? 'probeC' : 'probeF';

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
                actions: {
                    begin: temperatureProbeBeginChange,
                    end: temperatureProbeEndChange,
                    submit: temperatureProbeSubmit,
                    remove: temperatureProbeRemove
                }
            },
            tilt: {
                model: {
                    above: null,
                    below: null
                },
                form: {
                    isChanging: false,
                    above: null,
                    below: null,
                    aboveMax: RANGES.tilt.max,
                    aboveMin: RANGES.tilt.min,
                    belowMax: RANGES.tilt.max,
                    belowMin: RANGES.tilt.min,
                    onChange: function() {
                        this.aboveMin = this.below || this.below === RANGES.tilt.min ?
                            (this.below !== RANGES.tilt.max ? this.below + 1 : RANGES.tilt.max) :
                            RANGES.tilt.min;

                        this.belowMax = this.above || this.above === RANGES.battery.min ?
                            (this.above !== RANGES.tilt.min ? this.above - 1 : RANGES.tilt.min) :
                            RANGES.tilt.max;
                    }
                },
                actions: {
                    begin: tiltBeginChange,
                    end: tiltEndChange,
                    submit: tiltSubmit,
                    remove: tiltRemove
                }
            },
            panel: {
                isCollapsed: true,
                toggle: function () {
                    this.isCollapsed = !this.isCollapsed;
                    if (!this.isCollapsed) { load(); }
                }
            },
            hasPermission: {
                toChange: false
            },
            isFirstCondition: isFirstCondition,
            actions: {
                reload: load
            }
        };
        activate();
        return vm;

        function activate() {
            $rootScope.$on('$stateChangeSuccess', function (event, args) {
                if ($state.current.name == 'alarm.admin' || $state.current.name == 'alarm.new') {
                    loadGeofences();
                    loadRoutes();
                }
            });

            setPermissions();
        }

        function batteryBeginChange() {
            vm.battery.form.isChanging = true;
            vm.battery.form.above = vm.battery.model.above;
            vm.battery.form.below = vm.battery.model.below;
        }

        function batteryEndChange() {
            vm.battery.form.isChanging = false;
            vm.battery.form.above = null;
            vm.battery.form.below = null;
        }

        function batterySubmit() {
            removeConditions('Battery');
            if (vm.battery.form.below !== null) {
                vm.battery.form.below = Math.round(vm.battery.form.below);
                vm.rule.conditions.push('BatteryBelow ' + vm.battery.form.below);
            }
            if (vm.battery.form.above !== null) {
                vm.battery.form.above = Math.round(vm.battery.form.above);
                vm.rule.conditions.push('BatteryAbove ' + vm.battery.form.above);
            }
            updateRule(batteryEndChange);
        }

        function batteryRemove() {
            removeConditions('Battery');
            updateRule(batteryEndChange);
        }

        function buttonBeginChange() {
            vm.button.form.isChanging = true;
            vm.button.form.pushed = vm.button.model.pushed === null ? '' : vm.button.model.pushed;
        }

        function buttonEndChange() {
            vm.button.form.isChanging = false;
            vm.button.form.pushed = null;
        }

        function buttonSubmit() {
            removeConditions('ButtonPushed');
            if (vm.button.form.pushed !== '') {
                vm.rule.conditions.push('ButtonPushed ' + vm.button.form.pushed);
            }
            updateRule(buttonEndChange);
        }

        function buttonRemove() {
            removeConditions('ButtonPushed');
            updateRule(buttonEndChange);
        }

        function geofenceBeginChange() {
            vm.geofence.form.isChanging = true;
            vm.geofence.form.option = vm.geofence.model.option;
            vm.geofence.form.geofence = vm.geofence.model.geofence;
            loadGeofences();

        }

        function geofenceEndChange() {
            vm.geofence.form.isChanging = false;
            vm.geofence.form.option = null;
            vm.geofence.form.geofence = null;
            vm.geofence.form.geofences = null;
        }

        function geofenceSubmit() {
            removeConditions('InAnyGeofence');
            removeConditions('NotInAnyGeofence');
            removeConditions('InGeofence');
            removeConditions('NotInGeofence');
            if(vm.geofence.form.geofence)
                vm.geofence.form.geofence.geofenceId = vm.geofence.form.geofence.id;

            switch(vm.geofence.form.option) {
                case 'in-any':
                    vm.rule.conditions.push('InAnyGeofence');
                    break;
                case 'not-in-any':
                    vm.rule.conditions.push('NotInAnyGeofence');
                    break;
                case 'in':
                    vm.rule.conditions.push('InGeofence ' + vm.geofence.form.geofence.geofenceId);
                    break;
                case 'not-in':
                    vm.rule.conditions.push('NotInGeofence ' + vm.geofence.form.geofence.geofenceId);
                    break;
            }
            updateRule(geofenceEndChange);
        }

        function geofenceRemove() {
            removeConditions('InAnyGeofence');
            removeConditions('NotInAnyGeofence');
            removeConditions('InGeofence');
            removeConditions('NotInGeofence');
            updateRule(geofenceEndChange);
        }

        function isFirstCondition(conditionName) {

            var firstCondition = null;

            if (vm.battery.model.above !== null || vm.battery.model.below !== null)
                firstCondition = 'battery';
            if (!firstCondition && vm.button.model.pushed)
                firstCondition = 'button';
            if (!firstCondition && (vm.geofence.model.option))
                firstCondition = 'geofence';
            if (!firstCondition && (vm.light.model.above !== null || vm.light.model.below !== null))
                firstCondition = 'light';
            if (!firstCondition && (vm.humidity.model.above !== null || vm.humidity.model.below !== null))
                firstCondition = 'humidity';
            if (!firstCondition && (vm.location.model.method))
                firstCondition = 'location';
            if (!firstCondition && (vm.motion.model.detected !== null))
                firstCondition = 'motion';
            if (!firstCondition && (vm.pressure.model.above !== null || vm.pressure.model.below !== null))
                firstCondition = 'pressure';
            if (!firstCondition && (vm.route.model.option))
                firstCondition = 'route';
            if (!firstCondition && (vm.shock.model.above !== null))
                firstCondition = 'shock';
            if (!firstCondition && (vm.storeAndForward.model.option))
                firstCondition = 'storeAndForward';
            if (!firstCondition && (vm.temperature.model.above !== null || vm.temperature.model.below !== null ))
                firstCondition = 'temperature';
            if (!firstCondition && (vm.temperatureProbe.model.above !== null || vm.temperatureProbe.model.below !== null))
                firstCondition = 'temperatureProbe';
                if (!firstCondition && (vm.tilt.model.above !== null || vm.tilt.model.below !== null))
                firstCondition = 'tilt'; 

            return conditionName == firstCondition;
        }

        function lightBeginChange() {
            vm.light.form.isChanging = true;
            vm.light.form.above = vm.light.model.above;
            vm.light.form.below = vm.light.model.below;
        }

        function lightEndChange() {
            vm.light.form.isChanging = false;
            vm.light.form.above = null;
            vm.light.form.below = null;
        }

        function lightSubmit() {
            removeConditions('Light');
            if (vm.light.form.below !== null) {
                vm.light.form.below = Math.round(vm.light.form.below);
                vm.rule.conditions.push('LightBelow ' + vm.light.form.below);
            }
            if (vm.light.form.above !== null) {
                vm.light.form.above = Math.round(vm.light.form.above);
                vm.rule.conditions.push('LightAbove ' + vm.light.form.above);
            }
            updateRule(lightEndChange);
        }

        function lightRemove() {
            removeConditions('Light');
            updateRule(lightEndChange);
        }

        function humidityBeginChange() {
            vm.humidity.form.isChanging = true;
            vm.humidity.form.above = vm.humidity.model.above;
            vm.humidity.form.below = vm.humidity.model.below;
        }

        function humidityEndChange() {
            vm.humidity.form.isChanging = false;
            vm.humidity.form.above = null;
            vm.humidity.form.below = null;
        }

        function humiditySubmit() {
            removeConditions('Humidity');
            if (vm.humidity.form.below !== null) {
                vm.humidity.form.below = Math.round(vm.humidity.form.below);
                vm.rule.conditions.push('HumidityBelow ' + vm.humidity.form.below);
            }
            if (vm.humidity.form.above !== null) {
                vm.humidity.form.above = Math.round(vm.humidity.form.above);
                vm.rule.conditions.push('HumidityAbove ' + vm.humidity.form.above);
            }
            updateRule(humidityEndChange);
        }

        function humidityRemove() {
            removeConditions('Humidity');
            updateRule(humidityEndChange);
        }
        function tiltBeginChange() {
            vm.tilt.form.isChanging = true;
            vm.tilt.form.above = vm.tilt.model.above;
            vm.tilt.form.below = vm.tilt.model.below;
        }

        function tiltEndChange() {
            vm.tilt.form.isChanging = false;
            vm.tilt.form.above = null;
            vm.tilt.form.below = null;
        }

        function tiltSubmit() {
            removeConditions('Tilt');
            if (vm.tilt.form.below !== null) {
                vm.tilt.form.below = Math.round(vm.tilt.form.below);
                vm.rule.conditions.push('TiltBelow ' + vm.tilt.form.below);
            }
            if (vm.tilt.form.above !== null) {
                vm.tilt.form.above = Math.round(vm.tilt.form.above);
                vm.rule.conditions.push('TiltAbove ' + vm.tilt.form.above);
            }
            updateRule(tiltEndChange);
        }

        function tiltRemove() {
            removeConditions('Tilt');
            updateRule(tiltEndChange);
        }

        function load() {
            $rootScope.loading = true;
            vm.rule = null;
            var promise = AlarmsService.getRules(vm.alarm).$promise;
            promise.then(
                function(result) {
                    if (result.length > 0) {
                        vm.rule = result[0];
                        setConditionModels(vm.rule.conditions);
                        return;
                    }

                    vm.rule = {
                        alarmId: vm.alarm.alarmId,
                        ruleName: vm.alarm.alarmName,
                        conditions: []
                    };
                },
                function (error) {
                    console.log(error);
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function loadGeofences() {
            $rootScope.loading = true;
            vm.geofence.form.geofences = [];
            var radialPromise = RadialGeofencesService.getGeofences(SentinelUiSession.focus).$promise;
            radialPromise.then(
                function(result) {
                    vm.geofence.form.geofences = vm.geofence.form.geofences.concat(result);
                },
                function(error) {
                    console.log(error);
                    vm.feedback.addError(error.data.message);
                }
            );

            var polygonPromise = PolygonGeofencesService.getGeofences(SentinelUiSession.focus).$promise;
            polygonPromise.then(
                function(result) {
                    vm.geofence.form.geofences = vm.geofence.form.geofences.concat(result);
                },
                function(error) {
                    console.log(error);
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function loadGeofenceForCondition(geofenceId) {
            $rootScope.loading = true;
            var radialPromise = RadialGeofencesService.getGeofence(geofenceId).$promise;
            radialPromise.then(
                function(result) {
                    vm.geofence.model.geofence = result;
                },
                function(error) {
                    if (error.status !== 404) {
                        console.log(error);
                        vm.feedback.addError(error.data.message);
                    }
                }
            );

            var polygonPromise = PolygonGeofencesService.getGeofence(geofenceId).$promise;
            polygonPromise.then(
                function(result) {
                    vm.geofence.model.geofence = result;
                },
                function(error) {
                    if (error.status !== 404) {
                        console.log(error);
                        vm.feedback.addError(error.data.message);
                    }
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function loadRoutes() {
            $rootScope.loading = true;
            vm.route.form.routes = [];
            var promise = RoutesService.getRoutes(SentinelUiSession.focus).$promise;
            promise.then(
                function(result) {
                    vm.route.form.routes = result;
                },
                function(error) {
                    console.log(error);
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function loadRouteForCondition(routeId) {
            $rootScope.loading = true;
            var promise = RoutesService.getRoute(routeId).$promise;
            promise.then(
                function(result) {
                    vm.route.model.route = result;
                },
                function(error) {
                    console.log(error);
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function locationBeginChange() {
            vm.location.form.isChanging = true;
            vm.location.form.method = vm.location.model.method === null ? '' : vm.location.model.method;
        }

        function locationEndChange() {
            vm.location.form.isChanging = false;
            vm.location.form.method = null;
        }

        function locationSubmit() {
            removeConditions('LocationMethod');
            if (vm.location.form.method !== '') {
                vm.rule.conditions.push('LocationMethod ' + vm.location.form.method);
            }
            updateRule(locationEndChange);
        }

        function locationRemove() {
            removeConditions('LocationMethod');
            updateRule(locationEndChange);
        }

        function motionBeginChange() {
            vm.motion.form.isChanging = true;
            vm.motion.form.detected = vm.motion.model.detected === null ? '' : vm.motion.model.detected;
        }

        function motionEndChange() {
            vm.motion.form.isChanging = false;
            vm.motion.form.detected = null;
        }

        function motionSubmit() {
            removeConditions('Motion');
            if (vm.motion.form.detected !== '') {
                vm.rule.conditions.push('MotionDetected ' + vm.motion.form.detected);
            }
            updateRule(motionEndChange);
        }

        function motionRemove() {
            removeConditions('Motion');
            updateRule(motionEndChange);
        }

        function pressureBeginChange() {
            vm.pressure.form.isChanging = true;
            vm.pressure.form.above = vm.pressure.model.above;
            vm.pressure.form.below = vm.pressure.model.below;
        }

        function pressureEndChange() {
            vm.pressure.form.isChanging = false;
            vm.pressure.form.above = null;
            vm.pressure.form.below = null;
        }

        function pressureSubmit() {
            removeConditions('Pressure');
            if (vm.pressure.form.below !== null) {
                vm.pressure.form.below = Math.round(vm.pressure.form.below * 100) / 100;
                vm.rule.conditions.push('PressureBelow ' + vm.pressure.form.below + ' kPa');
            }
            if (vm.pressure.form.above !== null) {
                vm.pressure.form.above = Math.round(vm.pressure.form.above * 100) / 100;
                vm.rule.conditions.push('PressureAbove ' + vm.pressure.form.above + ' kPa');
            }
            updateRule(pressureEndChange);
        }

        function pressureRemove() {
            removeConditions('Pressure');
            updateRule(pressureEndChange);
        }

        function removeConditions(prefixToRemove) {
            var conditions = [];

            _.forEach(vm.rule.conditions, function(condition) {
                if (!_.startsWith(condition,prefixToRemove)) {
                    conditions.push(condition);
                }
            });
            vm.rule.conditions = conditions;
        }

        function resetConditionModels() {
            vm.battery.model.above = null;
            vm.battery.model.below = null;
            vm.button.model.pushed = null;
            vm.geofence.model.option = null;
            vm.geofence.model.geofence = null;
            vm.light.model.above = null;
            vm.light.model.below = null;
            vm.humidity.model.below = null;
            vm.humidity.model.above = null;
            vm.location.model.method = null;
            vm.motion.model.detected = null;
            vm.pressure.model.above = null;
            vm.pressure.model.below = null;
            vm.route.model.option = null;
            vm.route.model.route = null;
            vm.shock.model.above = null;
            vm.shock.model.pushed = null;
            vm.storeAndForward.model.option = null;
            vm.temperature.model.above = null;
            vm.temperature.model.aboveUnit = null;
            vm.temperature.model.below = null;
            vm.temperature.model.belowUnit = null;
            vm.temperatureProbe.model.above = null;
            vm.temperatureProbe.model.aboveUnit = null;
            vm.temperatureProbe.model.below = null;
            vm.temperatureProbe.model.belowUnit = null;
            vm.tilt.model.below = null;
            vm.tilt.model.above = null;
        }

        function routeBeginChange() {
            vm.route.form.isChanging = true;
            vm.route.form.option = vm.route.model.option;
            vm.route.form.route = vm.route.model.route;
            loadRoutes();
        }

        function routeEndChange() {
            vm.route.form.isChanging = false;
            vm.route.form.option = null;
            vm.route.form.route = null;
            vm.route.form.routes = null;
        }

        function routeSubmit() {
            removeConditions('OnRoute');
            removeConditions('NotOnRoute');
            switch(vm.route.form.option) {
                case 'on':
                    vm.rule.conditions.push('OnRoute ' + vm.route.form.route.routeId);
                    break;
                case 'not-on':
                    vm.rule.conditions.push('NotOnRoute ' + vm.route.form.route.routeId);
                    break;
            }
            updateRule(routeEndChange);
        }

        function routeRemove() {
            removeConditions('OnRoute');
            removeConditions('NotOnRoute');
            updateRule(routeEndChange);
        }

        function setConditionModels(conditions) {
            resetConditionModels();
            var values = null;
            _.forEach(conditions, function(condition) {
                if (_.startsWith(condition, 'TemperatureAbove')) {
                    values = condition.split(' ');
                    vm.temperature.model.above = Number(values[1]);
                    vm.temperature.model.aboveUnit = values[2];
                }
                if (_.startsWith(condition, 'TemperatureBelow')) {
                    values = condition.split(' ');
                    vm.temperature.model.below = Number(values[1]);
                    vm.temperature.model.belowUnit = values[2];
                }
                if (_.startsWith(condition, 'TemperatureProbeAbove')) {
                    values = condition.split(' ');
                    vm.temperatureProbe.model.above = Number(values[1]);
                    vm.temperatureProbe.model.aboveUnit = values[2];
                }
                if (_.startsWith(condition, 'TemperatureProbeBelow')) {
                    values = condition.split(' ');
                    vm.temperatureProbe.model.below = Number(values[1]);
                    vm.temperatureProbe.model.belowUnit = values[2];
                }
                if (_.startsWith(condition, 'LightAbove')) {
                    values = condition.split(' ');
                    vm.light.model.above = Number(values[1]);
                }
                if (_.startsWith(condition, 'LightBelow')) {
                    values = condition.split(' ');
                    vm.light.model.below = Number(values[1]);
                }

                if (_.startsWith(condition, 'HumidityAbove')) {
                    values = condition.split(' ');
                    vm.humidity.model.above = Number(values[1]);
                }
                if (_.startsWith(condition, 'HumidityBelow')) {
                    values = condition.split(' ');
                    vm.humidity.model.below = Number(values[1]);
                }
                if (_.startsWith(condition, 'TiltAbove')) {
                    values = condition.split(' ');
                    vm.tilt.model.above = Number(values[1]);
                }
                if (_.startsWith(condition, 'TiltBelow')) {
                    values = condition.split(' ');
                    vm.tilt.model.below = Number(values[1]);
                }
                if (_.startsWith(condition, 'PressureAbove')) {
                    values = condition.split(' ');
                    vm.pressure.model.above = values[2].toLowerCase() === 'kpa' ?
                        Number(values[1]) :
                        UomPressureConverter.kPa(Number(values[1]), 'ceil');
                }
                if (_.startsWith(condition, 'PressureBelow')) {
                    values = condition.split(' ');
                    vm.pressure.model.below = values[2].toLowerCase() === 'kpa' ?
                        Number(values[1]) :
                        UomPressureConverter.kPa(Number(values[1]), 'floor');
                }
                if (_.startsWith(condition, 'ShockAbove')) {
                    values = condition.split(' ');
                    vm.shock.model.above = Number(values[1]);
                }
                if (_.startsWith(condition, 'ShockDetected')) {
                    vm.shock.model.above = !vm.shock.model.above ? RANGES.shock.min : vm.shock.model.above;
                }
                if (_.startsWith(condition, 'BatteryBelow')) {
                    values = condition.split(' ');
                    vm.battery.model.below = Number(values[1]);
                }
                if (_.startsWith(condition, 'BatteryAbove')) {
                    values = condition.split(' ');
                    vm.battery.model.above = Number(values[1]);
                }
                if (_.startsWith(condition, 'ButtonPushed')) {
                    values = condition.split(' ');
                    vm.button.model.pushed = values[1];
                }
                if (_.startsWith(condition, 'MotionDetected')) {
                    values = condition.split(' ');
                    vm.motion.model.detected = values[1];
                }
                if (_.startsWith(condition, 'InAnyGeofence')) {
                    vm.geofence.model.option = 'in-any';
                }
                if (_.startsWith(condition, 'NotInAnyGeofence')) {
                    vm.geofence.model.option = 'not-in-any';
                }
                if (_.startsWith(condition, 'InGeofence')) {
                    values = condition.split(' ');
                    vm.geofence.model.option = 'in';
                    loadGeofenceForCondition(values[1]);
                }
                if (_.startsWith(condition, 'NotInGeofence')) {
                    values = condition.split(' ');
                    vm.geofence.model.option = 'not-in';
                    loadGeofenceForCondition(values[1]);
                }
                if (_.startsWith(condition, 'OnRoute')) {
                    values = condition.split(' ');
                    vm.route.model.option = 'on';
                    loadRouteForCondition(values[1]);
                }
                if (_.startsWith(condition, 'NotOnRoute')) {
                    values = condition.split(' ');
                    vm.route.model.option = 'not-on';
                    loadRouteForCondition(values[1]);
                }
                if (_.startsWith(condition, 'LocationMethod')) {
                    values = condition.split(' ');
                    vm.location.model.method = values[1];
                }
                if (_.startsWith(condition, 'ExcludeStoreAndForward')) {
                    values = condition.split(' ');
                    vm.storeAndForward.model.option = values[1];
                }
            });
        }

        function setPermissions() {
            if (SentinelUiSession.user.isSystemAdmin ||
                SentinelUiSession.user.isAccountAdmin ||
                SentinelUiSession.user.isAccountEditor) {

                vm.hasPermission.toChange = true;
            }
        }

        function shockBeginChange() {
            vm.shock.form.isChanging = true;
            vm.shock.form.above = vm.shock.model.above;
        }

        function shockEndChange() {
            vm.shock.form.isChanging = false;
            vm.shock.form.above = null;
        }

        function shockSubmit() {
            removeConditions('Shock');
            if (vm.shock.form.above !== null) {
                vm.shock.form.above = Math.round(vm.shock.form.above * 10) / 10;
                vm.rule.conditions.push('ShockAbove ' + vm.shock.form.above);
            }
            updateRule(shockEndChange);
        }

        function shockRemove() {
            removeConditions('Shock');
            updateRule(shockEndChange);
        }

        function storeAndForwardBeginChange() {
            vm.storeAndForward.form.isChanging = true;
            vm.storeAndForward.form.option = vm.storeAndForward.model.option === null ? '' : vm.storeAndForward.model.option;
        }

        function storeAndForwardEndChange() {
            vm.storeAndForward.form.isChanging = false;
            vm.storeAndForward.form.option = null;
        }

        function storeAndForwardSubmit() {
            removeConditions('ExcludeStoreAndForward');
            console.log(vm.storeAndForward.form.option);
            if (vm.storeAndForward.form.option !== '') {
                vm.rule.conditions.push('ExcludeStoreAndForward ' + vm.storeAndForward.form.option);
            }
            updateRule(storeAndForwardEndChange);
        }

        function storeAndForwardRemove() {
            removeConditions('ExcludeStoreAndForward');
            updateRule(storeAndForwardEndChange);
        }

        function temperatureBeginChange() {
            vm.temperature.form.isChanging = true;
            vm.temperature.form.above = vm.temperature.model.above;
            vm.temperature.form.below = vm.temperature.model.below;

            if (vm.temperature.model.belowUnit) {
                vm.temperature.form.unit = vm.temperature.model.belowUnit.toLowerCase();
            }
            else if (vm.temperature.model.aboveUnit) {
                vm.temperature.form.unit = vm.temperature.model.aboveUnit.toLowerCase();
            }
            else {
                vm.temperature.form.unit = 'c';
            }
        }

        function temperatureEndChange() {
            vm.temperature.form.isChanging = false;
            vm.temperature.form.above = null;
            vm.temperature.form.aboveUnit = null;
            vm.temperature.form.below = null;
            vm.temperature.form.belowUnit = null;
        }

        function temperatureSubmit() {
            removeConditions('TemperatureAbove');
            removeConditions('TemperatureBelow');
            if (vm.temperature.form.below !== null) {
                vm.temperature.form.below = Math.round(vm.temperature.form.below * 100) / 100;
                vm.rule.conditions.push('TemperatureBelow ' + vm.temperature.form.below + ' ' + vm.temperature.form.unit);
            }
            if (vm.temperature.form.above !== null) {
                vm.temperature.form.above = Math.round(vm.temperature.form.above * 100) / 100;
                vm.rule.conditions.push('TemperatureAbove ' + vm.temperature.form.above + ' ' + vm.temperature.form.unit);
            }
            updateRule(temperatureEndChange);
        }

        function temperatureRemove() {
            removeConditions('TemperatureAbove');
            removeConditions('TemperatureBelow');
            updateRule(temperatureEndChange);
        }

        function temperatureProbeBeginChange() {
            vm.temperatureProbe.form.isChanging = true;
            vm.temperatureProbe.form.above = vm.temperatureProbe.model.above;
            vm.temperatureProbe.form.below = vm.temperatureProbe.model.below;

            if (vm.temperatureProbe.model.belowUnit) {
                vm.temperatureProbe.form.unit = vm.temperatureProbe.model.belowUnit.toLowerCase();
            }
            else if (vm.temperatureProbe.model.aboveUnit) {
                vm.temperatureProbe.form.unit = vm.temperatureProbe.model.aboveUnit.toLowerCase();
            }
            else {
                vm.temperatureProbe.form.unit = 'c';
            }

        }

        function temperatureProbeEndChange() {
            vm.temperatureProbe.form.isChanging = false;
            vm.temperatureProbe.form.above = null;
            vm.temperatureProbe.form.unit = 'c';
            vm.temperatureProbe.form.below = null;
        }

        function temperatureProbeSubmit() {
            removeConditions('TemperatureProbe');
            if (vm.temperatureProbe.form.below !== null) {
                vm.temperatureProbe.form.below = Math.round(vm.temperatureProbe.form.below * 100) / 100;
                vm.rule.conditions.push('TemperatureProbeBelow ' + vm.temperatureProbe.form.below + ' ' + vm.temperatureProbe.form.unit);
            }
            if (vm.temperatureProbe.form.above !== null) {
                vm.temperatureProbe.form.above = Math.round(vm.temperatureProbe.form.above * 100) / 100;
                vm.rule.conditions.push('TemperatureProbeAbove ' + vm.temperatureProbe.form.above + ' '+ vm.temperatureProbe.form.unit);
            }
            updateRule(temperatureProbeEndChange);
        }

        function temperatureProbeRemove() {
            removeConditions('TemperatureProbe');
            updateRule(temperatureProbeEndChange);
        }

        function updateRule(endFn) {
            $rootScope.loading = true;
            vm.feedback.clear();

            var promise = vm.rule.ruleId ? AlarmsService.updateRule(vm.alarm, vm.rule).$promise :
                    AlarmsService.addRule(vm.alarm, vm.rule).$promise;
            promise.then(
                function(result) {
                    vm.rule = result;
                    setConditionModels(vm.rule.conditions);
                    endFn();
                },
                function (error) {
                    console.log(error);
                    vm.feedback.addError(error.data.message);
                    endFn();
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function selectGeofence(geofence) {
            vm.geofence.form.geofence = geofence;

        }

        function selectRoute(route) {
            vm.route.form.route = route;

        }

        function geofenceFilter(geofence) {
            if (!vm.geofence.form.filterText) {
                return true;
            }

            var searchText = vm.geofence.form.filterText.toLowerCase();

            return  geofence.name.toLowerCase().indexOf(searchText) > -1 ||
                geofence.address.toLowerCase().indexOf(searchText) > -1 ||
                (geofence.comments !== null && geofence.comments.toLowerCase().indexOf(searchText) > -1);
        }

        function routeFilter(route) {
            if (!vm.route.form.filterText) {
                return true;
            }

            var searchText = vm.route.form.filterText.toLowerCase();

            return  route.routeName.toLowerCase().indexOf(searchText) > -1 ||
                route.startAddress.toLowerCase().indexOf(searchText) > -1 ||
                route.endAddress.toLowerCase().indexOf(searchText) > -1 ||
                (route.comments !== null && route.comments.toLowerCase().indexOf(searchText) > -1);
        }

        function goToGeofence(geofence) {
            var returnState = $state.current.name;
            var returnStateParams = $state.params;
            $state.go(geofence.type === 'radius' ? 'geofence.radial' : 'geofence.polygon', { geofenceId: geofence.geofenceId, referrer: returnState, referrerParams: returnStateParams } );
        }

        function goToRoute(route) {
            var returnState = $state.current.name;
            var returnStateParams = $state.params;
            $state.go('route.admin', { routeId: route.routeId, referrer: returnState, referrerParams: returnStateParams } );
        }

    }
})();