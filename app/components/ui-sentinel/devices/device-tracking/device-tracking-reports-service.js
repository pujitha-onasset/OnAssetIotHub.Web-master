(function () {
    'use strict';

    angular
        .module('ui-sentinel.devices.deviceTracking')
        .factory('DeviceTrackingReportsService', DeviceTrackingReportsService);

    DeviceTrackingReportsService.$inject = ['$rootScope', 'localStorageService', 'SentinelUiSession', 'SentryAdminApiService', 'SentryAccountApiService'];
    function DeviceTrackingReportsService($rootScope, localStorageService, SentinelUiSession, SentryAdminApiService, SentryAccountApiService) {
        var maxPageSize = 5000;
        var maxReportCapacity = 5000;
        var totalCount = 0;
        var localStorageKey = 'deviceTrackingReportsService';

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
            fromDateCache: moment().subtract(7, 'day').startOf('day'),
            toDateCache: moment().add(1, 'day').endOf('day'),
            reportsCache: [],
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
                                    SentryAdminApiService.lastSentry500SentinelReportByDevice(service.deviceTagId).$promise :
                                    SentryAccountApiService.latestSentry500SentinelReportByDevice(service.deviceTagId).$promise;
            
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
                      service.toDate = moment(service.lastReport.timeOfReport).add(1, 'day').endOf('day'); 
                   
                      service.fromDate = moment(service.toDate).subtract(7, 'day').startOf('day');
                    }
                }

                load(service.fromDate, service.toDate);

            },function(){
                $rootScope.loading=false;
            });
           
        }

        function filterCurrentResult(fromMoment, toMoment){
            if(service.reports){
                service.reports = service.reportsCache.filter(function(r){
                    var timeOfReport = moment(r.timeOfReport);
                    if(fromMoment.isSameOrBefore(timeOfReport) && timeOfReport.isSameOrBefore(toMoment))
                        return true;
                    return false;
                });
                service.isFull = service.reports.length >= maxReportCapacity;
            }
        }

        // load() will load reports for the device provided there is a latest report and valid date range
        function load(fromDate, toDate, refresh) {
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

            service.lastDeviceTagId = service.deviceTagId;
            service.selected = null;
            service.fromDate = fromMoment;
            service.toDate = toMoment;
            totalCount = 0;
            
            //cache the values in the event a page reload occurs
            var cachedDateRange = {
                deviceTagId: service.deviceTagId,
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

            if (!$rootScope.loading) {
                $rootScope.loading = true;
            }

            service.isLoading = true;

            

            //var promise = ClientReportsService.getReports(service.deviceTagId, service.fromDate, service.toDate, 1, maxPageSize).$promise;
            var promise = SentinelUiSession.user.isSystemAdmin ?
                                    SentryAdminApiService.listSentry500SentinelReportsByDevice(SentinelUiSession.focus, service.deviceTagId, service.fromDate, service.toDate, 1, maxPageSize).$promise :
                                    SentryAccountApiService.listSentry500SentinelReportsByDevice(service.deviceTagId, service.fromDate, service.toDate, 1, maxPageSize).$promise;
            promise.then(
                function(results) {
                    totalCount = results.length;
                    var guid = new Date().getTime();
                    _.forEach(results,function(r){
                        r.guid = guid++;
                        r.severity = "ok";
                        r.deviceTagId = r.imei;
                        if(!r.deviceName)
                           r.deviceName = r.imei;
                        r.messageTimeStamp = r.timeOfReport;
                        r.temperatureC = r.temperatureValueC;
                        r.temperatureF = r.temperatureValueF;
                        r.dewPointC = r.dewPointC;
                        r.dewPointF = r.dewPointF;
                        r.extSwitch = r.extSwitch;
                        r.temperature1C = r.temperatureProbe1C;
                        r.temperature1F = r.temperatureProbe1F;
                        r.temperature2C = r.temperatureProbe2C;
                        r.temperature2F = r.temperatureProbe2F;
                        if(r.humidity)
                        r.humidity = r.humidity;
                        r.isButtonPushed= r.reportFlags_ButtonPushed;
                        if(r.pressureValue)
                           r.pressure = r.pressureValue;
                        r.batteryPercent = r.battery;
                        r.light = r.lightValue; 
                        r.reportGuid = r.sentryStatusId;
                        r.reportInterval = r.nextReportInterval;
                        r.isShockExceeded = (r.shockX!=null&&r.shockY!=null&&r.shockZ!=null);
                        if(r.isShockExceeded){
                            r.shockMagnitude = Math.sqrt(Math.pow(r.shockX, 2)+Math.pow(r.shockY, 2)+Math.pow(r.shockZ, 2)).toFixed(1);
                        }
                        r.isTiltExceeded = (r.tiltX!=null&&r.tiltY!=null&&r.tiltZ!=null);
                        if(r.isTiltExceeded){
                            r.tiltMagnitude = Math.sqrt(Math.pow(r.tiltX, 2)+Math.pow(r.tiltY, 2)+Math.pow(r.tiltZ, 2)).toFixed(1);
                        }
                    });
                    service.reports = results;
                    service.reportsCache = results.slice();
                    service.isFull = service.reports.length === maxReportCapacity;
                },
                function(error) {
                    //todo: handle error
                }
            ).finally(function(){
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
    }

})();