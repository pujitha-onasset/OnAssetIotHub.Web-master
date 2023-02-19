(function () {
    'use strict';

    angular
        .module('ui-sentinel.shipments.shipmentsList')
        .directive('shipmentsListFilterBar', ShipmentsListFilterBarDirective);

    function ShipmentsListFilterBarDirective() {
        var directive = {
            restrict: 'A',
            controller: ThisDirectiveController,
            controllerAs: 'shipmentsListFilterBar',
            templateUrl: 'ui-sentinel-shipments.shipmentsList/shipments-list-filterbar-directive.html',
        };
        return directive;
    }

    ThisDirectiveController.$inject = ['$scope', '$state', 'ShipmentsListFilterService'];
    function ThisDirectiveController($scope, $state, ShipmentsListFilterService) {
        var vm = {
            filter: ShipmentsListFilterService,
            showListFilterOptions: false,
            showReportFilterOptions: false,
            showOriginDestinationOptions: false,
            toggleSeverity: toggleSeverity,
            toggleProperty: toggleProperty,
            toggleTimelineFilter: toggleTimelineFilter,
            resetPropertyFilter: resetPropertyFilter,
            navToShipmentsMap: navToShipmentsMap,
            navToShipmentMap: navToShipmentMap,
            navToShipmentsReports: navToShipmentsReports,
            navToShipmentReports: navToShipmentReports            
        };

        activate();
        return vm;

        ////////////////////////////////////////////////////////////////////////////

        function activate() {
            vm.showReportFilterOptions = $state.current.name !== 'shipments.list';
            vm.showListFilterOptions = $state.current.name === 'shipments.list';
            vm.showOriginDestinationOptions = $state.current.name !== 'shipment.map' && $state.current.name !== 'shipment.reports' ;

            $scope.$on('$stateChangeSuccess', function () {
                vm.showReportFilterOptions = $state.current.name !== 'shipments.list';
                vm.showListFilterOptions = $state.current.name === 'shipments.list';
                vm.showOriginDestinationOptions = $state.current.name !== 'shipment.map' && $state.current.name !== 'shipment.reports' ;
            });
        }

        function resetPropertyFilter() {
            vm.filter.reports.range.above = vm.filter.reports.range.min;
            vm.filter.reports.range.below = vm.filter.reports.range.max;
            vm.filter.reports.range.from = vm.filter.reports.range.min;
            vm.filter.reports.range.to = vm.filter.reports.range.max;
            $('#btn-reset-property').blur();
        }

        function toggleProperty() {
            vm.filter.reports.range.enabled = !vm.filter.reports.range.enabled;
            $('#btn-property').blur();
        }

        function toggleSeverity(severity) {
            switch (severity) {
                case 'ok':
                    vm.filter.reports.showOk = !vm.filter.reports.showOk;
                    break;
                case 'info':
                    vm.filter.reports.showInfo = !vm.filter.reports.showInfo;
                    break;
                case 'warning':
                    vm.filter.reports.showWarning = !vm.filter.reports.showWarning;
                    break;
            }
            $('#btn-' + severity).blur();
        }

        function toggleTimelineFilter() {
            vm.filter.reports.dateRange.enabled = !vm.filter.reports.dateRange.enabled;
            $('#btn-timeline-filter').blur();
        }

        function navToShipmentsMap() {
            $state.go('shipments.map');
        }

        function navToShipmentMap() {
            $state.go('shipment.map', { shipmentId: $state.params.shipmentId });
        }

        function navToShipmentsReports() {
            $state.go('shipments.reports');
        }

        function navToShipmentReports() {
            $state.go('shipment.reports', { shipmentId: $state.params.shipmentId });
        }        

    }
})();