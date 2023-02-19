(function () {
    'use strict';

    angular
        .module('api-sentinel')
        .factory('SightingsAccountApiService', SightingsAccountApiService);

    SightingsAccountApiService.$inject = ['$resource', 'SENTINEL_API_HOST_CONSTANTS'];
    function SightingsAccountApiService($resource, HOST) {

        var api = $resource(HOST.URL + '/rest/1/sightings', {}, {
            listSightingsForReport: {  method: 'GET', params: { imei: '@imei', reportId: '@reportId' }, url: HOST.URL + '/rest/1/sentry500s/:imei/reports/:reportId/sentinelsightings', isArray: true},
            countSightingsForReport: {  method: 'GET', params: { imei: '@imei', reportId: '@reportId' }, url: HOST.URL + '/rest/1/sentry500s/:imei/reports/:reportId/sentinelsightings/count'},
            listSightingsForDevice: {  method: 'GET', params: { imei: '@imei' }, url: HOST.URL + '/rest/1/sentry500s/:imei/sentinelsightings', isArray: true},
            countSightingsForDevice: {  method: 'GET', params: { imei: '@imei' }, url: HOST.URL + '/rest/1/sentry500s/:imei/sentinelsightings/count'},
            listSightings: {  method: 'GET', url: HOST.URL + '/rest/1/sentinelsightings', isArray: true},
            countSightings: {  method: 'GET', url: HOST.URL + '/rest/1/sentinelsightings/count'},
            latestSightings: {  method: 'GET', url: HOST.URL + '/rest/1/sentinelsightings/latest', isArray: true},
            countLatestSightings: {  method: 'GET', url: HOST.URL + '/rest/1/sentinelsightings/latest/count'},
            getSightingsPivotReport: {  method: 'GET', params: { imei: '@imei' }, url: HOST.URL + '/rest/1/sentry500s/:imei/sentinelsightings/pivot'},
            listSightingsOfMac: {  method: 'GET', params: { mac: '@mac', reportId: '@reportId' }, url: HOST.URL + '/rest/1/sentinels/:mac/sightings', isArray: true},
            countSightingsOfMac: {  method: 'GET', params: { mac: '@mac', reportId: '@reportId' }, url: HOST.URL + '/rest/1/sentinels/:mac/sightings/count'},
        });

        var service = {
            listSightingsForReport: listSightingsForReport,
            countSightingsForReport: countSightingsForReport,
            listSightingsForDevice: listSightingsForDevice,
            countSightingsForDevice: countSightingsForDevice,
            getSightingsPivotReport: getSightingsPivotReport,
            listSightings: listSightings,
            countSightings: countSightings,
            latestSightings: latestSightings,
            countLatestSightings: countLatestSightings,
            listSightingsOfMac: listSightingsOfMac,
            countSightingsOfMac: countSightingsOfMac
        };
        return service;

        //////////////////////////////////////////////////////////////////////////////////////////////////////

        function listSightingsForReport(imei, reportId, page) {
            return api.listSightingsForReport({imei: imei, reportId: reportId, page: page });
        }

        function countSightingsForReport(imei, reportId) {
            return api.countSightingsForReport({imei: imei, reportId: reportId });
        }

        function listSightingsForDevice(imei, fromDate, toDate, page, itemsPerPage) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.listSightingsForDevice({imei: imei, from: fromDateIso, to: toDateIso, itemsPerPage: itemsPerPage, page: page });
        }

        function countSightingsForDevice(imei, fromDate, toDate, itemsPerPage) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.countSightingsForDevice({imei: imei, from: fromDateIso, to: toDateIso, itemsPerPage: itemsPerPage });
        }

        function getSightingsPivotReport(imei, fromDate, toDate, itemsPerPage, page) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.getSightingsPivotReport({imei: imei, from: fromDateIso, to: toDateIso, itemsPerPage: itemsPerPage, page: page });
        }

        function listSightings(fromDate, toDate, page, itemsPerPage) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.listSightings({from: fromDateIso, to: toDateIso, itemsPerPage: itemsPerPage, page: page });
        }

        function countSightings(fromDate, toDate, itemsPerPage) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.countSightings({from: fromDateIso, to: toDateIso, itemsPerPage: itemsPerPage });
        }

        function latestSightings(page, itemsPerPage) {
            return api.latestSightings({ itemsPerPage: itemsPerPage, page: page });
        }

        function countLatestSightings(itemsPerPage) {
            return api.countLatestSightings({ itemsPerPage: itemsPerPage });
        }

        function listSightingsOfMac(mac, fromDate, toDate, page, itemsPerPage) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.listSightingsOfMac({mac: mac, from: fromDateIso, to: toDateIso, itemsPerPage: itemsPerPage, page: page });
        }

        function countSightingsOfMac(mac, fromDate, toDate, itemsPerPage) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.countSightingsOfMac({mac: mac, from: fromDateIso, to: toDateIso, itemsPerPage: itemsPerPage });
        }
    }

})();