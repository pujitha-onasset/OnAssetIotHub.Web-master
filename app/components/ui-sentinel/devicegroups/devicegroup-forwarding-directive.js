(function () {
    'use strict';

    angular
        .module('ui-sentinel.devicegroups')
        .directive('devicegroupForwarding', DeviceGroupForwardingDirective);

    function DeviceGroupForwardingDirective() {
        var directive = {
            restrict: 'A',
            controller: ThisDirectiveController,
            controllerAs: 'devicegroupForwarding',
            templateUrl: 'ui-sentinel-devicegroups/devicegroup-forwarding-directive.html',
            link: link
        };
        return directive;

        function link(scope, element, attrs, controller) {
            scope.$watch(
                function(scope) {
                    return scope.deviceGroupAdmin.deviceGroup;
                },
                function (newValue, oldValue) {
                    controller.deviceGroup = newValue;
                }, true
            );
        }
    }

    ThisDirectiveController.$inject = ['DeviceGroupsService', 'SentinelUiSession', 'FeedbackService'];
    function ThisDirectiveController(DeviceGroupsService, SentinelUiSession, FeedbackService) {

        var vm = {
            deviceGroup: null,
            forwardingConfig: null,
            feedback: FeedbackService,
            authMethod: {
                value: 'OAuth',
                isPristine: true,
                hasError: function() {
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
            authEndpoint: {
                value: null,
                isPristine: true,
                hasError: function() {
                    return this.errors.isBlank || this.errors.isMissingHttp || this.errors.isNotUrl;
                },
                errors: {
                    isBlank: true,
                    isNotUrl: false,
                    isMissingHttp: false
                },
                validate: validateAuthEndpoint
            },
            dataEndpoint: {
                value: null,
                isPristine: true,
                hasError: function() {
                    return this.errors.isBlank || this.errors.isMissingHttp || this.errors.isNotUrl;
                },
                errors: {
                    isBlank: true,
                    isNotUrl: false,
                    isMissingHttp: false
                },
                validate: function () {
                    this.isPristine = false;
                    this.errors.isNotUrl = false;
                    this.errors.isMissingHttp = false;
                    this.errors.isBlank = !this.value;

                    if (!this.errors.isBlank) {
                        validateUrl(this);
                    }
                }
            },
            alarmEndpoint: {
                value: null,
                isPristine: true,
                hasError: function() {
                    return this.errors.isMissingHttp || this.errors.isNotUrl;
                },
                errors: {
                    isBlank: true,
                    isNotUrl: false,
                    isMissingHttp: false
                },
                validate: function () {
                    this.isPristine = false;
                    this.errors.isNotUrl = false;
                    this.errors.isMissingHttp = false;
                    this.errors.isBlank = !this.value;

                    if (!this.errors.isBlank) {
                        validateUrl(this);
                    }
                }
            },
            messageFormat: {
                value: 'json',
                isPristine: true,
                hasError: function() {
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
            notificationEmails: {
                value: null,
                isPristine: true,
                hasError: function() {
                    return this.errors.isBlank || this.errors.invalidEmails.length > 0;
                },
                errors: {
                    isBlank: true,
                    isNotUrl: false

                },
                validate: function () {
                    this.isPristine = false;
                    this.errors.invalidEmails = [];
                    this.errors.isBlank = !this.value;

                    if (!this.errors.isBlank) {
                        validateEmails();
                    }
                }
            },
            username: {
                value: null,
                isPristine: true,
                hasError: function() {
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
            password: {
                value: null,
                isPristine: true,
                hasError: function() {
                    return !this.errors.isBlank && this.errors.isBadFormat;
                },
                errors: {
                    isBlank: true,
                    isBadFormat: false
                },
                validate: function () {
                    this.isPristine = false;
                    this.errors.isBadFormat = false;
                    this.errors.isBlank = !this.value;

                    if (!this.errors.isBlank) {
                        validatePasswordFormat();
                    }
                }
            },
            panel: {
                isCollapsed: true,
                toggle: function () {
                    this.isCollapsed = !this.isCollapsed;
                    if (!this.isCollapsed) { load(); }
                }
            },
            mode: {
                isAdding: false,
                isChanging: false
            },
            hasPermission: {
                toAdd: false,
                toChange: false
            },
            actions: {
                beginAdd: beginAdd,
                beginChange: beginChange,
                end: end,
                remove: remove,
                submit: submit,
                reset: reset,
                reload: load
            }
        };
        activate();
        return vm;

        function activate() {
            setPermissions();
        }

        function beginAdd() {
            vm.mode.isAdding = true;
            reset();
        }

        function beginChange() {
            vm.mode.isChanging = true;
            reset();
        }

        function end() {
            vm.mode.isAdding = false;
            vm.mode.isChanging = false;
            reset();
        }

        function load() {
            vm.forwardingConfig = null;
            var promise = DeviceGroupsService.getForwarding(SentinelUiSession.focus,vm.deviceGroup).$promise;
            promise.then(
                function(result) {
                    if (result.groupId) {
                        vm.forwardingConfig = result;
                    }
                    reset();
                },
                function (error) {
                    if(error.status==404){
                 
                     reset();
                   }
                }
            );
        }

        function remove() {
            vm.feedback.clear();

            var promise = DeviceGroupsService.clearForwarding(SentinelUiSession.focus,vm.deviceGroup).$promise;
            promise.then(
                function(result) {
                    vm.forwardingConfig = null;
                    reset();
                },
                function (error) {
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function reset() {
            if (!vm.forwardingConfig) {
                vm.authMethod.value = 'OAuth';
                vm.authEndpoint.value = null;
                vm.dataEndpoint.value = null;
                vm.alarmEndpoint.value = null;
                vm.messageFormat.value = 'json';
                vm.notificationEmails.value = null;
                vm.username.value = null;
                vm.password.value = null;
            }
            else {
                vm.authMethod.value = vm.forwardingConfig.authenticationMethod;
                vm.authEndpoint.value = vm.forwardingConfig.authenticationEndpoint;
                vm.dataEndpoint.value = vm.forwardingConfig.dataForwardingEndpoint;
                vm.alarmEndpoint.value = vm.forwardingConfig.alarmForwardingEndpoint;
                vm.messageFormat.value = vm.forwardingConfig.messageFormat;
                vm.notificationEmails.value = vm.forwardingConfig.notificationEmails.join('; ');
                vm.username.value = vm.forwardingConfig.username;
                vm.password.value = null;
            }

            vm.authMethod.isPristine = true;
            vm.authMethod.errors.isBlank = true;

            vm.authEndpoint.isPristine = true;
            vm.authEndpoint.errors.isBlank = true;
            vm.authEndpoint.errors.isNotUrl = false;

            vm.dataEndpoint.isPristine = true;
            vm.dataEndpoint.errors.isBlank = true;
            vm.dataEndpoint.errors.isNotUrl = false;

            vm.alarmEndpoint.isPristine = true;
            vm.alarmEndpoint.errors.isBlank = true;
            vm.alarmEndpoint.errors.isNotUrl = false;

            vm.messageFormat.isPristine = true;
            vm.messageFormat.errors.isBlank = true;

            vm.notificationEmails.isPristine = true;
            vm.notificationEmails.errors.isBlank = true;
            vm.notificationEmails.errors.hasBadEmail = false;

            vm.username.isPristine = true;
            vm.username.errors.isBlank = true;

            vm.password.isPristine = true;
            vm.password.errors.isBlank = true;
            vm.password.errors.isBadFormat = false;
        }

        function setPermissions() {
            vm.hasPermission.toAdd =
                SentinelUiSession.user.isSystemAdmin;

            vm.hasPermission.toChange =
                SentinelUiSession.user.isSystemAdmin ||
                SentinelUiSession.user.isAccountAdmin;
        }

        function submit() {
            vm.feedback.clear();
            
            vm.authMethod.validate();
            vm.authEndpoint.validate();
            vm.dataEndpoint.validate();
            vm.alarmEndpoint.validate();
            vm.messageFormat.validate();
            vm.notificationEmails.validate();
            vm.username.validate();
            vm.password.validate();
            
            if (vm.authMethod.hasError() || 
                vm.authEndpoint.hasError() || 
                vm.dataEndpoint.hasError() || 
                vm.alarmEndpoint.hasError() || 
                vm.messageFormat.hasError() || 
                vm.notificationEmails.hasError() || 
                vm.username.hasError() || 
                vm.password.hasError()) {
                return;
            }

            var config = {
                groupId: vm.deviceGroup.id,
                authenticationMethod: vm.authMethod.value,
                authenticationEndpoint: vm.authMethod.value !== 'BasicAuth' ? vm.authEndpoint.value : null,
                dataForwardingEndpoint: vm.dataEndpoint.value,
                alarmForwardingEndpoint: vm.alarmEndpoint.value,
                messageFormat: vm.messageFormat.value,
                username: vm.username.value
            };
            if (vm.authMethod.value !== 'BasicAuth') {

            }
            if (vm.password.value) {
                config.password = vm.password.value;
            }

            var emails = vm.notificationEmails.value;
            emails = emails.replace(/\s/g, '').replace(/;/g, ',').split(',');

            config.notificationEmails = [];
            _.forEach(emails, function(email) {
               config.notificationEmails.push(email.trim());
            });

            var promise = vm.mode.isAdding ?
                DeviceGroupsService.addForwarding(SentinelUiSession.focus,vm.deviceGroup, config).$promise :
                DeviceGroupsService.changeForwarding(SentinelUiSession.focus,vm.deviceGroup, config).$promise;
            promise.then(
                function(result) {
                    vm.forwardingConfig = result;
                    end();
                    vm.feedback.addSuccess('Forwarding successfully ' + (vm.mode.isAdding ? 'added' : 'updated'));
                },
                function (error) {
                    if (error.status === -1) {
                        vm.feedback.addError('Could not connect to server.  Please try again later.');
                        return;
                    }

                    if (error.data.modelState) {
                        vm.authEndpoint.errors.isNotUrl = error.data.modelState['forwardingConfig.AuthenticationEndpoint'] && true;
                        vm.dataEndpoint.errors.isNotUrl = error.data.modelState['forwardingConfig.DataForwardingEndpoint'] && true;
                        vm.alarmEndpoint.errors.isNotUrl = error.data.modelState['forwardingConfig.AlarmForwardingEndpoint'] && true;

                        if (vm.authEndpoint.hasError() || vm.dataEndpoint.hasError() || vm.alarmEndpoint.hasError()) {
                            return;
                        }
                    }

                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function validateAuthEndpoint() {
            vm.authEndpoint.isPristine = false;
            vm.authEndpoint.errors.isNotUrl = false;
            vm.authEndpoint.errors.isMissingHttp = false;

            if (vm.authMethod.value === 'BasicAuth') {
                vm.authEndpoint.errors.isBlank = false;
                return;
            }
            
            vm.authEndpoint.errors.isBlank = !vm.authEndpoint.value;

            if (!vm.authEndpoint.errors.isBlank) {
                validateUrl(vm.authEndpoint);
            }
            
        }
        
        function validateUrl(property) {
            property.errors.isNotUrl = false;
            property.errors.isMissingHttp = false;

            if (!property.value)
                return;

            var url = property.value.trim();
            if (!_.startsWith(url, 'http://') && !_.startsWith(url, 'https://')) {
                property.errors.isMissingHttp = true;
                return;
            }

            var urlValidator = /^(http|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/i;
            property.errors.isNotUrl = (url.indexOf(' ') >= 0 || !urlValidator.test(url));
        }

        function validateEmails() {
            var emailValidator = /^([\w+-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/i;
            vm.notificationEmails.errors.invalidEmails = [];

            var emails = vm.notificationEmails.value.replace(/\s/g, '').replace(/;/g,',').split(',');
            _.forEach(emails, function(email) {
                if (email !== null && email.trim() !== '') {
                    var isEmail = emailValidator.test(email.trim());
                    if (!isEmail) {
                        vm.notificationEmails.errors.invalidEmails.push(email.trim());
                    }
                }
            });
        }

        function validatePasswordFormat() {
            vm.password.errors.isBadFormat = false;

            if (!vm.password.value) {
                return;
            }

            var passwordValidator = /^((?=.*\d)(?=.*[A-Z])(?=.*\W).{8,})$/;
            vm.password.errors.isBadFormat = !passwordValidator.test(vm.password.value);
        }

    }

})();