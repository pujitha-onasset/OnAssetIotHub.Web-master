(function() {
    'use strict';

    angular
        .module('ui-sentinel.alarms')
        .controller('AlarmsBySentinelController', AlarmsBySentinelController);

    AlarmsBySentinelController.$inject = ['$rootScope', '$state', 'SentinelUiSession', 'AlarmsService', 'FeedbackService'];
    function AlarmsBySentinelController($rootScope, $state, SentinelUiSession, AlarmsService, FeedbackService) {
        var vm = {
            session: SentinelUiSession,
            feedback: FeedbackService,
            list: null,
            hasPermission: {
                toCreate: false
            },
            filterText: null,
            showShipmentAlarms: true,
            showDeviceAlarms: true,
            showSeparationAlarms: true,
            showWarnings: true,
            showInfos: true,
            filter: filter,
            toggleWarnings: function () {
                vm.showWarnings = !vm.showWarnings;
                $('#btn-warning').blur();
            },
            toggleInfos: function () {
                vm.showInfos = !vm.showInfos;
                $('#btn-info').blur();
            },
            toggleShipmentAlarms: function () {
                vm.showShipmentAlarms = !vm.showShipmentAlarms;
                $('#btn-shipmentAlarms').blur();
            },
            toggleDeviceAlarms: function () {
                vm.showDeviceAlarms = !vm.showDeviceAlarms;
                $('#btn-deviceAlarms').blur();
            },
             toggleSeparationAlarms: function () {
                vm.showSeparationAlarms = !vm.showSeparationAlarms;
                $('#btn-separationAlarms').blur();
            },
            propertyName: 'alarmName',
            reverse: false,
            sortBy: sortBy,
        };
        activate();
        return vm;

        function activate() {
            $rootScope.$on('CLIENT_FOCUS_CHANGED', function (event, args) {
                if ($rootScope.$state.current.name == 'alarms.list') {
                    load();
                }
            });

            setPermissions();
            load();
        }

        function filter(alarm) {
            var textMatch = vm.filterText ? false : true;
            if (!textMatch && alarm.alarmName.toLowerCase().indexOf(vm.filterText.toLowerCase()) > -1) {
                textMatch = true;
            }

            var warningMatch = (vm.showWarnings && alarm.isShowAsRedDot);
            var infoMatch = (vm.showInfos && !alarm.isShowAsRedDot);

            var shipmentAlarmMatch = (vm.showShipmentAlarms && alarm.alarmType == 'shipment');
            var deviceAlarmMatch = (vm.showDeviceAlarms && alarm.alarmType == 'device');
            var separationAlarmMatch = (vm.showSeparationAlarms && alarm.alarmType == 'separation');

            return textMatch && (warningMatch || infoMatch) && (shipmentAlarmMatch || deviceAlarmMatch || separationAlarmMatch);
        }

        function load() {
            vm.list = null;
            $rootScope.loading = true;

            var promise = AlarmsService.getAlarmsForSentinel($state.params.sentinel).$promise;
            promise.then(
                function(result) {
                    vm.list = result;
                },
                function (error) {
                    console.log(error);
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function setPermissions() {
            vm.hasPermission.toCreate =
                SentinelUiSession.user.isSystemAdmin ||
                SentinelUiSession.user.isAccountAdmin;
        }

        function sortBy(propertyName) {
            vm.reverse = (vm.propertyName === propertyName) ? !vm.reverse : false;
            vm.propertyName = propertyName;
        }
    }
})();

