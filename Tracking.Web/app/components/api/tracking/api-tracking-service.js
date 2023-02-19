(function() {
    'use strict';

    angular
        .module('tracking.api.tracking')
        .factory('TrackingApiService', TrackingApiService);

    TrackingApiService.$inject = ['$resource', 'API_HOST_CONSTANTS'];
    function TrackingApiService($resource, HOST) {
        var api = $resource(HOST.URL + '/rest/1/tracking', {}, {
            search: { method: 'POST', url: HOST.URL + '/rest/1/tracking/shipments/search', isArray: true },
            getShipment: { method: 'GET', params: { shipmentId: '@shipmentId' }, url: HOST.URL + '/rest/1/tracking/shipments/:shipmentId' },
            getLatestShipmentReport: { method: 'GET', params: { shipmentId: '@shipmentId' }, url: HOST.URL + '/rest/1/tracking/shipments/:shipmentId/reports/latest' },
            getReports: { method: 'GET', params: { shipmentId: '@shipmentId' }, url: HOST.URL + '/rest/1/tracking/shipments/:shipmentId/reports', isArray: true },
            getReportsCount: { method: 'GET', params: { shipmentId: '@shipmentId' }, url: HOST.URL + '/rest/1/tracking/shipments/:shipmentId/reports/count', isArray: true }
        });

        //decided to return a service definition instead of the resource so that UI developer
        //can be abstracted from details of $resource and request logic can be encapsulated if necessary
        var service = {
            search: search,
            getShipment: getShipment,
            getLatestShipmentReport: getLatestShipmentReport,
            getReports: getReports,
            getReportsCount: getReportsCount,
            getReportsCountByDateRange: getReportsCountByDateRange,
            resource: api
        };

        return service;

        function search(referenceNumbers) {
            return api.search(null, { referenceNumbers: referenceNumbers });
        }

        function getLatestShipmentReport(shipmentId) {
            return api.getLatestShipmentReport({ shipmentId: shipmentId });
        }

        function getShipment(shipmentId) {
            return api.getShipment({ shipmentId: shipmentId });
        }

        function getReports(shipmentId, fromDate, toDate, page, pageSize) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.getReports({ shipmentId: shipmentId, from: fromDateIso, to: toDateIso, page: page, pageSize: pageSize });
        }

        function getReportsCount(shipmentId) {
            return api.getReportsCount({ shipmentId: shipmentId });
        }

        function getReportsCountByDateRange(shipmentId, fromDate, toDate) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.getReportsCount({ shipmentId: shipmentId, from: fromDateIso, to: toDateIso });
        }
    }

})();