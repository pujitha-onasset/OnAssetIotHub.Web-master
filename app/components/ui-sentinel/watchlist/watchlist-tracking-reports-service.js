(function () {
    'use strict';

    angular
        .module('ui-sentinel.watchlist')
        .factory('WatchlistTrackingReportsService', WatchlistTrackingReportsService);

    WatchlistTrackingReportsService.$inject = ['$rootScope', 'SentinelUiSession', 'localStorageService', 'WatchlistsService'];
    function WatchlistTrackingReportsService($rootScope, SentinelUiSession, localStorageService, WatchlistsService) {
        var maxPageSize = 5000;
        var maxReportCapacity = 5000;
        var totalCount = 0;
        var localStorageKey = 'watchlistTrackingReportsService';

        var service = {
            lastClientGuid: null,
            reports: [],
            selected: null,
            load: load,
            get: get,
            fromDate: moment().subtract(7, 'day').startOf('day'),
            toDate: moment().add(1, 'day').endOf('day'),
            watchlist:null,
            sentinel:null,
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

        function BatteryPercentageFilter(voltage) {
            var SOC_MIN=0;
            var SOC_MAX=100;
            var V_MIN=21;
            var V_MAX=35;

            voltage = voltage * 10;

            if (voltage == 255) {
                return null;
            }

            if (voltage < V_MIN) {
                return SOC_MIN;
            }

            var percent = SOC_MIN + (voltage - V_MIN) * (SOC_MAX - SOC_MIN) / (V_MAX - V_MIN);

            if (percent > SOC_MAX) {
                return SOC_MAX;
            } else {
                return Math.round(percent * 100) / 100;
            }
        }

        function floorFigure(figure, decimals){
            if (!decimals) decimals = 2;
            var d = Math.pow(10,decimals);
            return (parseInt(figure*d)/d).toFixed(decimals);
        }
        
        function load(watchlist, fromDate, toDate, refresh) {
            if (!watchlist || !fromDate || !toDate) {
                clear();
                return;
            }

            var oneYearAgo = moment().subtract(1, 'year');
            var fromMoment = moment.isMoment(fromDate) ? fromDate : moment(fromDate);
            var toMoment = moment.isMoment(toDate) ? toDate : moment(toDate);
            var maxToMoment = moment(fromMoment).add(240, 'day');

            if (fromMoment.isBefore(oneYearAgo) || toMoment.isBefore(fromMoment) || toMoment.isAfter(maxToMoment)) {
                return;
            }

            if (!refresh && service.lastClientGuid === SentinelUiSession.focus.id &&
                fromMoment.isSame(service.fromDate) && toMoment.isSame(service.toDate)) {
                //do not reload the same data set again
                return;
            }

            $rootScope.loading = true;

            service.lastid = SentinelUiSession.focus.id;
            service.selected = null;
            service.fromDate = fromMoment;
            service.toDate = toMoment;
            service.watchlist = watchlist;
            totalCount = 0;

            var cachedDateRange = {
                fromDate: service.fromDate.toISOString(),
                toDate: service.toDate.toISOString()
            };
            localStorageService.set(localStorageKey, cachedDateRange);
            var promise =  WatchlistsService.getWatchlistLogData(watchlist.id, 1, maxPageSize,service.fromDate, service.toDate).$promise;
            console.log("get data");   
            promise.then(
                function(results) {
                    _.forEach(results,function(item){
                        item.type = "Sentinel";
                        item.severity = "ok";
                        item.locationMethod = "gps";
                        item.messageTimeStamp= item.timeOfReport;
                        item.batteryPercent = BatteryPercentageFilter(item.batteryVoltage);
                    });
                    console.log("watchlists",results);
                    totalCount = results.length;
                    service.reports = results;
                    service.isFull = service.reports.length >= maxReportCapacity;
                },
                function(error) {
                    //todo: handle error
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function get(guid) {
            var result = null;
            _.forEach(service.reports, function (report) {
                if (report.sentinelLogDataId == guid) {
                    result = report;
                    return false;
                }
            });
            return result;
        }
    }

})();