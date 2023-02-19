(function () {
    'use strict';

    angular
        .module('api-sentinel')
        .factory('SentinelAccountApiService', SentinelAccountApiService);

    SentinelAccountApiService.$inject = ['$resource', 'SENTINEL_API_HOST_CONSTANTS'];
    function SentinelAccountApiService($resource, HOST) {

        var api = $resource(HOST.URL + '/rest/1/sentinels', {}, {
            getLatestAssignments: {method: 'GET', url: HOST.URL + '/rest/1/sentinels', isArray: true},
            getLatestAssignmentsCount: {method: 'GET', url: HOST.URL + '/rest/1/sentinels/count'},
            getSentinelsForASML: { method: 'GET',params: { deviceId: '@mac' }, url: HOST.URL + '/rest/1/sentinels/getSentinelsSearch', isArray: true },
            transferSentinels: { method: 'POST', params: { accountId: '@accountId'}, url: HOST.URL + '/rest/1/account/:accountId/transferSentinels'},
            untransferSentinels: { method: 'POST', params: { accountId: '@accountId' }, url: HOST.URL + '/rest/1/account/:accountId/removesubaccountsentinels'},
            updateSentinel: {method: 'PUT',params: {sentinelId: '@sentinelId',friendlyName:'@friendlyName'}, url: HOST.URL + '/rest/1/sentinels?sentinelId=:sentinelId&friendlyName=:friendlyName'},
            latestSentinel500ReportByDevice: { method: 'GET', url: HOST.URL + '/rest/1/sentinels/:sentinelId/sightings/latest' },
            listSentinel500ReportsByDevice: { method: 'GET', url: HOST.URL + '/rest/1/sentinels/:sentinelId/reports/tracking', isArray: true }
        });

        var service = {
            getLatestAssignments: getLatestAssignments,
            getLatestAssignmentsCount: getLatestAssignmentsCount,
            getSentinelsForASML: getSentinelsForASML,
            transferSentinels: transferSentinels,
            untransferSentinels: untransferSentinels ,
            updateSentinel: updateSentinel,
            latestSentinel500ReportByDevice: latestSentinel500ReportByDevice,
            listSentinel500ReportsByDevice:listSentinel500ReportsByDevice           
        };
        return service;

        //////////////////////////////////////////////////////////////////////////////////////////////////////

        function getLatestAssignments(filter, page) {
            return api.getLatestAssignments({ filter: filter, page: page});
        }

        function getLatestAssignmentsCount(filter) {
            return api.getLatestAssignmentsCount({filter: filter});
        }

         function getSentinelsForASML(account,mac) {
            return api.getSentinelsForASML({  accountId: account.id, deviceId: mac});
        }

        function transferSentinels(account, imeiList) {
            return api.transferSentinels({ accountId: account.id},{"sentinelIdNumbers":imeiList});
        }

        function untransferSentinels(account, imeiList) {
            return api.untransferSentinels({ accountId: account.id},{"sentinelIdNumbers":imeiList});
        }

        function updateSentinel(sentinelId, friendlyName) {
            return api.updateSentinel({ sentinelId: sentinelId, friendlyName: friendlyName});
        }

        function latestSentinel500ReportByDevice(sentinelId) {
           return api.latestSentinel500ReportByDevice({ sentinelId: sentinelId});
        }

        function listSentinel500ReportsByDevice(sentinelId, fromDate, toDate, page, itemsPerPage) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.listSentinel500ReportsByDevice({ sentinelId: sentinelId, from: fromDateIso, to: toDateIso, page: page, itemsPerPage: itemsPerPage});
        }
    }

})();