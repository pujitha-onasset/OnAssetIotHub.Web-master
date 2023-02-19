(function () {
    'use strict';

    angular
        .module('ui-sentinel.devices.sentinelTracking')
        .controller('SentinelTrackingListController', SentinelTrackingListController);

    SentinelTrackingListController.$inject = ['$rootScope', '$scope', '$state', '$stateParams', 'SentinelTrackingReportsService', 'SentinelTrackingFilterService', 'UomSecondsConverter', 'SentinelReportColumnSelectorService'];
    function SentinelTrackingListController($rootScope, $scope, $state, $stateParams, SentinelTrackingReportsService, SentinelTrackingFilterService, UomSecondsConverter, SentinelReportColumnSelectorService) {

        var vm = {
            columns: SentinelReportColumnSelectorService,
            reportsService: SentinelTrackingReportsService,
            filterService: SentinelTrackingFilterService,
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

                if ($rootScope.$state.current.name == 'device.sentinelreports') {
                    $state.go('devices.sentinelreports');
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
                    if ($rootScope.$state.current.name !== 'device.sentinelreports') {
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

