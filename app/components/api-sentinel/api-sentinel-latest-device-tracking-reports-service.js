(function () {
    'use strict';

    angular
        .module('api-sentinel')
        .factory('LatestDeviceTrackingReportsService', LatestDeviceTrackingReportsService);

    LatestDeviceTrackingReportsService.$inject = ['$rootScope', 'SentinelUiSession', 'localStorageService', 'ClientReportsService'];
    function LatestDeviceTrackingReportsService($rootScope, SentinelUiSession, localStorageService, ClientReportsService) {
        var maxPageSize = 500;
        var maxReportCapacity = 500;
        var totalCount = 0;
        var localStorageKey = 'latestDeviceTrackingReportsService';

        var service = {
            lastClientGuid: null,
            reports: [],
            selected: null,
            load: load,
            get: get,
            fromDate: moment().subtract(7, 'day').startOf('day'),
            toDate: moment().add(1, 'day').endOf('day'),
            isFull: false,
            clear: clear
        };
        activate();
        return service;

        ///////////////////////////////////////////////////

        function activate() {
            //in case this is a page reload event, check the local storage for 'cached' dates and use those
            var cachedDateRange = localStorageService.get(localStorageKey);
            if (cachedDateRange) {
                service.fromDate = moment(cachedDateRange.fromDate);
                service.toDate = moment(cachedDateRange.toDate);
            }

            $rootScope.$on('CLIENT_FOCUS_CHANGED', function (event, args) {
                clear();
            });
        }

        function clear() {
            service.lastClientGuid = null;
            service.selected = null;
            service.reports = [];
            service.isFull = false;
            service.fromDate = moment().subtract(7, 'day').startOf('day');
            service.toDate = moment().add(1, 'day').endOf('day');
        }

        function load(fromDate, toDate, refresh) {
            if (!fromDate || !toDate) {
                clear();
                return;
            }

            var oneYearAgo = moment().subtract(1, 'year');
            var fromMoment = moment.isMoment(fromDate) ? fromDate : moment(fromDate);
            var toMoment = moment.isMoment(toDate) ? toDate : moment(toDate);
            var maxToMoment = moment(fromMoment).add(45, 'day');

            if (fromMoment.isBefore(oneYearAgo) || toMoment.isBefore(fromMoment) || toMoment.isAfter(maxToMoment)) {
                return;
            }

            if (!refresh && service.lastClientGuid === SentinelUiSession.focus.clientGuid &&
                fromMoment.isSame(service.fromDate) && toMoment.isSame(service.toDate)) {
                //do not reload the same data set again
                return;
            }

            service.lastClientGuid = SentinelUiSession.focus.clientGuid;
            service.selected = null;
            service.fromDate = fromMoment;
            service.toDate = toMoment;
            totalCount = 0;

            var cachedDateRange = {
                fromDate: service.fromDate.toISOString(),
                toDate: service.toDate.toISOString()
            };
            localStorageService.set(localStorageKey, cachedDateRange);

            var promise = ClientReportsService.getLatestSentry500Reports(SentinelUiSession.focus, service.fromDate, service.toDate, 1, maxPageSize).$promise;
            promise.then(
                function(results) {
                    totalCount = results.length;
                    service.reports = results;
                    service.isFull = service.reports.length === maxReportCapacity;
                },
                function(error) {
                    //todo: handle error
                }
            );
        }

        function get(reportGuid) {
            var result = null;
            _.forEach(service.reports, function (report) {
                if (report.reportGuid === reportGuid) {
                    result = report;
                    return false;
                }
            });
            return result;
        }
    }

})();