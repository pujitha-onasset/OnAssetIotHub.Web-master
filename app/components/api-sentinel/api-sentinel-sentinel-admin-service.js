(function () {
    'use strict';

    angular
        .module('api-sentinel')
        .factory('SentinelAdminApiService', SentinelAdminApiService);

    SentinelAdminApiService.$inject = ['$resource', 'SENTINEL_API_HOST_CONSTANTS'];
    function SentinelAdminApiService($resource, HOST) {

        var api = $resource(HOST.URL + '/rest/1/sentinels', {}, {
            getLatestAssignmentsForAdmin: {method: 'GET', url: HOST.URL + '/rest/1/admin/sentinels', isArray: true},
            getLatestAssignmentsCountForAdmin: {method: 'GET', url: HOST.URL + '/rest/1/admin/sentinels/count'},
            getLatestAssignments: {method: 'GET', params: { accountId: '@accountId' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentinels', isArray: true},
            getLatestAssignmentsCount: {method: 'GET', params: { accountId: '@accountId' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentinels/count'},
            assignSentinels: { method: 'POST', params: { accountId: '@accountId' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentinels/assign'},
            backfillSentinels: { method: 'POST', params: { accountId: '@accountId' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentinels/backfill'},
            removeSentinels: { method: 'POST', params: { accountId: '@accountId' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentinels/remove'},
            removeSentinel: { method: 'DELETE', params: { accountId: '@accountId', imei: '@mac' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentinels/:mac'},
            transferSentinels: { method: 'POST', params: { accountId: '@accountId' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/transferSentinels'},
            untransferSentinels: { method: 'POST', params: { accountId: '@accountId' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/removesubaccountsentinels'},
            updateSentinel: {method: 'PUT', params: {sentinelId: '@sentinelId',friendlyName:'@friendlyName'}, url: HOST.URL + '/rest/1/admin/sentinels/:sentinelId?friendlyName=:friendlyName'},
            lastSentinel500ReportByDevice: { method: 'GET', url: HOST.URL + '/rest/1/admin/sentinels/:sentinelId/sightings/latest' },
            listSentinel500ReportsByDevice: { method: 'GET', params: { accountId: '@accountId' }, url: HOST.URL + '/rest/1/admin/sentinels/:sentinelId/reports/tracking', isArray: true },
            listSentinel500ReportsBylist: { method: 'POST', params: { accountId: '@accountId',from:"@from",to:"@to" }, url: HOST.URL + '/rest/1/admin/sentinelsightings/latest/list?from=:from&to=:to', isArray: true }
        });

        var service = {
            getLatestAssignmentsForAdmin: getLatestAssignmentsForAdmin,
            getLatestAssignmentsCountForAdmin: getLatestAssignmentsCountForAdmin,
            getLatestAssignments: getLatestAssignments,
            getLatestAssignmentsCount: getLatestAssignmentsCount,
            searchLatestAssignmentsForAdmin: searchLatestAssignmentsForAdmin,
            searchLatestAssignments: searchLatestAssignments,
            assignSentinels: assignSentinels,
            backfillSentinels: backfillSentinels,
            removeSentinels: removeSentinels,
            removeSentinel: removeSentinel,
            transferSentinels: transferSentinels,
            untransferSentinels: untransferSentinels,
            updateSentinel: updateSentinel,
            lastSentinel500ReportByDevice:lastSentinel500ReportByDevice,
            listSentinel500ReportsByDevice: listSentinel500ReportsByDevice,
            listSentinel500ReportsBylist:listSentinel500ReportsBylist           
        };
        return service;

        //////////////////////////////////////////////////////////////////////////////////////////////////////

        function getLatestAssignmentsForAdmin(filter, page, itemsPerPage) {
            return api.getLatestAssignmentsForAdmin({ filter: filter, page: page, itemsPerPage: itemsPerPage});
        }

        function assignSentinels(account, macList) {
            return api.assignSentinels({ accountId: account.id}, { macNumbers: macList });
        }

        function removeSentinels(accountId, macList) {
            return api.removeSentinels({ accountId: accountId }, { macNumbers: macList });
        }

        function removeSentinel(accountId, mac) {
            return api.removeSentinel({ accountId: accountId, mac: mac });
        }

        function backfillSentinels(account, macList, fromDate) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            return api.backfillSentinels({ accountId: account.id}, { macNumbers: macList, timeOfAssignment: fromDateIso });
        }

        function searchLatestAssignmentsForAdmin(pattern) {
            return api.getLatestAssignmentsForAdmin({ search: pattern});
        }

        function updateSentinel(sentinelId, friendlyName) {
            return api.updateSentinel({ sentinelId: sentinelId, friendlyName: friendlyName});
        }

        function getLatestAssignmentsCountForAdmin(filter) {
            return api.getLatestAssignmentsCountForAdmin({filter: filter});
        }

        function getLatestAssignments(account, filter, page) {
            return api.getLatestAssignments({ accountId: account.id, filter: filter, page: page});
        }

        function searchLatestAssignments(account, pattern) {
            return api.getLatestAssignments({ accountId: account.id, search: pattern});
        }

        function getLatestAssignmentsCount(account, filter) {
            return api.getLatestAssignmentsCount({accountId: account.id, filter: filter});
        }

        function transferSentinels(account, imeiList) {
            return api.transferSentinels({ accountId: account.id },{"sentinelIdNumbers":imeiList});
        }

        function untransferSentinels(account, imeiList) {
            return api.untransferSentinels({ accountId: account.id },{"sentinelIdNumbers":imeiList});
        }

        function listSentinel500ReportsByDevice(account, sentinelId, fromDate, toDate, page, itemsPerPage) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.listSentinel500ReportsByDevice({ accountId: account.id, sentinelId: sentinelId, from: fromDateIso, to: toDateIso, page: page, itemsPerPage: itemsPerPage});
        }

        function lastSentinel500ReportByDevice( sentinelId) {
            return api.lastSentinel500ReportByDevice({  sentinelId: sentinelId});
        }

        function listSentinel500ReportsBylist( list,fromDate, toDate) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();
            return api.listSentinel500ReportsBylist({  sentinelIdNumbers: list, from: fromDateIso, to: toDateIso,page:1,itemsPerPage:list.length});
        }
    }

})();