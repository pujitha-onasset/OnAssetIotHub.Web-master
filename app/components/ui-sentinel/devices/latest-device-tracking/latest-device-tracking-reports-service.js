(function () {
    'use strict';

    angular
        .module('ui-sentinel.devices.latestDeviceTracking')
        .factory('LatestDeviceTrackingReportsService', LatestDeviceTrackingReportsService);

    LatestDeviceTrackingReportsService.$inject = ['$rootScope','$q', 'SentinelUiSession', 'localStorageService', 'ClientReportsService','ShipmentsReportService','SentryAdminApiService','SentryAccountApiService'];
    function LatestDeviceTrackingReportsService($rootScope, $q, SentinelUiSession, localStorageService, ClientReportsService, ShipmentsReportService,SentryAdminApiService,SentryAccountApiService) {
        var maxPageSize = 5000;
        var maxReportCapacity = 5000;
        var totalCount = 0;
        var localStorageKey = 'latestDeviceTrackingReportsService';

        var service = {
            lastClientGuid: null,
            reports: [],
            sentinelReports: [],
            sentryReports: [],
            lastReport: null,
            selected: null,
            load: load,
            init: init,
            get: get,
            fromDate: moment().subtract(7, 'day').startOf('day'),
            toDate: moment().add(1, 'day').endOf('day'),
            fromDateCache: moment().subtract(7, 'day').startOf('day'),
            toDateCache: moment().add(1, 'day').endOf('day'),
            reportsCache: [],
            isFull: false,
            clear: clear,
            restartCache: restartCache,
            searchPatter: searchPatter,
            filterData: filterData,
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

        function retryAction(action, numTries) {
            return $q.when()
                .then(action)
                .catch(function (error) {
                    if (numTries <= 0) {
                        throw error;
                    }
                    return retryAction(action, numTries - 1);
                });
        }

        function restartCache(forceUseLastDateRange){
            clear(forceUseLastDateRange);
            if(!forceUseLastDateRange || forceUseLastDateRange !== true)
                localStorageService.remove(localStorageKey);
        }

        function clear(forceUseLastDateRange) {
            if(!forceUseLastDateRange || forceUseLastDateRange !== true){
                service.lastClientGuid = null;
                service.selected = null;
                service.reports = [];
                service.isFull = false;
                service.fromDate = moment().subtract(7, 'day').startOf('day');
                service.toDate = moment().add(1, 'day').endOf('day');
            }
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

        function searchPatter(pattern){
            $rootScope.loading = true;
            var searchDeviceReportsPromise = ShipmentsReportService.searchDeviceReports(SentinelUiSession.focus.id,pattern).$promise;
            
            searchDeviceReportsPromise.then(
                function(results) {
                    var guid = new Date().getTime();
                    console.log("searchPatter results ",items);
                    var items = [];
                    _.forEach(results.sentries,function(item){
                        item.guid = guid++;
                        item.type = "Sentry";
                        item.$temp = true;
                        item.timeOfReceipt = item.serverTimeStamp;
                        item.timeOfReport = item.messageTimeStamp;
                        items.push(item);
                    });
                    _.forEach(results.sentinelStatus, function(sentinel){
                        var sentry = _.find(results.sentries,function(sentry){
                            return sentry.deviceTagId === sentinel.imei;
                        });
                        if(sentry){
                            var s = angular.copy(sentry);
                            s.guid = guid++;
                            s.deviceName = sentinel.sentinelFriendlyName ? sentinel.sentinelFriendlyName : sentinel.sightingId;
                            s.deviceTagId = sentinel.sightingId;
                            s.humidity  = sentinel.humidity;
                            s.beaconType = sentinel.beaconType;
                            s.pressure = sentinel.pressure;
                            s.shockMagnitude = sentinel.shockMagnitude;
                            s.shockX = sentinel.shockX;
                            s.shockY = sentinel.shockY;
                            s.shockZ = sentinel.shockZ;
                            s.tiltX = sentinel.tiltX;
                            s.tiltY = sentinel.tiltY;
                            s.tiltZ = sentinel.tiltZ;
                            s.bleLocation = sentinel.bleLocation;
                            s.timeOfReceipt = sentinel.timeOfReceipt;
                            s.timeOfReport = sentinel.timeOfReport;
                            s.messageTimeStamp = sentinel.timeOfReport;
                            s.serverTimeStamp = sentinel.timeOfReceipt;  
                            s.batteryPercent = BatteryPercentageFilter(sentinel.batteryVoltage);
                            s.light = sentinel.light;
                            s.temperatureC = sentinel.temperature;
                            s.temperatureF = sentinel.temperature ? floorFigure(((sentinel.temperature*(9/5))+32)) : null;
                            s.dewPointC = sentinel.dewPointC;
                            s.dewPointF = sentinel.dewPointF;
                            s.temperatureProbe1C = sentinel.externalTemperature;
                            s.temperatureProbe1F = sentinel.externalTemperature ? floorFigure(((sentinel.externalTemperature*(9/5))+32)) : null;
                            s.temperatureProbe2C = sentinel.externalSensor1;
                            s.temperatureProbe2F = sentinel.externalSensor1 ? floorFigure(((sentinel.externalSensor1*(9/5))+32)) : null;                      
                            s.type = "Sentinel";
                            s.totalSightingsCount = "";
                            s.reportGuid = sentinel.id;
                            s.$temp = true;
                            if(s.sentryFriendlyName)
                                sentry.deviceName = sentinel.sentryFriendlyName;
                            items.push(s);
                        } else {
                            console.log("reportGuid doesn't exist",sentinel.sentryStatusID);
                        }
                    });
                    console.log("searchPatter items ",items);
                    if(items.length>0){
                        _.forEach(items,function(i){
                            totalCount++;
                            service.reports.push(i);
                        });
                         
                    
                    }
                },
                function(error) {
                    //todo: handle error
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function init() {
           clear();

            var promiseLatest = null;
            if(SentinelUiSession.user.isSystemAdmin && SentinelUiSession.user.accountId==SentinelUiSession.focus.id ){
                promiseLatest=SentryAdminApiService.lastSentry500SentinelReport(SentinelUiSession.focus).$promise;
            }else if(SentinelUiSession.user.isSystemAdmin ){
                promiseLatest=SentryAdminApiService.lastSentry500SentinelReportByAccount(SentinelUiSession.focus).$promise;
            }else{
                promiseLatest=SentryAccountApiService.latestSentry500SentinelReportByAccount(SentinelUiSession.focus).$promise;
            }
                                    
                                    
            
           // var promiseLatest = SentryAccountApiService.latestSentry500SentinelReportByDevice(service.deviceTagId).$promise;

            $rootScope.loading = true;
            retryAction(function () { return promiseLatest; }, 3).then(function(results2){
                console.log(results2);
                 if(results2)
                    service.lastReport = results2;
                service.lastid = SentinelUiSession.focus.id;
                service.selected = null;
               
                //in case this is a page reload event, check the local storage for 'cached' dates and use those
                var cachedDateRange = localStorageService.get(localStorageKey);
                if (cachedDateRange && cachedDateRange.deviceTagId === service.deviceTagId) {
                    service.fromDate = moment(cachedDateRange.fromDate);
                    service.toDate = moment(cachedDateRange.toDate);
                }
                else {
                    //set the default dates based on the latest report
                    if(service.lastReport){
                        console.log("get from latest");
                      service.toDate = moment(service.lastReport.timeOfReceipt).add(1, 'day').endOf('day'); 
                   
                      service.fromDate = moment(service.toDate).subtract(7, 'day').startOf('day');
                    }
                }
                totalCount = 0;

                service.fromDateCache = service.fromDate.clone();
                service.toDateCache = service.toDate.clone();

                var guid = new Date().getTime();
                var promise = SentinelUiSession.user.isAnAdmin ?
                        ClientReportsService.getLatestSentry500ReportsByClient(SentinelUiSession.focus, service.fromDate, service.toDate, 1, maxPageSize).$promise:
                        ClientReportsService.getLatestSentry500Reports(SentinelUiSession.focus, service.fromDate, service.toDate, 1, maxPageSize).$promise;

                retryAction(function () { return promise; }, 3).then(
                    function(results) {
                        var items = [];
                        _.forEach(results.sentries,function(item){
                            item.guid = guid++;
                            item.type = "Sentry";
                            item.timeOfReceipt = item.serverTimeStamp;
                            item.timeOfReport = item.messageTimeStamp;
                            item.dewPointC = item.dewPointC;
                            item.dewPointF = item.dewPointF;
                            item.extSwitch = item.extSwitch;

                            item.isShockExceeded = (item.shockX!=null&&item.shockY!=null&&item.shockZ!=null);
                            if(item.isShockExceeded){
                                item.shockMagnitude = Math.sqrt(Math.pow(item.shockX, 2)+Math.pow(item.shockY, 2)+Math.pow(item.shockZ, 2)).toFixed(1);
                            }
                            item.isTiltExceeded = (item.tiltX!=null&&item.tiltY!=null&&item.tiltZ!=null);
                            if(item.isTiltExceeded){
                                item.tiltMagnitude = Math.sqrt(Math.pow(item.tiltX, 2)+Math.pow(item.tiltY, 2)+Math.pow(item.tiltZ, 2)).toFixed(1);
                            }
                            items.push(item);
                        });
                        _.forEach(results.sentinelStatus, function(sentinel){
                            var sentry = _.find(results.sentries,function(sentry){
                                return sentry.deviceTagId === sentinel.imei;
                            });
                            if(sentry){
                                var s = angular.copy(sentry);
                                s.guid = guid++;
                                s.deviceName = sentinel.sentinelFriendlyName ? sentinel.sentinelFriendlyName : sentinel.sightingId;
                                s.deviceTagId = sentinel.sightingId;
                                s.humidity  = sentinel.humidity;
                                s.beaconType = sentinel.beaconType;
                                s.pressure = sentinel.pressure;
                                s.shockMagnitude = sentinel.shockMagnitude;
                                s.shockElapsedTime = sentinel.shockElapsedTime;
                                s.shockX = sentinel.shockX;
                                s.shockY = sentinel.shockY;
                                s.shockZ = sentinel.shockZ;
                                s.tiltX = sentinel.tiltX;
                                s.tiltY = sentinel.tiltY;
                                s.tiltZ = sentinel.tiltZ;
                                s.bleLocation = sentinel.bleLocation;
                                s.timeOfReceipt = sentinel.timeOfReceipt;
                                s.timeOfReport = sentinel.timeOfReport;
                                s.messageTimeStamp = sentinel.timeOfReport;
                                s.serverTimeStamp = sentinel.timeOfReceipt;                           
                                s.batteryPercent = BatteryPercentageFilter(sentinel.batteryVoltage);
                                s.light = sentinel.light;
                                s.temperatureC = sentinel.temperature;
                                s.temperatureF = sentinel.temperature ? floorFigure(((sentinel.temperature*(9/5))+32)) : null;
                                s.dewPointC = sentinel.dewPointC;
                                s.dewPointF = sentinel.dewPointF;
                                s.extSwitch = sentinel.extSwitch;
                                s.temperatureProbe1C = sentinel.externalTemperature;
                                s.temperatureProbe1F = sentinel.externalTemperature ? floorFigure(((sentinel.externalTemperature*(9/5))+32)) : null;
                                s.temperatureProbe2C = sentinel.externalSensor1;
                                s.temperatureProbe2F = sentinel.externalSensor1 ? floorFigure(((sentinel.externalSensor1*(9/5))+32)) : null;
                                s.type = "Sentinel";
                                s.totalSightingsCount = "";
                                s.reportGuid = sentinel.id;
                                if(s.sentryFriendlyName)
                                    sentry.deviceName = sentinel.sentryFriendlyName;
                                if(s.shockMagnitude)
                                   s.isShockExceeded = true;
                                else
                                   s.isShockExceeded = false;
                                items.push(s);
                            } else {
                                console.log("reportGuid doesn't exist",sentinel.sentryStatusID);
                            }
                        });
                        console.log("devices here",items);
                        totalCount = items.length;

                        /*service.sentryReports = filterData("Sentry");
                        service.sentinelReports = filterData("Sentinel");*/

                        service.reports = items;
                        service.reportsCache = items.slice();
                        service.isFull = service.reports.length >= maxReportCapacity;
                    },
                    function(error) {
                        //todo: handle error
                        $rootScope.loading = false;
                    }
                ).finally(function(){
                    $rootScope.loading = false;
                });
            });
        }

        function filterCurrentResult(fromMoment, toMoment){
            if(service.reports){
                service.reports = service.reportsCache.filter(function(r){
                    var timeOfReceipt = moment(r.serverTimeStamp);
                    if(fromMoment.isSameOrBefore(timeOfReceipt) && timeOfReceipt.isSameOrBefore(toMoment))
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

            if (!refresh && service.lastClientGuid === SentinelUiSession.focus.id &&
                fromMoment.isSame(service.fromDate) && toMoment.isSame(service.toDate)) {
                //do not reload the same data set again
                return;
            }

           

            service.lastid = SentinelUiSession.focus.id;
            service.selected = null;
            service.fromDate = fromMoment;
            service.toDate = toMoment;
            totalCount = 0;

            if(service.fromDateCache && service.fromDateCache.isBefore(fromMoment) && 
                service.toDateCache && toMoment.isBefore(service.toDateCache) && service.reportsCache.length>0){
                filterCurrentResult(fromMoment,toMoment);
                return;
            }

            var cachedDateRange = {
                fromDate: service.fromDate.toISOString(),
                toDate: service.toDate.toISOString()
            };
            localStorageService.set(localStorageKey, cachedDateRange);

            $rootScope.loading = true;
            service.fromDateCache = service.fromDate.clone();
            service.toDateCache = service.toDate.clone();


           
            var guid = new Date().getTime();
            var promise = SentinelUiSession.user.isAnAdmin ?
                    ClientReportsService.getLatestSentry500ReportsByClient(SentinelUiSession.focus, service.fromDate, service.toDate, 1, maxPageSize).$promise:
                    ClientReportsService.getLatestSentry500Reports(SentinelUiSession.focus, service.fromDate, service.toDate, 1, maxPageSize).$promise;

            promise.then(
                function(results) {
                    var items = [];
                    _.forEach(results.sentries,function(item){
                        item.guid = guid++;
                        item.type = "Sentry";
                        item.isShockExceeded = (item.shockX!=null&&item.shockY!=null&&item.shockZ!=null);
                        if(item.isShockExceeded){
                            item.shockMagnitude = Math.sqrt(Math.pow(item.shockX, 2)+Math.pow(item.shockY, 2)+Math.pow(item.shockZ, 2)).toFixed(1);
                        }
                        item.isTiltExceeded = (item.tiltX!=null&&item.tiltY!=null&&item.tiltZ!=null);
                        if(item.isTiltExceeded){
                            item.tiltMagnitude = Math.sqrt(Math.pow(item.tiltX, 2)+Math.pow(item.tiltY, 2)+Math.pow(item.tiltZ, 2)).toFixed(1);
                        }
                        items.push(item);
                    });
                    _.forEach(results.sentinelStatus, function(sentinel){
                        var sentry = _.find(results.sentries,function(sentry){
                            return sentry.deviceTagId === sentinel.imei;
                        });
                        if(sentry){
                            var s = angular.copy(sentry);
                            s.guid = guid++;
                            s.deviceName = sentinel.sentinelFriendlyName ? sentinel.sentinelFriendlyName : sentinel.sightingId;
                            s.deviceTagId = sentinel.sightingId;
                            s.humidity  = sentinel.humidity;
                            s.beaconType = sentinel.beaconType;
                            s.pressure = sentinel.pressure;
                            s.shockMagnitude = sentinel.shockMagnitude;
                            s.shockElapsedTime = sentinel.shockElapsedTime;
                            s.shockX = sentinel.shockX;
                            s.shockY = sentinel.shockY;
                            s.shockZ = sentinel.shockZ;
                            s.messageTimeStamp = sentinel.timeOfReport;
                            s.serverTimeStamp = sentinel.timeOfReceipt;
                            s.timeOfReport = sentinel.timeOfReport;
                            s.batteryPercent = BatteryPercentageFilter(sentinel.batteryVoltage);
                            s.light = sentinel.light;
                            s.temperatureC = sentinel.temperature;
                            s.temperatureF = sentinel.temperature ? floorFigure(((sentinel.temperature*(9/5))+32)) : null;
                            s.dewPointC = sentinel.dewPointC;
                            s.dewPointF = sentinel.dewPointF;
                            s.extSwitch = sentinel.extSwitch;
                            s.temperatureProbe1C = sentinel.externalTemperature;
                            s.temperatureProbe1F = sentinel.externalTemperature ? floorFigure(((sentinel.externalTemperature*(9/5))+32)) : null;
                            s.temperatureProbe2C = sentinel.externalSensor1;
                            s.temperatureProbe2F = sentinel.externalSensor1 ? floorFigure(((sentinel.externalSensor1*(9/5))+32)) : null;
                            s.dewPointC = sentinel.dewPointC;
                            s.dewPointF = sentinel.dewPointF;
                            s.type = "Sentinel";
                            s.totalSightingsCount = "";
                            s.reportGuid = sentinel.id;
                            if(s.sentryFriendlyName)
                                sentry.deviceName = sentinel.sentryFriendlyName;
                            if(s.shockMagnitude)
                               s.isShockExceeded = true;
                            else
                               s.isShockExceeded = false;
                            items.push(s);
                        } else {
                            console.log("reportGuid doesn't exist",sentinel.sentryStatusID);
                        }
                    });
                    console.log("devices",items);
                    totalCount = items.length;

                    /*service.sentryReports = filterData("Sentry");
                    service.sentinelReports = filterData("Sentinel");*/

                    service.reports = items;
                    service.reportsCache = items.slice();
                    service.isFull = service.reports.length >= maxReportCapacity;
                },
                function(error) {
                    //todo: handle error
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function filterData(type) {
            var data = [];
            data = _.filter(service.allReports, function(report){
                if(report.type == type){
                    return report;
                }
            });

            return data;
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