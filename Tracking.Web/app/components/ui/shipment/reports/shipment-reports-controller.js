(function () {
    'use strict';

    angular
        .module('tracking.ui.shipment.reports')
        .controller('ShipmentReportsController', ShipmentReportsController);

    ShipmentReportsController.$inject = ['$rootScope', '$scope', '$state', '$stateParams', 'localStorageService', 'ShipmentService', 'ShipmentReportsService', 'ShipmentReportsFilterService'];
    function ShipmentReportsController($rootScope, $scope, $state, $stateParams, localStorageService, ShipmentService, ShipmentReportsService, ShipmentReportsFilterService) {

        var vm = {
            shipment: null,
            shipmentService: ShipmentService,
            reportsService: ShipmentReportsService,
            filterService: ShipmentReportsFilterService,
            selectReport: selectReport,
            selectedGuid: null
        };
        activate();
        return vm;

        function activate() {
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
                    return vm.shipmentService.shipment;
                },
                function (shipment) {
                    if ($state.current.name === 'shipment.reports') {
                        onShipmentChange(shipment);
                    }
                }
            );
            $scope.$watch(
                function() {
                    return vm.filterService;
                },
                function () {
                    if ($rootScope.$state.current.name !== 'shipment.reports') {
                        return;
                    }

                    vm.filterService.save();
                }, true
            );

            vm.shipmentId = $stateParams.shipmentId ? $stateParams.shipmentId : localStorageService.get('shipment.map.shipmentId');
            if (!vm.shipmentId) {
                $state.go('home');
                return;
            }
            localStorageService.set('shipment.map.shipmentId', vm.shipmentId);

            if (!vm.shipmentService.shipment || vm.shipmentService.shipment.shipmentInfo.shipmentId !== vm.shipmentId) {
                vm.shipmentService.loadShipment(vm.shipmentId);
            }
        }

        function onShipmentChange(shipment) {
            if (shipment === vm.shipment) {
                return;
            }

            vm.shipment = shipment;
            if (!vm.shipment) {
                vm.shipmentId = null;
                vm.reportsService.clear();
                return;
            }
            vm.reportsService.init(vm.shipment.shipmentInfo.shipmentId);
        }

        function selectReport(report) {
            vm.reportsService.selected = vm.reportsService.selected === report ? null : report;
        }        
    }

})();