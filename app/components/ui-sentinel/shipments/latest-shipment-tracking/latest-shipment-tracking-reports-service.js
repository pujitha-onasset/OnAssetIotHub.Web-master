(function () {
    'use strict';

    angular
        .module('ui-sentinel.shipments.latestShipmentTracking')
        .factory('LatestShipmentTrackingReportsService', LatestShipmentTrackingReportsService);

    LatestShipmentTrackingReportsService.$inject = ['$rootScope', 'SentinelUiSession', 'localStorageService', 'ShipmentsReportService'];
    function LatestShipmentTrackingReportsService($rootScope, SentinelUiSession, localStorageService, ShipmentsReportService) {
        var maxPageSize = 500;
        var maxReportCapacity = 500;
        var totalCount = 0;
        var localStorageKey = 'latestShipmentTrackingReportsService';

        var service = {
            lastClientGuid: null,
            reports: [],
            selected: null,
            load: load,
            get: get,
            fromDate: moment().subtract(7, 'day').startOf('day'),
            toDate: moment().add(1, 'day').endOf('day'),
            fromDateCache: moment().subtract(7, 'day').startOf('day'),
            toDateCache: moment().add(1, 'day').endOf('day'),
            reportsCache: [],
            isFull: false,
            clear: clear,
            restartCache: restartCache
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

         function restartCache(){
            clear();
            localStorageService.remove(localStorageKey);
        }

        function clear() {
            service.lastClientGuid = null;
            service.selected = null;
            service.reports = [];
            service.isFull = false;
            service.fromDate = moment().subtract(7, 'day').startOf('day');
            service.toDate = moment().add(1, 'day').endOf('day');
        }

        function filterCurrentResult(fromMoment, toMoment){
            if(service.reports){
                service.reports = service.reportsCache.filter(function(r){
                    var messageTimeStamp = moment(r.messageTimeStamp);
                    if(fromMoment.isSameOrBefore(messageTimeStamp) &&  messageTimeStamp.isSameOrBefore(toMoment))
                        return true;
                    return false;
                });
                service.isFull = service.reports.length >= maxReportCapacity;
            }
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
                //return;
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

            if(service.fromDateCache && service.fromDateCache.isBefore(fromMoment) && 
                service.toDateCache && toMoment.isBefore(service.toDateCache) && service.reportsCache.length>0){
                filterCurrentResult(fromMoment,toMoment);
                return;
            }

            service.fromDateCache = service.fromDate.clone();
            service.toDateCache = service.toDate.clone();


            $rootScope.loading = true;

            var promise = ShipmentsReportService.getLatestReports(SentinelUiSession.focus, service.fromDate, service.toDate, 1, maxPageSize).$promise;
            promise.then(
                function(results) {
                    totalCount = results.length;
                    for (var i = results.length - 1; i >= 0; i--) {
                        var r = results[i];
                        var activatedAlarms = r.activatedAlarms.map(function (item) {
                            return item.alarmName;
                        });
                        r.activatedAlarms = r.activatedAlarms.filter(function(item, index){
                            return activatedAlarms.indexOf(item.alarmName) >= index;
                        });
                        r.isShockExceeded = (r.shockX||r.shockY||r.shockZ);
                        if(r.isShockExceeded){
                            r.shockMagnitude = Math.sqrt(Math.pow(r.shockX, 2)+Math.pow(r.shockY, 2)+Math.pow(r.shockZ, 2)).toFixed(1);
                        }
                        r.isTiltExceeded = (r.tiltX||r.tiltY||r.tiltZ);
                        if(r.isTiltExceeded){
                            r.tiltMagnitude = Math.sqrt(Math.pow(r.tiltX, 2)+Math.pow(r.tiltY, 2)+Math.pow(r.tiltZ, 2)).toFixed(1);
                        }
                    }
                    results.sort((a, b) => (b.messageTimeStamp > a.messageTimeStamp) ? 1 : -1);
                    service.reports = results;
                    service.reportsCache = results.slice();
                    service.isFull = service.reports.length === maxReportCapacity;
                },
                function(error) {
                    console.log(error);
                    //todo: handle error
                }
            ).finally(function(){
                   $rootScope.loading = false;
            });
        }

        function get(shipmentId) {
            var result = null;
            _.forEach(service.reports, function (report) {
                if (report.shipment.shipmentId === shipmentId) {
                    result = report;
                    return false;
                }
            });
            return result;
        }
    }

})();