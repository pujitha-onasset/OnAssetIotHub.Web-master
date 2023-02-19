(function () {
    'use strict';

    angular
        .module('ui-sentinel.geofences')
        .directive('geofenceAlarms', GeofenceAlarmsDirective);

    function GeofenceAlarmsDirective() {
        var directive = {
            restrict: 'A',
            scope: {
              geofence: '='
            },
            controller: ThisDirectiveController,
            controllerAs: 'geofenceAlarms',
            bindToController: true,
            templateUrl: 'ui-sentinel-geofences/geofence-alarms-directive.html',
            link: link
        };
        return directive;

        function link(scope, element, attrs, controller) {
            // scope.$watch(
            //     function(scope) {
            //         return scope.geofenceAdmin.geofence;
            //     },
            //     function (newValue, oldValue) {
            //         controller.geofence = newValue;
            //     }, true
            // );
        }
    }

    ThisDirectiveController.$inject = ['$state', '$rootScope', 'RadialGeofencesService', 'PolygonGeofencesService', 'FeedbackService', 'SentinelUiSession', 'RlsUiSession', 'localStorageService'];
    function ThisDirectiveController($state,$rootScope, RadialGeofencesService, PolygonGeofencesService, FeedbackService, SentinelUiSession, RlsUiSession, localStorageService) {
        var vm = {
            // geofence: null,
            alarms: null,
            panel: {
                isCollapsed: true,
                toggle: function () {
                    this.isCollapsed = !this.isCollapsed;
                    if (!this.isCollapsed) { load(); }
                }
            },
            hasPermission: {
                toChangeAlarms: false
            },
            feedback: FeedbackService,
            actions: {
                goToAlarm: goToAlarm,
                reload: load
            }
        };
        activate();
        return vm;

        function activate() {
            setPermissions();
        }

        function load() {
            vm.alarms = null;
            $rootScope.loading = true;
            var promise = vm.geofence.type === 'radius' ?
                    RadialGeofencesService.getAlarms(vm.geofence).$promise :
                    PolygonGeofencesService.getAlarms(vm.geofence).$promise;
            promise.then(
                function(result) {
                    $rootScope.loading = false;
                    vm.alarms = result;
                },
                function (error) {
                    $rootScope.loading = false;
                   vm.feedback.addError(error.data.message);
                }
            );
        }

        function goToAlarm(alarmId) {
            var returnState = $state.current.name;
            var returnStateParams = $state.params;
            $state.go('alarm.admin', { alarmId: alarmId, referrer: returnState, referrerParams: returnStateParams } );
        }

        function setPermissions() {
            var user = localStorageService.get('isRlsRoute') ? RlsUiSession.user : SentinelUiSession.user;
            vm.hasPermission.toChangeAlarms =
                user.isSystemAdmin || 
                user.isAccountAdmin ||
                user.isAccountEditor;
        }

    }

})();