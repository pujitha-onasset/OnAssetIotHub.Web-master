(function () {
    'use strict';

    angular
        .module('ui-sentinel.devices.deviceTracking')
        .controller('DeviceTrackingListController', DeviceTrackingListController);

    DeviceTrackingListController.$inject = ['$rootScope', '$scope', '$state', '$stateParams', 'DeviceTrackingReportsService', 'DeviceTrackingFilterService', 'UomSecondsConverter', 'SentryReportColumnSelectorService'];
    function DeviceTrackingListController($rootScope, $scope, $state, $stateParams, DeviceTrackingReportsService, DeviceTrackingFilterService, UomSecondsConverter, SentryReportColumnSelectorService) {

        var vm = {
            columns: SentryReportColumnSelectorService,
            reportsService: DeviceTrackingReportsService,
            filterService: DeviceTrackingFilterService,
            secondsService: UomSecondsConverter,
            selectReport: selectReport,
            selectedGuid: null
        };
        activate();
        return vm;

        function activate() {
            setPermissions();
            $rootScope.$on('CLIENT_FOCUS_CHANGED', function (event, args) {
                vm.reportsService.clear();

                if ($rootScope.$state.current.name == 'device.reports') {
                    $state.go('devices.reports');
                }
            });

            $scope.$watch(
                function() {
                    return vm.reportsService.selected;
                },
                function (report) {
                    vm.selectedGuid = report ? report.reportGuid : null;
                }, true
            );

            $scope.$watch(
                function() {
                    return vm.filterService;
                },
                function () {
                    if ($rootScope.$state.current.name !== 'device.reports') {
                        return;
                    }

                    vm.filterService.save();
                }, true
            );

            var deviceTagId = $stateParams.deviceTagId;
            $state.current.data.subTitle = deviceTagId;
            
            if (deviceTagId !== vm.reportsService.deviceTagId) {
                vm.reportsService.init(deviceTagId);
            }
        }

        function setPermissions() {

        }

        function selectReport(report) {
            vm.reportsService.selected = vm.reportsService.selected === report ? null : report;
        }

    }

})();

