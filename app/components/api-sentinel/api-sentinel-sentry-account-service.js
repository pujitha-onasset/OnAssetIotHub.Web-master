(function () {
    'use strict';

    angular
        .module('api-sentinel')
        .factory('SentryAccountApiService', SentryAccountApiService);

    SentryAccountApiService.$inject = ['$resource', 'SENTINEL_API_HOST_CONSTANTS'];
    function SentryAccountApiService($resource, HOST) {

        var api = $resource(HOST.URL + '/rest/1/sentries', {}, {
            getLatestAssignments: {method: 'GET', url: HOST.URL + '/rest/1/sentry500s', isArray: true},
            getLatestAssignmentsCount: {method: 'GET', url: HOST.URL + '/rest/1/sentry500s/count'},
            listLatestSentry500SentinelReports: { method: 'GET', url: HOST.URL + '/rest/1/sentry500reports/latest', isArray: true },
            countLatestSentry500SentinelReports: { method: 'GET', url: HOST.URL + '/rest/1/sentry500reports/latest/count' },
            transferSentries: { method: 'POST', params: { accountId: '@accountId' }, url: HOST.URL + '/rest/1/account/:accountId/transferSentrys'},
            untransferSentries: { method: 'POST', params: { accountId: '@accountId' }, url: HOST.URL + '/rest/1/account/:accountId/removesubaccountsenties'},
            listSentry500SentinelReports: { method: 'GET', url: HOST.URL + '/rest/1/sentry500reports', isArray: true },
            countSentry500SentinelReports: { method: 'GET', url: HOST.URL + '/rest/1/sentry500reports/count' },
            listSentry500SentinelReportsByDevice: { method: 'GET', url: HOST.URL + '/rest/1/sentry500s/:imei/reports/tracking', isArray: true },
            latestSentry500SentinelReportByDevice: { method: 'GET', url: HOST.URL + '/rest/1/sentry500s/:imei/reports/latest' },
            latestSentry500SentinelReportByAccount: { method: 'GET', url: HOST.URL + '/rest/1/sentry500s/reports/latest' },
            getDevicesForASML: { method: 'GET',params: { imei: '@imei' }, url: HOST.URL + '/rest/1/sentry500s/getSentriesSearch', isArray: true },
            countSentry500SentinelReportsByDevice: { method: 'GET', url: HOST.URL + '/rest/1/sentry500s/:imei/reports/tracking/count' },
            getReport: { method: 'GET', params: { reportId: '@reportId' }, url: HOST.URL + '/rest/1/sentry500reports/:reportId' },
            updateSentry: {method: 'PUT',params: {imei: '@imei',friendlyName:'@friendlyName'}, url: HOST.URL + '/rest/1/sentry500s/:imei/UpdateFriendlyName?friendlyName=:friendlyName'}
        });

        var service = {
            getLatestAssignments: getLatestAssignments,
            getLatestAssignmentsCount: getLatestAssignmentsCount,
            listLatestSentry500SentinelReports: listLatestSentry500SentinelReports,
            countLatestSentry500SentinelReports: countLatestSentry500SentinelReports,
            transferSentries: transferSentries,
            untransferSentries: untransferSentries,
            listSentry500SentinelReports: listSentry500SentinelReports,
            countSentry500SentinelReports: countSentry500SentinelReports,
            listSentry500SentinelReportsByDevice: listSentry500SentinelReportsByDevice,
            latestSentry500SentinelReportByDevice: latestSentry500SentinelReportByDevice,
            latestSentry500SentinelReportByAccount: latestSentry500SentinelReportByAccount,
            getDevicesForASML: getDevicesForASML,
            countSentry500SentinelReportsByDevice: countSentry500SentinelReportsByDevice,
            getReport: getReport,
            updateSentry: updateSentry
        };
        return service;

        //////////////////////////////////////////////////////////////////////////////////////////////////////

        function getLatestAssignments(filter, page) {
            return api.getLatestAssignments({ filter: filter, page: page});
        }

        function getLatestAssignmentsCount(filter) {
            return api.getLatestAssignmentsCount({filter: filter});
        }

        function updateSentry(imei, friendlyName) {
            return api.updateSentry({ imei: imei, friendlyName: friendlyName});
        }

        function listLatestSentry500SentinelReports(page) {
            return api.listLatestSentry500SentinelReports({ page: page});
        }

        function countLatestSentry500SentinelReports() {
            return api.countLatestSentry500SentinelReports();
        }

        function transferSentries(account, imeiList) {
      
            return api.transferSentries({ accountId: account.id},{"imeiNumbers":imeiList});
        }

        function untransferSentries(account, imeiList) {

            return api.untransferSentries({ accountId: account.id},{"imeiNumbers":imeiList});
        }
        
        function listSentry500SentinelReports(fromDate, toDate, page) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.listSentry500SentinelReports({ from: fromDateIso, to: toDateIso, page: page});
        }

        function countSentry500SentinelReports(fromDate, toDate) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.countSentry500SentinelReports({ from: fromDateIso, to: toDateIso});
        }

        function listSentry500SentinelReportsByDevice(imei, fromDate, toDate, page, itemsPerPage) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.listSentry500SentinelReportsByDevice({ imei: imei, from: fromDateIso, to: toDateIso, page: page, itemsPerPage: itemsPerPage});
        }

       

        function latestSentry500SentinelReportByDevice(imei) {
           return api.latestSentry500SentinelReportByDevice({ imei: imei});
        }

        function latestSentry500SentinelReportByAccount(account){
            return api.latestSentry500SentinelReportByAccount({accountId:account.id});
        }

        function getDevicesForASML( account, imei) {
            return api.getDevicesForASML({  accountId: account.id, imei: imei});
        }

        function countSentry500SentinelReportsByDevice(imei, fromDate, toDate, itemsPerPage) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.countSentry500SentinelReportsByDevice({ imei: imei, from: fromDateIso, to: toDateIso, itemsPerPage: itemsPerPage});
        }

        function getReport(reportId) {
            return api.getReport({ reportId: reportId });
        }
    }

})();
