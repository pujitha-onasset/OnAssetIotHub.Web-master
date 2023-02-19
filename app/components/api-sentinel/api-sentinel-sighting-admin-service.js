(function () {
    'use strict';

    angular
        .module('api-sentinel')
        .factory('SightingsAdminApiService', SightingsAdminApiService);

    SightingsAdminApiService.$inject = ['$resource', 'SENTINEL_API_HOST_CONSTANTS'];
    function SightingsAdminApiService($resource, HOST) {

        var api = $resource(HOST.URL + '/rest/1/sightings', {}, {
            listSightingsForReport: {  method: 'GET', params: { accountId: '@accountId', imei: '@imei', reportId: '@reportId' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentry500s/:imei/reports/:reportId/sentinelsightings', isArray: true},
            countSightingsForReport: {  method: 'GET', params: { accountId: '@accountId', imei: '@imei', reportId: '@reportId' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentry500s/:imei/reports/:reportId/sentinelsightings/count'},
            listSightingsForDevice: {  method: 'GET', params: { accountId: '@accountId', imei: '@imei' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentry500s/:imei/sentinelsightings', isArray: true},
            countSightingsForDevice: {  method: 'GET', params: { accountId: '@accountId', imei: '@imei' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentry500s/:imei/sentinelsightings/count'},
            listSightings: {  method: 'GET', params: { accountId: '@accountId' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentinelsightings', isArray: true},
            countSightings: {  method: 'GET', params: { accountId: '@accountId' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentinelsightings/count'},
            latestSightings: {  method: 'GET', params: { accountId: '@accountId' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentinelsightings/latest', isArray: true},
            countLatestSightings: {  method: 'GET', params: { accountId: '@accountId' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentinelsightings/latest/count'},
            getSightingsPivotReport: {  method: 'GET', params: { accountId: '@accountId', imei: '@imei' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentry500s/:imei/sentinelsightings/pivot'},
            listSightingsOfMac: {  method: 'GET', params: { accountId: '@accountId', mac: '@mac', reportId: '@reportId' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentinels/:mac/sightings', isArray: true},
            countSightingsOfMac: {  method: 'GET', params: { accountId: '@accountId', mac: '@mac', reportId: '@reportId' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentinels/:mac/sightings/count'},
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

        function listSightingsForReport(account, imei, reportId, page) {
            return api.listSightingsForReport({ accountId: account.id, imei: imei, reportId: reportId, page: page });
        }

        function countSightingsForReport(account, imei, reportId) {
            return api.countSightingsForReport({ accountId: account.id, imei: imei, reportId: reportId });
        }

        function listSightingsForDevice(account, imei, fromDate, toDate, page, itemsPerPage) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.listSightingsForDevice({ accountId: account.id, imei: imei, from: fromDateIso, to: toDateIso, itemsPerPage: itemsPerPage, page: page });
        }

        function countSightingsForDevice(account, imei, fromDate, toDate, itemsPerPage) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.countSightingsForDevice({ accountId: account.id, imei: imei, from: fromDateIso, to: toDateIso, itemsPerPage: itemsPerPage });
        }

        function getSightingsPivotReport(account, imei, fromDate, toDate, itemsPerPage, page) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.getSightingsPivotReport({ accountId: account.id, imei: imei, from: fromDateIso, to: toDateIso, itemsPerPage: itemsPerPage, page: page });
        }

        function listSightings(account, fromDate, toDate, page, itemsPerPage) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.listSightings({ accountId: account.id, from: fromDateIso, to: toDateIso, itemsPerPage: itemsPerPage, page: page });
        }

        function countSightings(account, fromDate, toDate, itemsPerPage) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.countSightings({ accountId: account.id, from: fromDateIso, to: toDateIso, itemsPerPage: itemsPerPage });
        }

        function latestSightings(account, page, itemsPerPage) {
            return api.latestSightings({ accountId: account.id, itemsPerPage: itemsPerPage, page: page });
        }

        function countLatestSightings(account, itemsPerPage) {
            return api.countLatestSightings({ accountId: account.id, itemsPerPage: itemsPerPage });
        }

        function listSightingsOfMac(account, mac, fromDate, toDate, page, itemsPerPage) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.listSightingsOfMac({ accountId: account.id, mac: mac, from: fromDateIso, to: toDateIso, itemsPerPage: itemsPerPage, page: page });
        }

        function countSightingsOfMac(account, mac, fromDate, toDate, itemsPerPage) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.countSightingsOfMac({ accountId: account.id, mac: mac, from: fromDateIso, to: toDateIso, itemsPerPage: itemsPerPage });
        }
    }

})();