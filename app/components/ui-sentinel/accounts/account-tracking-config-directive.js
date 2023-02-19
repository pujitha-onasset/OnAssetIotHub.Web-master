(function () {
    'use strict';

    angular
        .module('ui-sentinel.accounts')
        .directive('accountTrackingConfig', AccountTrackingConfigDirective);

    function AccountTrackingConfigDirective() {
        var directive = {
            restrict: 'A',
            controller: ThisDirectiveController,
            controllerAs: 'accountTrackingConfig',
            templateUrl: 'ui-sentinel-accounts/account-tracking-config-directive.html',
            link: link
        };
        return directive;

        function link(scope, element, attrs, controller) {
            scope.$watch(
                function(scope) {
                    return scope.accountListUi.account;
                },
                function (newValue, oldValue) {
                    controller.account = newValue;
                }, true
            );
        }
    }

    ThisDirectiveController.$inject = ['AccountApiService', 'SentinelUiSession', 'FeedbackService', 'TrackingConfigConstants'];
    function ThisDirectiveController(AccountApiService, SentinelUiSession, FeedbackService, TrackingConfigConstants) {
        var defaultTrackingPageUri =  TrackingConfigConstants.DEFAULT_URL + '<ref>';

        var vm = {
            account: null,
            config: null,
            feedback: FeedbackService,
            shipmentReferencePrefix: {
                value: null,
                isPristine: true,
                hasError: function() {
                    return this.errors.isBlank || this.errors.isDuplicate;
                },
                errors: {
                    isBlank: true,
                    isDuplicate: true
                },
                validate: function () {
                    this.isPristine = false;
                    this.errors.isDuplicate = false;
                    this.errors.isBlank = !this.value;
                }
            },
            trackingUrl: {
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
            panel: {
                isCollapsed: true,
                toggle: function () {
                    this.isCollapsed = !this.isCollapsed;
                    if (!this.isCollapsed) { load(); }
                }
            },
            isConfigured: false,
            isAdding: false,
            hasPermission: {
                toChange: false
            },
            actions: {
                submit: submit,
                reset: function() {
                    load();
                },
                remove: remove,
                beginAdd: beginAdd,
                endAdd: endAdd,
                reload: load

            }
        };
        activate();
        return vm;

        function activate() {
            setPermissions();
        }
        
        function beginAdd() {
            vm.isAdding = true;
            reset();
        }

        function endAdd() {
            vm.isAdding = false;
        }

        function remove() {
            vm.feedback.clear();
            var cfg = {
                shipmentReferencePrefix:null,
                trackingUrl:null
            }
            var promise = AccountApiService.changeShipmentConfiguration(vm.account,cfg).$promise;
            promise.then(
                function (result) {
                    if (vm.account.id === SentinelUiSession.focus.id) {
                        SentinelUiSession.focus.trackingConfig = null;
                    }
                    vm.account.shipmentReferencePrefix=null;
                    vm.account.trackingUrl=null;
                    vm.config = null;
                    reset();
                    vm.feedback.addSuccess('Tracking configuration removed');
                },
                function (error) {
                    vm.feedback.addError(error.data.message);
                }
            );
            

        }

        function submit() {
            vm.feedback.clear();

            vm.shipmentReferencePrefix.validate();
            vm.trackingUrl.validate();

            if (vm.shipmentReferencePrefix.hasError() || vm.trackingUrl.hasError()) {
                return;
            }

            var config = {
                shipmentReferencePrefix: vm.shipmentReferencePrefix.value,
                trackingUrl: vm.trackingUrl.value
            };

            var promise = AccountApiService.changeShipmentConfiguration(vm.account, config).$promise;
            promise.then(
                function (result) {
                    if (vm.account.id === SentinelUiSession.focus.id) {
                        SentinelUiSession.focus.trackingConfig = result;
                    }
                    vm.config = config;
                    vm.account.shipmentReferencePrefix = config.shipmentReferencePrefix;
                    vm.account.trackingUrl = config.trackingUrl;
                    vm.isAdding = false;
                    reset();
                    vm.feedback.addSuccess('Tracking configuration saved');
                },
                function (error) {
                    if (error.status === -1) {
                        vm.feedback.addError('Unable to connect to server.  Please try again later.');
                        return;
                    }

                    if (error.status === 400 && error.data.message.indexOf('already exists') > -1) {
                        vm.shipmentReferencePrefix.errors.isDuplicate = true;
                        return;
                    }

                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function setPermissions() {
            vm.hasPermission.toChange = 
                SentinelUiSession.user.isSystemAdmin ||
                SentinelUiSession.user.isAccountAdmin ||
                SentinelUiSession.user.isAccountEditor;
        }

        function load() {
            vm.feedback.clear();
            if(vm.account && vm.account.shipmentReferencePrefix && vm.account.trackingUrl){
                vm.config = {
                    shipmentReferencePrefix: vm.account.shipmentReferencePrefix,
                    trackingUrl: vm.account.trackingUrl
                }
            } else {
                vm.config = null;
            }
            reset();
        }

        function reset() {
            vm.shipmentReferencePrefix.value = null;
            vm.shipmentReferencePrefix.isPristine = true;
            vm.shipmentReferencePrefix.errors.isBlank = true;
            vm.shipmentReferencePrefix.errors.isDuplicate = false;

            vm.trackingUrl.value = defaultTrackingPageUri;
            vm.trackingUrl.isPristine = true;
            vm.trackingUrl.errors.isBlank = true;

            vm.isConfigured = vm.config !== null && vm.config.shipmentReferencePrefix !== null;
            if (vm.isConfigured) {
                vm.shipmentReferencePrefix.value = vm.config.shipmentReferencePrefix;
                vm.trackingUrl.value = vm.config.trackingUrl;
            }
        }
    }
})();