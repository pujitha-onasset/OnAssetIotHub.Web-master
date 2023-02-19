(function() {
    'use strict';

    angular
        .module('ui-sentinel.alarms')
        .controller('AlarmAdminController', AlarmAdminController);

    AlarmAdminController.$inject = ['$rootScope', '$state', '$stateParams', 'AlarmsService', 'SentinelUiSession', 'FeedbackService'];
    function AlarmAdminController($rootScope, $state, $stateParams, AlarmsService, SentinelUiSession, FeedbackService) {
        var vm = {
            alarm: null,
            alarmName: {
                value: null,
                isPristine: true,
                hasError: function () {
                    return this.errors.isBlank || this.errors.isDuplicate;
                },
                errors: {
                    isBlank: true,
                    isDuplicate: false
                },
                validate: function () {
                    this.isPristine = false;
                    this.errors.isDuplicate = false;
                    this.errors.isBlank = !this.value;
                }
            },
            description: {
                value: null
            },
            severity: {
                value: 'warning',
                isPristine: true,
                hasError: function () {
                    return this.errors.isBlank;
                },
                errors: {
                    isBlank: true
                },
                validate: function () {
                    this.isPristine = false;
                    this.errors.isBlank = !this.value;
                }
            },
            alarmType: {
                value: 'separation',
                isPristine: true,
                hasError: function () {
                    return this.errors.isBlank;
                },
                errors: {
                    isBlank: true
                },
                validate: function () {
                    this.isPristine = false;
                    this.errors.isBlank = !this.value;
                }
            },
            alarmMisses: {
                value: 1,
                isPristine: true,
                hasError: function () {
                    return this.errors.isBlank;
                },
                errors: {
                    isBlank: true
                },
                validate: function () {
                    this.isPristine = false;
                    this.errors.isBlank = !this.value;
                }
            },
            alarmEndPoint: {
                value: null,
                isPristine: true,
                hasError: function () {
                    return this.errors.isBadFormat;
                },
                errors: {
                    isBadFormat: false,
                },
                validate: validateEndpoint
            },
            emailFrequency: {
                value: 'Off',
                isPristine: true,
                hasError: function () {
                    return this.errors.isBlank;
                },
                errors: {
                    isBlank: true
                },
                validate: function () {
                    this.isPristine = false;
                    this.errors.isBlank = !this.value;
                }
            },
            smsFrequency: {
                value: 'Off',
                isPristine: true,
                hasError: function () {
                    return this.errors.isBlank;
                },
                errors: {
                    isBlank: true
                },
                validate: function () {
                    this.isPristine = false;
                    this.errors.isBlank = !this.value;
                }
            },
            isActiveOnShipmentOnly: false,
            isNew: false,
            isRemoving: false,
            feedback: FeedbackService,
            hasPermission: {
                toChange: false,
                toDelete: false
            },
            actions: {
                close: close,
                reset: reset,
                submit: submit,
                remove: remove,
                beginRemove: beginRemove,
                cancelRemove: cancelRemove
            }
        };
        activate();
        return vm;

        ////////////////////////////////////////////

        function activate() {
            if($stateParams.clearMessage)
              vm.feedback.clear();
            $rootScope.$on('CLIENT_FOCUS_CHANGED', function (event, args) {
                if ($rootScope.$state.current.name == 'alarm.admin' || $rootScope.$state.current.name == 'alarm.new') {
                    $state.go('alarms.list');
                }
            });
            vm.isNew = $state.current.name === 'alarm.new';

            if (!vm.isNew) {
                load();
            }
            setPermissions();
        }

        function beginRemove() {
            vm.isRemoving = true;
        }

        function cancelRemove() {
            vm.isRemoving = false;
        }

        function close() {
            vm.alarm = null;
            reset();
            $state.go($stateParams.referrer, $stateParams.referrerParams);
        }

        function load() {
            $rootScope.loading = true;
            var promise = AlarmsService.getAlarm($stateParams.alarmId).$promise;
            promise.then(
                function(result) {
                    vm.alarm = result;
                    reset();
                },
                function (error) {
                    console.log(error);
                    vm.alarm = null;
                    reset();
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function reset() {
            if (!vm.alarm) {
                vm.alarmName.value = null;
                vm.description.value = null;
                vm.severity.value = 'warning';
                vm.alarmType.value = 'separation';
                vm.emailFrequency.value = 'Off';
                vm.smsFrequency.value = 'Off';
                vm.alarmMisses.value = 1;
                vm.alarmEndPoint.value = null;
                vm.isActiveOnShipmentOnly = false;
            }
            else {
                $state.current.data.subTitle = vm.alarm.alarmName;
                vm.alarmName.value = vm.alarm.alarmName;
                vm.description.value = vm.alarm.description;
                vm.severity.value = vm.alarm.isShowAsRedDot ? 'warning' : 'info';
                vm.alarmType.value = vm.alarm.alarmType;
                vm.emailFrequency.value = vm.alarm.emailFrequency;
                vm.smsFrequency.value = vm.alarm.smsFrequency;
                vm.alarmEndPoint.value = vm.alarm.alarmEndPoint;
                vm.isActiveOnShipmentOnly = vm.alarm.isActiveOnShipmentOnly;

                if (vm.alarmType.value === 'separation') {
                    vm.alarmMisses.value = vm.alarm.alarmMisses;
                } else {
                    vm.alarmMisses.value = 1;
                }
            }
            
            vm.alarmName.isPristine = true;
            vm.alarmName.errors.isBlank = true;
            vm.alarmName.errors.isDuplicate = false;
            
            vm.severity.isPristine = true;
            vm.severity.errors.isBlank = true;

            vm.alarmType.isPristine = true;
            vm.alarmType.errors.isBlank = true;

            vm.emailFrequency.isPristine = true;
            vm.emailFrequency.errors.isBlank = true;

            vm.smsFrequency.isPristine = true;
            vm.smsFrequency.errors.isBlank = true;
        }


        function submit() {
            vm.feedback.clear();

            vm.alarmName.validate();
            vm.severity.validate();
            vm.alarmType.validate();
            vm.emailFrequency.validate();
            vm.smsFrequency.validate();
            vm.alarmEndPoint.validate();
            

            if (vm.alarmName.hasError() ||
                vm.severity.hasError() ||
                vm.alarmType.hasError() ||
                vm.alarmEndPoint.hasError() ||
                vm.emailFrequency.hasError() ||
                vm.smsFrequency.hasError()) {
                return;
            }

            if (vm.alarmType.value === 'separation') {
                vm.alarmMisses.validate();
                if (vm.alarmMisses.hasError()) {
                    return;
                }
            } else {
                vm.alarmMisses.value = 1;
            }
            if( vm.alarmType.value === 'shipment')
                vm.isActiveOnShipmentOnly =true;
            
            var alarm = {
                alarmName: vm.alarmName.value,
                description: vm.description.value,
                isShowAsRedDot: vm.severity.value === 'warning',
                emailFrequency: vm.emailFrequency.value,
                smsFrequency: vm.smsFrequency.value,
                alarmMisses: vm.alarmMisses.value,
                alarmEndPoint: vm.alarmEndPoint.value,
                alarmType: vm.alarmType.value,
                isActiveOnShipmentOnly: vm.isActiveOnShipmentOnly,
                isSeparationAlarm: vm.alarmType.value === 'separation',
            };
            if (!vm.isNew) {
                alarm.alarmId = vm.alarm.alarmId;
            }

            $rootScope.loading = true;
            
            var promise = vm.isNew ?
                AlarmsService.addAlarm(SentinelUiSession.focus, alarm).$promise
                : AlarmsService.putAlarm(alarm).$promise;
            promise.then(
                function (result) {
                    vm.alarm = result;
                    reset();
                    vm.feedback.addSuccess(vm.alarm.alarmName + ' has been ' + (vm.isNew ? 'created' : 'updated'));
                    if (vm.isNew) {
                        createDefaultRule();
                        vm.isNew = false;
                    }
                    else{
                        updateDefaultRule();
                    }
                },
                function (error) {
                    console.log("*");
                    console.log(error);
                    if (error.status === -1) {
                        vm.feedback.addError('Unable to connect to server.  Please try again later.');
                        //return;
                    }

                    if (error.status === 400 && error.data.message.indexOf('already exists') > -1) {
                        vm.alarmName.errors.isDuplicate = true;
                        //return;
                    }
                    vm.feedback.addError(error.data.message);                    
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }
        
        function createDefaultRule() {
            var rule = {
                alarmId: vm.alarm.alarmId,
                ruleName: vm.alarm.alarmName,
                conditions: []
            };
            var promise = AlarmsService.addRule(vm.alarm, rule).$promise;
            promise.then(
                function(result) {
                    $state.go('alarm.admin', { alarmId: vm.alarm.alarmId,clearMessage:false });
                },
                function(error) {
                    vm.feedback.addError(error.data.message);
                }
            );            
        }
        function updateDefaultRule() {
            $rootScope.loading = true;
            var promise = AlarmsService.getRules(vm.alarm).$promise;
            var rule={};
            promise.then(
                function(result) {
                    rule = result[0];
                if(rule.ruleName!=vm.alarm.alarmName)
                {
                    rule.ruleName=vm.alarm.alarmName;
                    var promise = AlarmsService.updateRule(vm.alarm, rule).$promise;
                    promise.then(
                        function(result) {
                            $state.go('alarm.admin', { alarmId: vm.alarm.alarmId,clearMessage:false });
                        },
                        function(error) {
                            vm.feedback.addError(error.data.message);
                        }
                    ); 
                }
                    reset();
                },
                
                function (error) {
                    console.log(error);
                    vm.alarm = null;
                    reset();
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function setPermissions() {
            vm.hasPermission.toChange =
                SentinelUiSession.user.isSystemAdmin ||
                SentinelUiSession.user.isAccountAdmin ||
                SentinelUiSession.user.isAccountEditor;

            vm.hasPermission.toDelete =
                SentinelUiSession.user.isSystemAdmin ||
                SentinelUiSession.user.isAccountAdmin;
        }

        function remove() {
            $rootScope.loading = true;
            vm.feedback.clear();
            var promise = AlarmsService.removeAlarm(vm.alarm).$promise;
            promise.then(
                function(result) {
                    $state.go('alarms.list');
                },
                function (error) {
                    console.log(error);
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function validateEndpoint() {
            vm.alarmEndPoint.isPristine = false;

            if (!vm.alarmEndPoint.value)
                return;

            var formatValidator = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i;

            vm.alarmEndPoint.errors.isBadFormat = !formatValidator.test(vm.alarmEndPoint.value.trim());
        }

    }
})();