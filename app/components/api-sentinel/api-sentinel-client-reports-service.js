(function() {
    'use strict';

    angular
        .module('api-sentinel')
        .factory('ClientReportsService', ClientReportsService);

    ClientReportsService.$inject = ['$resource', 'SENTINEL_API_HOST_CONSTANTS'];
    function ClientReportsService($resource, HOST) {
         
        var api = $resource(HOST.URL + '/rest/1/clients/:clientGuid', {}, {
            getLatestSentry500Reports: { method: 'GET', params: {  }, url: HOST.URL + '/rest/1/shipments/devicereports/sentry500/latest'},
            getLatestSentry500ReportsByClient: { method: 'GET', params: {  }, url: HOST.URL + '/rest/1/shipments/devicereports/sentry500/latest/byclient'},
            getLatestSentry500ReportCount: { method: 'GET', params: {  }, url: HOST.URL + '/rest/1/shipments/devicereports/sentry500/latest/count'},
            getLatestSentry500ReportByClientCount: { method: 'GET', params: {  }, url: HOST.URL + '/rest/1/shipments/devicereports/sentry500/latest/byclient/count'}
        });

        //decided to return a service definition instead of the resource so that UI developer
        //can be abstracted from details of $resource and request logic can be encapsulated if necessary
        var service = {
            getLatestSentry500Reports: getLatestSentry500Reports,
            getLatestSentry500ReportCount: getLatestSentry500ReportCount,
            getLatestSentry500ReportsByClient: getLatestSentry500ReportsByClient,
            getLatestSentry500ReportByClientCount: getLatestSentry500ReportCount,
            resource: api
        };

        return service;

        ////////////////////////////////////

        function getLatestSentry500Reports(client, fromDate, toDate, page, pageSize) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.getLatestSentry500Reports({ from: fromDateIso, to: toDateIso, page: page, itemsPerPage: pageSize });
        }

        function getLatestSentry500ReportCount(client, fromDate, toDate) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.getLatestSentry500ReportCount({  from: fromDateIso, to: toDateIso });
        }

        function getLatestSentry500ReportsByClient(client, fromDate, toDate, page, pageSize) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.getLatestSentry500ReportsByClient({ clientGuid: client.id, from: fromDateIso, to: toDateIso, page: page, itemsPerPage: pageSize });
        }

        function getLatestSentry500ReportByClientCount(client, fromDate, toDate) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.getLatestSentry500ReportByClientCount({ clientGuid: client.id, from: fromDateIso, to: toDateIso });
        }
    }

})();