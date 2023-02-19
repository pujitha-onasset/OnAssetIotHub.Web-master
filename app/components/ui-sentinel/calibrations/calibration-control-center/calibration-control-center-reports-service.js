(function () {
    'use strict';

    angular
        .module('ui-sentinel.calibrations.calibrationControlCenter')
        .factory('CalibrationControlCenterReportsService', CalibrationControlCenterReportsService);

    CalibrationControlCenterReportsService.$inject = ['$rootScope', 'SentinelUiSession', 'localStorageService', 'CalibrationService'];
    function CalibrationControlCenterReportsService($rootScope, SentinelUiSession, localStorageService, CalibrationService) {
        var maxPageSize = 5000;
        var maxReportCapacity = 5000;
        var totalCount = 0;
        var localStorageKey = 'CalibrationControlCenterReportsService';

        var service = {
            lastClientGuid: null,
            reports: [],
            selected: null,
            load: load,
            init:init,
            get: get,
            fromDate: moment().subtract(44, 'day').startOf('day'),
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

        function severity(report){

            var now = moment();
            var dueDate = moment(report.nextDueDate);
            
            if(dueDate.isAfter(now))
                return 'ok';

            var duration = moment.duration(now.diff(dueDate));
            var days = duration.asDays();
            if(days<10){
                return 'ok';
            } else if(days >= 10 && days <30){
                return 'info';
            } else 
                return 'warning';
        }

        function init() {
            clear();

            
            $rootScope.loading = true;
            var cachedDateRange = localStorageService.get(localStorageKey);
            if (cachedDateRange) {
                service.fromDate = moment(cachedDateRange.fromDate);
                service.toDate = moment(cachedDateRange.toDate);
            }
            else {
                //set the default dates based on the latest report
                service.toDate = moment(service.fromDate).add(1, 'day').endOf('day');
                service.fromDate = moment(service.toDate).subtract(44, 'day').startOf('day');
            }

            load(service.fromDate, service.toDate);
        
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
            totalCount = 0;

            var cachedDateRange = {
                fromDate: service.fromDate.toISOString(),
                toDate: service.toDate.toISOString()
            };
            localStorageService.set(localStorageKey, cachedDateRange);
            var guid = new Date().getTime();
            var promise = CalibrationService.GetPivotAssetCalibrationList(SentinelUiSession.focus.id,fromDate,toDate).$promise;

            /*SentinelUiSession.user.isAnAdmin ?
                    CalibrationService.getLatestSentry500ReportsByClient(SentinelUiSession.focus, service.fromDate, service.toDate, 1, maxPageSize).$promise:
                    CalibrationService.getLatestSentry500Reports(SentinelUiSession.focus, service.fromDate, service.toDate, 1, maxPageSize).$promise;
					*/
            promise.then(
                function(results) {
                    var items = [];
                    _.forEach(results,function(item){
                        item.guid = guid++;
                        item.severity = severity(item);

                        if(item.latestSentinelStatus){
                           for (var key in item.latestSentinelStatus) {
                                if(key!="latitude" && key!="longitude" )
                                 item[key] = item.latestSentinelStatus[key];
                           }
                        }
                    
                        items.push(item);
                    });
                    console.log("items",items);
                    totalCount = items.length;
                    service.reports = items;
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
                if (report.guid == guid) {
                    result = report;
                    return false;
                }
            });
            return result;
        }
    }

})();