(function() {
    'use strict';

    angular
        .module('api-sentinel')
        .factory('ShipmentListService', ShipmentListService);

    ShipmentListService.$inject = ['$resource', 'SENTINEL_API_HOST_CONSTANTS'];
    function ShipmentListService($resource, HOST) {
        var api = $resource(HOST.URL + '/rest/1/shipmentlist', {}, {
            getShipmentList: { method: 'GET', url: HOST.URL + '/rest/1/shipmentlist/GetAllShipmentListItems', isArray: true},
            GetAllShipmentListItemsByDateRange: { method: 'GET', url: HOST.URL + '/rest/1/shipmentlist/GetAllShipmentListItemsByDateRange', isArray: true},
            GetAllShipmentListItemsByDateForClientRange: { method: 'GET', url: HOST.URL + '/rest/1/shipmentlist/GetAllShipmentListItemsForClientByRange', isArray: true},
            GetAllShipmentListItemsByDateRangeCount: { method: 'GET', url: HOST.URL + '/rest/1/shipmentlist/GetAllShipmentListItemsByDateRange/count'},
            GetAllShipmentListItemsByDateForClientRangeCount: { method: 'GET', url: HOST.URL + '/rest/1/shipmentlist/GetAllShipmentListItemsForClientByRange/count'},
            getActiveShipmentList: { method: 'GET', url: HOST.URL + '/rest/1/shipmentlist/active', isArray: true},
            getPendingShipmentList: { method: 'GET', url: HOST.URL + '/rest/1/shipmentlist/pending', isArray: true},
            getInTransitShipmentList: { method: 'GET', url: HOST.URL + '/rest/1/shipmentlist/in-transit', isArray: true},
            getCompletedShipmentList: { method: 'GET', url: HOST.URL + '/rest/1/shipmentlist/complete', isArray: true},
            getCancelledShipmentList: { method: 'GET', url: HOST.URL + '/rest/1/shipmentlist/cancelled', isArray: true},
            getExpiredShipmentList: { method: 'GET', url: HOST.URL + '/rest/1/shipmentlist/expired', isArray: true},
            getOverdueShipmentList: { method: 'GET', url: HOST.URL + '/rest/1/shipmentlist/overdue', isArray: true},
            getShipmentListItem: { method: 'GET', url: HOST.URL + '/rest/1/shipmentlist/:shipmentId'}
        });

        //decided to return a service definition instead of the resource so that UI developer
        //can be abstracted from details of $resource and request logic can be encapsulated if necessary
        var service = {
            getShipmentList: getShipmentList,
            GetAllShipmentListItemsByDateRange: GetAllShipmentListItemsByDateRange,
            GetAllShipmentListItemsByDateForClientRange:GetAllShipmentListItemsByDateForClientRange,
            getActiveShipmentList: getActiveShipmentList,
            getPendingShipmentList: getPendingShipmentList,
            getInTransitShipmentList: getInTransitShipmentList,
            getCompletedShipmentList: getCompletedShipmentList,
            getCancelledShipmentList: getCancelledShipmentList,
            getExpiredShipmentList: getExpiredShipmentList,
            getOverdueShipmentList: getOverdueShipmentList,
            getShipmentListItem: getShipmentListItem,
            GetAllShipmentListItemsByDateRangeCount:GetAllShipmentListItemsByDateRangeCount,
            GetAllShipmentListItemsByDateForClientRangeCount:GetAllShipmentListItemsByDateForClientRangeCount,
            resource: api
        };

        return service;

        function getActiveShipmentList(client, fromDate, toDate) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.getActiveShipmentList({ clientGuid: client.clientGuid, from: fromDateIso, to: toDateIso });
        }

        function getPendingShipmentList(client, fromDate, toDate) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.getPendingShipmentList({ clientGuid: client.clientGuid, from: fromDateIso, to: toDateIso });
        }

        function getInTransitShipmentList(client, fromDate, toDate) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.getInTransitShipmentList({ clientGuid: client.clientGuid, from: fromDateIso, to: toDateIso });
        }

        function getCompletedShipmentList(client, fromDate, toDate) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.getCompletedShipmentList({ clientGuid: client.clientGuid, from: fromDateIso, to: toDateIso });
        }

        function getCancelledShipmentList(client, fromDate, toDate) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.getCancelledShipmentList({ clientGuid: client.clientGuid, from: fromDateIso, to: toDateIso });
        }

        function getExpiredShipmentList(client, fromDate, toDate) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.getExpiredShipmentList({ clientGuid: client.clientGuid, from: fromDateIso, to: toDateIso });
        }

        function getOverdueShipmentList(client, fromDate, toDate) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.getOverdueShipmentList({ clientGuid: client.clientGuid, from: fromDateIso, to: toDateIso });
        }
        function getShipmentListItem(shipmentId) {

            return api.getShipmentListItem({ shipmentId: shipmentId });
        }

        function getShipmentList(client) {
            return api.getShipmentList({ clientGuid: client.clientGuid });
        }

        function GetAllShipmentListItemsByDateRange(client, fromDate, toDate,page,itemsPerPage) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.GetAllShipmentListItemsByDateRange({ clientGuid: client.clientGuid, from: fromDateIso, to: null,page:page,itemsPerPage:itemsPerPage });
        }
        
        function GetAllShipmentListItemsByDateForClientRange(client, fromDate, toDate,page,itemsPerPage) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.GetAllShipmentListItemsByDateForClientRange({ clientGuid: client.id, from: fromDateIso, to: null,page:page,itemsPerPage:itemsPerPage });
        }
        
        function GetAllShipmentListItemsByDateRangeCount(client, fromDate, toDate,itemsPerPage) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.GetAllShipmentListItemsByDateRangeCount({ clientGuid: client.clientGuid, from: fromDateIso, to: null,itemsPerPage:itemsPerPage });
        }
        
        function GetAllShipmentListItemsByDateForClientRangeCount(client, fromDate, toDate,itemsPerPage) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.GetAllShipmentListItemsByDateForClientRangeCount({ clientGuid: client.id, from: fromDateIso, to: null,itemsPerPage:itemsPerPage });
        }

    }

})();