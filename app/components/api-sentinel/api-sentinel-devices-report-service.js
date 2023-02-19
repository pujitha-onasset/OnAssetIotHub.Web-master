(function() {
    'use strict';

    angular
        .module('api-sentinel')
        .factory('DevicesReportService', DevicesReportService);

    DevicesReportService.$inject = ['$resource', 'SENTINEL_API_HOST_CONSTANTS'];
    function DevicesReportService($resource, HOST) {
        var api = $resource(HOST.URL + '/rest/1/devicereport/GetPivotDeviceDataReport' , {}, {
            getDataReport: { method: 'GET'},
            getDataHistoryReport: { method: 'GET', url: HOST.URL + '/rest/1/devicereport/GetDevicePivotDataHistoryLog'}
        });

        //decided to return a service definition instead of the resource so that UI developer
        //can be abstracted from details of $resource and request logic can be encapsulated if necessary
        var service = {
            getDataReport: getDataReport,
            getDataHistoryReport:getDataHistoryReport,
            resource: api
        };

        return service;

        function getDataReport(client,deviceTagId) {
            return api.getDataReport({ accountId: client.id , deviceFilter:deviceTagId});
        }

        function getDataHistoryReport(client,timePeriod,type,filter) {
            return api.getDataHistoryReport({ accountId: client.id ,timePeriod: timePeriod,deviceFilter:type,deviceDescription:filter });
        }

      
    }

})();