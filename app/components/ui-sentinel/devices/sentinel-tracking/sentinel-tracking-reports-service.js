(function () {
    'use strict';

    angular
        .module('ui-sentinel.devices.sentinelTracking')
        .factory('SentinelTrackingReportsService', SentinelTrackingReportsService);

    SentinelTrackingReportsService.$inject = ['$rootScope','$filter', 'localStorageService', 'SentinelUiSession', 'SentinelAdminApiService', 'SentinelAccountApiService'];
    function SentinelTrackingReportsService($rootScope,$filter, localStorageService, SentinelUiSession, SentinelAdminApiService, SentinelAccountApiService) {
        var maxPageSize = 5000;
        var maxReportCapacity = 5000;
        var totalCount = 0;
        var localStorageKey = 'sentinelTrackingReportsService';

        var service = {
            deviceTagId: null,
            lastDeviceTagId: null,
            reports: [],
            lastReport: null,
            selected: null,
            init: init,
            load: load,
            get: get,
            fromDate: moment().subtract(7, 'day').startOf('day'),
            toDate: moment().add(1, 'day').endOf('day'),
            isFull: false,
            clear: clear,
            isLoading: false,
        };
        activate();
        return service;

        function activate() {
            $rootScope.$on('CLIENT_FOCUS_CHANGED', function (event, args) {
                clear();
            });
        }
        
        function clear() {
            service.selected = null;
            service.reports = [];
            service.deviceTagId = null;
            service.lastDeviceTagId = null;
            service.isFull = false;
            service.fromDate = moment().subtract(7, 'day').startOf('day');
            service.toDate = moment().add(1, 'day').endOf('day');
            $rootScope.loading=false;
        }

        // init() will set the default date range for a device based on when the latest report occurred, if applicable
        // and will load the initial set of reports accordingly
        function init(deviceTagId) {
            clear();

            if (!deviceTagId) {
                return;
            }

            $rootScope.loading = true;

            service.deviceTagId = deviceTagId;

            var promiseLatest = SentinelUiSession.user.isSystemAdmin ?
                                    SentinelAdminApiService.lastSentinel500ReportByDevice(service.deviceTagId).$promise :
                                    SentinelAccountApiService.latestSentinel500ReportByDevice(service.deviceTagId).$promise;
            
           // var promiseLatest = SentryAccountApiService.latestSentry500SentinelReportByDevice(service.deviceTagId).$promise;


            promiseLatest.then(function(results2){
                console.log(results2);
                 if(results2)
                    service.lastReport = results2;

                //in case this is a page reload event, check the local storage for 'cached' dates and use those
                var cachedDateRange = localStorageService.get(localStorageKey);
                if (cachedDateRange && cachedDateRange.deviceTagId === service.deviceTagId) {
                    service.fromDate = moment(cachedDateRange.fromDate);
                    service.toDate = moment(cachedDateRange.toDate);
                }
                else {
                    //set the default dates based on the latest report
                    if(service.lastReport){
                      service.toDate = moment(service.lastReport.timeOfReceipt).add(1, 'day').endOf('day'); 
                   
                      service.fromDate = moment(service.toDate).subtract(7, 'day').startOf('day');
                    }
                }
                var promise = SentinelUiSession.user.isSystemAdmin ?
                                    SentinelAdminApiService.listSentinel500ReportsByDevice(SentinelUiSession.focus, service.deviceTagId, service.fromDate, service.toDate, 1, maxPageSize).$promise :
                                    SentinelAccountApiService.listSentinel500ReportsByDevice(service.deviceTagId, service.fromDate, service.toDate, 1, maxPageSize).$promise;
                promise.then(
                    function(results) {
                        //now that we know there is at least one report, set the default date range and load reports
                       
                        load(service.fromDate, service.toDate , results);
                    },
                    function(error) {
                        $rootScope.loading=false;
                    }
                );
            },function(){
                $rootScope.loading=false;
            });
           
        }

        // load() will load reports for the device provided there is a latest report and valid date range
        function load(fromDate, toDate, results, refresh) {
            if (!service.deviceTagId || !service.lastReport || !fromDate || !toDate) {
                clear();
                return;
            }

            var oneYearAgo = moment().subtract(364, 'days');
            var fromMoment = moment.isMoment(fromDate) ? fromDate : moment(fromDate);
            var toMoment = moment.isMoment(toDate) ? toDate : moment(toDate);
            var maxToMoment = moment(fromMoment).add(45, 'day');

            if (fromMoment.isBefore(oneYearAgo) || toMoment.isBefore(fromMoment) || toMoment.isAfter(maxToMoment)) {
                return;
            }

            if (!refresh && service.lastDeviceTagId === service.deviceTagId &&
                fromMoment.isSame(service.fromDate) && toMoment.isSame(service.toDate)) {
                //do not reload the same data set again
                return;
            }

            if (!$rootScope.loading) {
                $rootScope.loading = true;
            }

            service.isLoading = true;

            service.lastDeviceTagId = service.deviceTagId;
            service.selected = null;
            service.fromDate = fromMoment;
            service.toDate = toMoment;
           // totalCount = results.length;

            //cache the values in the event a page reload occurs
            var cachedDateRange = {
                deviceTagId: service.deviceTagId,
                fromDate: service.fromDate.toISOString(),
                toDate: service.toDate.toISOString()
            };
            localStorageService.set(localStorageKey, cachedDateRange);

             var promise = SentinelUiSession.user.isSystemAdmin ?
                                     SentinelAdminApiService.listSentinel500ReportsByDevice(SentinelUiSession.focus, service.deviceTagId, service.fromDate, service.toDate, 1, maxPageSize).$promise :
                                     SentinelAccountApiService.listSentinel500ReportsByDevice(service.deviceTagId, service.fromDate, service.toDate, 1, maxPageSize).$promise;
             promise.then(
                 function(results) {
                     totalCount = results.length;
                    var guid = new Date().getTime();
                    _.forEach(results,function(r){
                        r.guid = guid++;
                        r.severity = "ok";
                        r.deviceTagId = r.sightingId;
                        if(!r.deviceName)
                           r.deviceName = r.sightingId;
                        r.messageTimeStamp = r.timeOfReport;
                        r.temperatureC = r.temperatureValueC;
                        r.temperatureF = r.temperatureValueF;
                        r.dewPointC = r.dewPointC;
                        r.dewPointF = r.dewPointF
                        r.temperatureProbeC = r.externalTemperatureC;
                        r.temperatureProbeF = r.externalTemperatureF;
                        r.temperatureProbe2C = r.externalTemperatureC_2;
                        r.temperatureProbe2F = r.externalTemperatureF_2;
                        r.pressure = r.pressureValue;
                        r.messageRefNumber=r.sequenceNumber;
                        r.batteryPercent = $filter('batteryPercentage')(r.batteryVoltage);
                        r.light = r.lightValue; 
                        r.reportGuid = r.sentinelStatusId;
                    });
                    service.reports = results;
                    service.isFull = service.reports.length === maxReportCapacity;
                },
                function(error) {
                    //todo: handle error
                }).finally(function(){
                $rootScope.loading = false;
                service.isLoading = false;
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

        function floorFigure(figure, decimals){
            if (!decimals) decimals = 2;
            var d = Math.pow(10,decimals);
            return (parseInt(figure*d)/d).toFixed(decimals);
        }
    }

})();