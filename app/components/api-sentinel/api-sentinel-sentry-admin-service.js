(function () {
    'use strict';

    angular
        .module('api-sentinel')
        .factory('SentryAdminApiService', SentryAdminApiService);

    SentryAdminApiService.$inject = ['$resource', 'ApiToken', 'SENTINEL_API_HOST_CONSTANTS'];
    function SentryAdminApiService($resource, ApiToken, HOST) {

        var api = $resource(HOST.URL + '/rest/1/sentries', {}, {
            getLatestAssignmentsForAdmin: {method: 'GET', url: HOST.URL + '/rest/1/admin/sentry500s', isArray: true},
            getLatestAssignmentsCountForAdmin: {method: 'GET', url: HOST.URL + '/rest/1/admin/sentry500s/count'},
            getLatestAssignments: {method: 'GET', params: { accountId: '@accountId' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentry500s', isArray: true},
            getLatestAssignmentsCount: {method: 'GET', params: { accountId: '@accountId' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentry500s/count'},
            assignSentries: { method: 'POST', params: { accountId: '@accountId' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentry500s/assign'},
            transferSentries: { method: 'POST', params: { accountId: '@accountId' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/transferSentrys'},
            untransferSentries: { method: 'POST', params: { accountId: '@accountId' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/removesubaccountsenties'},
            backfillSentries: { method: 'POST', params: { accountId: '@accountId' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentry500s/backfill'},
            removeSentries: { method: 'POST', params: { accountId: '@accountId' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentry500s/remove'},
            removeSentry: { method: 'DELETE', params: { accountId: '@accountId', imei: '@imei' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentry500s/:imei'},
            listLatestSentry500SentinelReports: { method: 'GET', params: { accountId: '@accountId' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentry500reports/latest', isArray: true },
            countLatestSentry500SentinelReports: { method: 'GET', params: { accountId: '@accountId' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentry500reports/latest/count' },
            latestSentry500SentinelReportByDevice: { method: 'GET', url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentry500s/:imei/reports/latest' },
            lastSentry500SentinelReportByDevice: { method: 'GET', url: HOST.URL + '/rest/1/admin/sentry500s/:imei/reports/latest' },
            lastSentry500SentinelReport: { method: 'GET', url: HOST.URL + '/rest/1/admin/sentry500s/reports/latest' },
            lastSentry500SentinelReportByAccount: { method: 'GET', url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentry500s/reports/latest' },
            listSentry500SentinelReports: { method: 'GET', params: { accountId: '@accountId' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentry500reports', isArray: true },
            countSentry500SentinelReports: { method: 'GET', params: { accountId: '@accountId' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentry500reports/count' },
            listSentry500SentinelReportsByDevice: { method: 'GET', params: { accountId: '@accountId' }, url: HOST.URL + '/rest/1/admin/sentry500s/:imei/reports/tracking', isArray: true },
            listSentry500ReportsBylist: { method: 'POST', params: { from:"@from",to:"@to" }, url: HOST.URL + '/rest/1/admin/sentry500s/latest/list?from=:from&to=:to', isArray: true },
            countSentry500SentinelReportsByDevice: { method: 'GET', params: { accountId: '@accountId' }, url: HOST.URL + '/rest/1/admin/sentry500s/:imei/reports/tracking/count' },
            getReport: { method: 'GET', params: { accountId: '@accountId', reportId: '@reportId' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentry500reports/:reportId' },
            getConfig: { method: 'GET', params: { accountId: '@accountId', imei: '@imei' }, url: HOST.URL + '/rest/1/admin/sentry/configuration?accountId=:accountId&imei=:imei' },
            putLogRetriever: { method: 'PUT', params: { imei: '@imei', logRetriever: '@logRetriever' }, url: HOST.URL + '/rest/1/admin/sentry500s/:imei?logRetriever=:logRetriever' },
            updateSentry: {method: 'PUT', params: {imei: '@imei',friendlyName:'@friendlyName'}, url: HOST.URL + '/rest/1/admin/sentry500s/:imei/UpdateFriendlyName?friendlyName=:friendlyName'}
        });

        var service = {
            getLatestAssignmentsForAdmin: getLatestAssignmentsForAdmin,
            getLatestAssignmentsCountForAdmin: getLatestAssignmentsCountForAdmin,
            getLatestAssignments: getLatestAssignments,
            getLatestAssignmentsCount: getLatestAssignmentsCount,
            searchLatestAssignmentsForAdmin: searchLatestAssignmentsForAdmin,
            searchLatestAssignments: searchLatestAssignments,
            assignSentries: assignSentries,
            transferSentries: transferSentries,
            untransferSentries: untransferSentries,
            backfillSentries: backfillSentries,
            removeSentries: removeSentries,
            removeSentry: removeSentry,
            listLatestSentry500SentinelReports: listLatestSentry500SentinelReports,
            latestSentry500SentinelReportByDevice: latestSentry500SentinelReportByDevice,
            lastSentry500SentinelReportByDevice:lastSentry500SentinelReportByDevice,
            lastSentry500SentinelReport:lastSentry500SentinelReport,
            lastSentry500SentinelReportByAccount:lastSentry500SentinelReportByAccount,
            countLatestSentry500SentinelReports: countLatestSentry500SentinelReports,
            listSentry500SentinelReports: listSentry500SentinelReports,
            countSentry500SentinelReports: countSentry500SentinelReports,
            listSentry500ReportsBylist: listSentry500ReportsBylist,
            listSentry500SentinelReportsByDevice: listSentry500SentinelReportsByDevice,
            countSentry500SentinelReportsByDevice: countSentry500SentinelReportsByDevice,
            getReport: getReport,
            getConfig: getConfig,
            putLogRetriever: putLogRetriever,
            updateSentry: updateSentry
        };
        return service;

        //////////////////////////////////////////////////////////////////////////////////////////////////////

        function getLatestAssignmentsForAdmin(filter, logRetrieverFilter, page, itemsPerPage) {
            return api.getLatestAssignmentsForAdmin({ filter: filter, logRetrieverFilter: logRetrieverFilter, page: page, itemsPerPage: itemsPerPage});
        }

        function assignSentries(account, imeiList) {
            return api.assignSentries({ accountId: account.id}, { imeiNumbers: imeiList });
        }

        function transferSentries(account, imeiList) {
            return api.transferSentries({ accountId: account.id },{"imeiNumbers":imeiList});
        }

        function untransferSentries(account, imeiList) {
           return api.untransferSentries({ accountId: account.id },{"imeiNumbers":imeiList});
        }

        function removeSentries(accountId, imeiList) {
            return api.removeSentries({ accountId: accountId }, { imeiNumbers: imeiList });
        }

        function updateSentry(imei, friendlyName) {
            return api.updateSentry({ imei: imei, friendlyName: friendlyName});
        }

        function removeSentry(accountId, imei) {
            return api.removeSentry({ accountId: accountId, imei: imei });
        }

        function backfillSentries(account, imeiList, fromDate) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            return api.backfillSentries({ accountId: account.id}, { imeiNumbers: imeiList, timeOfAssignment: fromDateIso });
        }

        function searchLatestAssignmentsForAdmin(pattern) {
            return api.getLatestAssignmentsForAdmin({ search: pattern});
        }

        function searchLatestAssignments(account,pattern) {
            return api.getLatestAssignments({ accountId: account.id,search: pattern});
        }

        function getLatestAssignmentsCountForAdmin(filter, logRetrieverFilter, itemsPerPage) {
            return api.getLatestAssignmentsCountForAdmin({filter: filter, logRetrieverFilter: logRetrieverFilter, itemsPerPage: itemsPerPage});
        }

        function listLatestSentry500SentinelReports(account, page) {
            return api.listLatestSentry500SentinelReports({ accountId: account.id, page: page});
        }

        function latestSentry500SentinelReportByDevice(account, imei) {
            return api.latestSentry500SentinelReportByDevice({ accountId: account.id, imei: imei});
         }

        function lastSentry500SentinelReportByDevice( imei) {
            return api.lastSentry500SentinelReportByDevice({  imei: imei});
        }

        function lastSentry500SentinelReport (account){
            return api.lastSentry500SentinelReport({ accountId: account.id});
        }

        function lastSentry500SentinelReportByAccount (account){
            return api.lastSentry500SentinelReportByAccount({ accountId: account.id});
        }

        function countLatestSentry500SentinelReports(account) {
            return api.countLatestSentry500SentinelReports({ accountId: account.id});
        }

        function listSentry500ReportsBylist(devices,fromDate,toDate){
            return api.listSentry500ReportsBylist({from:fromDate,to:toDate}, {"imeiNumbers":devices});
        }

        function listSentry500SentinelReports(account, fromDate, toDate, page) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.listSentry500SentinelReports({ accountId: account.id, from: fromDateIso, to: toDateIso, page: page});
        }

        function countSentry500SentinelReports(account, fromDate, toDate) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.countSentry500SentinelReports({ accountId: account.id, from: fromDateIso, to: toDateIso});
        }

        function listSentry500SentinelReportsByDevice(account, imei, fromDate, toDate, page, itemsPerPage) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.listSentry500SentinelReportsByDevice({ accountId: account.id, imei: imei, from: fromDateIso, to: toDateIso, page: page, itemsPerPage: itemsPerPage});
        }

       
        function countSentry500SentinelReportsByDevice(account, imei, fromDate, toDate, itemsPerPage) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.countSentry500SentinelReportsByDevice({ accountId: account.id, imei: imei, from: fromDateIso, to: toDateIso, itemsPerPage: itemsPerPage});
        }

        function getReport(account, reportId) {
            return api.getReport({ accountId: account.id, reportId: reportId });
        }

        function getLatestAssignments(account, filter, page) {
            return api.getLatestAssignments({ accountId: account.id, filter: filter, page: page});
        }        

        function getLatestAssignmentsCount(account, filter) {
            return api.getLatestAssignmentsCount({ accountId: account.id, filter: filter});
        }

        function getConfig(account, assignmentAccountId, imei) {
            return api.getConfig({ accountId: assignmentAccountId, imei: imei });
        }

        function putLogRetriever(imei, value) {
            return api.putLogRetriever({ imei: imei, logRetriever: value });
        }
    }

})();