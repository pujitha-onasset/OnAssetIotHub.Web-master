(function () {
    'use strict';

    angular
        .module('ui-sentinel.shipments.shipmentsList')
        .factory('ShipmentsListFilterService', ShipmentsListFilterService);

    ShipmentsListFilterService.$inject = ['localStorageService'];
    function ShipmentsListFilterService(localStorageService) {

        var service = {
            searchText: null,
            status: 'All',
            origin: null,
            destination: null,
            filter: filterShipments,
            save: save
        };
        return service;

        function filterShipments(shipment) {
            var isTextMatch = true;
            if (service.searchText) {
                isTextMatch = (
                    shipment.deviceTagId.toLowerCase().indexOf(service.searchText.toString().toLowerCase()) > -1 ||
                    shipment.referenceNumber.toLowerCase().indexOf(service.searchText.toString().toLowerCase()) > -1
                );
            }

            var isOriginMatch = true;
            if (service.origin) {
                isOriginMatch = shipment.origin.toLowerCase().indexOf(service.origin.toString().toLowerCase()) > -1;
            }

            var isDestinationMatch = true;
            if (service.destination) {
                isDestinationMatch = shipment.destination.toLowerCase().indexOf(service.destination.toString().toLowerCase()) > -1;
            }

            var isStatusMatch = true;
            var shipmentStatus = shipment.status.toLowerCase();
            switch (service.status.toLowerCase()) {
                case 'active':
                    isStatusMatch = shipmentStatus === 'in-transit' || shipmentStatus === 'active';
                    break;
                case 'pending':
                    isStatusMatch = shipmentStatus === 'pending';
                    break;
                case 'in-transit':
                    isStatusMatch = shipmentStatus === 'in-transit';
                    break;
                case 'overdue':
                    isStatusMatch = shipmentStatus === 'overdue';
                    break;
                case 'expired':
                    isStatusMatch = shipmentStatus === 'expired';
                    break;
                case 'cancelled':
                    isStatusMatch = shipmentStatus === 'cancelled';
                    break;
                case 'complete':
                    isStatusMatch = shipmentStatus === 'complete';
                    break;
                default:
                    isStatusMatch = true;
            }

            return isTextMatch && isOriginMatch && isDestinationMatch && isStatusMatch;
        }

        function save() {
            var filterSettings = {
                searchText: service.searchText,
                status: service.status,
                origin: service.origin,
                destination: service.destination
            };
            localStorageService.set('shipmentsListFilterService', filterSettings);
        }
    }
})();