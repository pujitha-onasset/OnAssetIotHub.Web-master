(function() {
    'use strict';

    angular
        .module('api-sentinel')
        .factory('ShipmentsReportService', ShipmentsReportService);

    ShipmentsReportService.$inject = ['$resource', 'SENTINEL_API_HOST_CONSTANTS'];
    function ShipmentsReportService($resource, HOST) {
        var api = $resource(HOST.URL + '/rest/1/clients/:clientGuid/shipmentreports', {}, {
             getLatestReports: { method: 'GET', params: { clientGuid: '@clientGuid' }, url: HOST.URL + '/rest/1/shipments/getLatestShipmentReportsForClient', isArray: true},
            getLatestReportCount: { method: 'GET', params: { clientGuid: '@clientGuid' }, url: HOST.URL + '/rest/1/shipments/latest/count'},
            getShipmentReports: { method: 'GET', params: { shipmentId: '@shipmentId'}, url: HOST.URL + '/rest/1/shipments/:shipmentId/shipmentreports', isArray: true},
            getShipmentReportCount: { method: 'GET', params: { shipmentId: '@shipmentId' }, url: HOST.URL + '/rest/1/shipments/:shipmentId/shipmentreports/count'},
            getLatestShipmentReport: { method: 'GET', params: { shipmentId: '@shipmentId'}, url: HOST.URL + '/rest/1/shipments/latest'},
            searchDeviceReports: { method: 'GET', params: { clientGuid: '@clientGuid'}, url: HOST.URL + '/rest/1/shipments/devicereports/search?deviceDescription=:deviceDescription'}
        });

        //decided to return a service definition instead of the resource so that UI developer
        //can be abstracted from details of $resource and request logic can be encapsulated if necessary
        var service = {
            getLatestReports: getLatestReports,
            getLatestReportCount: getLatestReportCount,
            getShipmentReports: getShipmentReports,
            getShipmentReportCount: getShipmentReportCount,
            getLatestShipmentReport: getLatestShipmentReport,
            searchDeviceReports: searchDeviceReports,
            resource: api
        };

        return service;


        function getLatestReports(client, fromDate, toDate, page, pageSize) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.getLatestReports({ clientGuid: client.id, from: fromDateIso, to: toDateIso, page: page, itemsPerPage: pageSize });
        }

        function getLatestReportCount(client, fromDate, toDate) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.getLatestReportCount({ clientGuid: client.id, from: fromDateIso, to: toDateIso });
        }

        function getShipmentReports(shipmentId, fromDate, toDate, page, pageSize) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.getShipmentReports({ shipmentId: shipmentId, from: fromDateIso, to: toDateIso, page: page, itemsPerPage: pageSize });
        }

        function getShipmentReportCount(shipmentId, fromDate, toDate) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.getShipmentReportCount({ shipmentId: shipmentId, from: fromDateIso, to: toDateIso });
        }

        function getLatestShipmentReport(shipmentId) {
            return api.getLatestShipmentReport({ shipmentId: shipmentId });
        }

        function searchDeviceReports(clientGuid,deviceDescription) {
            return api.searchDeviceReports({ clientGuid: clientGuid, deviceDescription:deviceDescription });
        }

    }

})();