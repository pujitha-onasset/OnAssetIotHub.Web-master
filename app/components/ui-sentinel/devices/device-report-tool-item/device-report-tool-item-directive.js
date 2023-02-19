(function () {
    'use strict';

    angular
        .module('ui-sentinel.devices.deviceReportToolItem')
        .directive('deviceReportToolItem', DeviceReportToolItemDirective);

    function DeviceReportToolItemDirective() {
        var directive = {
            restrict: 'A',
            controller: ThisDirectiveController,
            controllerAs: 'deviceReportToolItem',
            templateUrl: 'ui-sentinel-devices.deviceReportToolItem/device-report-tool-item-directive.html',
            scope: {
                listItemReport: '=',
                listItemProperty: '=',
                listItemSuffix: "="
            }
        };
        return directive;
    }

    ThisDirectiveController.$inject = ['$scope', 'LatestDeviceTrackingReportsService'];
    function ThisDirectiveController($scope, LatestDeviceTrackingReportsService) {
        var vm = {
            listItemClicked: listItemClicked
        };

        activate();
        return vm;

        ////////////////////////////////////////////////////////////////////////////

        function activate() {
        }

        function listItemClicked() {
            LatestDeviceTrackingReportsService.selected = $scope.listItemReport;
        }

    }
})();