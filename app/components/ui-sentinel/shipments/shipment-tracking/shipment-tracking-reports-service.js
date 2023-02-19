(function () {
    'use strict';

    angular
        .module('ui-sentinel.shipments.shipmentTracking')
        .factory('ShipmentTrackingReportsService', ShipmentTrackingReportsService);

    ShipmentTrackingReportsService.$inject = ['$rootScope', 'localStorageService', 'ShipmentsService', 'ShipmentsReportService'];
    function ShipmentTrackingReportsService($rootScope, localStorageService, ShipmentsService, ShipmentsReportService) {
        var maxPageSize = 500;
        var maxReportCapacity = 500;
        var totalCount = 0;
        var localStorageKey = 'shipmentTrackingReportsService';


        var service = {
            shipmentId: null,
            lastShipmentId: null,
            shipmentInfo: null,
            reports: [],
            fullReports: [],
            lastReport: null,
            selected: null,
            init: init,
            load: load,
            get: get,
            fromDate: moment().subtract(7, 'day').startOf('day'),
            toDate: moment().add(1, 'day').endOf('day'),
            isFull: false,
            clear: clear
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
            service.lastReport = null;
            service.shipmentId = null;
            service.lastShipmentId = null;
            service.shipmentInfo = null;
            service.isFull = false;
            service.fromDate = moment().subtract(7, 'day').startOf('day');
            service.toDate = moment().add(1, 'day').endOf('day');
        }

        function init(shipmentId) {
            clear();

            if (!shipmentId) {
                return;
            }

            service.shipmentId = shipmentId;

            $rootScope.loading = true;

            var shipmentPromise = ShipmentsService.getShipment(service.shipmentId).$promise;
            shipmentPromise.then(
                function (shipment) {
                    service.shipmentInfo = shipment.shipmentInfo;
                    service.toDate = moment(service.shipmentInfo.endDate);
                    
                    if(service.toDate.isAfter(new Date())) {
                       service.fromDate = moment().add(1, 'day').endOf('day');  
                       service.toDate = moment().add(1, 'day').endOf('day');                        
                    }else{ 
                       service.toDate = service.toDate.add(1, 'day').endOf('day');
                       service.fromDate = moment(service.shipmentInfo.endDate).add(1, 'day').endOf('day');
                    }

                    service.fromDate.subtract(14, 'day').startOf('day');

                    var lastReportPromise = ShipmentsReportService.getLatestShipmentReport(service.shipmentId).$promise;
                    lastReportPromise.then(
                        function(results) {
                            $rootScope.loading = false;
                            service.lastReport = results;

                            //in case this is a page reload event, check the local storage for 'cached' dates and use those
                            /*var cachedDateRange = localStorageService.get(localStorageKey);
                            if (cachedDateRange && cachedDateRange.shipmentId === service.shipmentId) {
                                service.fromDate = moment(cachedDateRange.fromDate);
                                service.toDate = moment(cachedDateRange.toDate);
                            }
                            else {
                                //adjust the toDate based on the last report
                                service.toDate = moment(service.lastReport.messageTimeStamp).add(1, 'day').endOf('day');
                            }*/
                            if(service.lastReport){
                               service.toDate = moment(service.lastReport.messageTimeStamp).add(1, 'day').endOf('day');
                               service.fromDate = moment(service.shipmentInfo.startDate);
                               console.log(service.toDate.diff(service.fromDate));
                               if(service.toDate.diff(service.fromDate) > 14){
                                  service.fromDate = moment(service.lastReport.messageTimeStamp).subtract(14, 'day').startOf('day');
                               }
                            }

                            console.log("fromDate",service.fromDate);
                            console.log("toDate",service.toDate);

                            load(service.fromDate, service.toDate,true);
                        },
                        function(error) {
                            //todo: handle error
                            console.log(error);
                            $rootScope.loading = false;
                        }
                    );
                },
                function (error) {
                    //todo: handle error
                    $rootScope.loading = false;

                    console.log(error);
                }
            );
        }

        function load(fromDate, toDate, refresh) {
            if (!service.shipmentId || !service.lastReport || !fromDate || !toDate) {
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

            if (!refresh && service.lastShipmentId === service.shipmentId &&
                fromMoment.isSame(service.fromDate) && toMoment.isSame(service.toDate)) {
                //do not reload the same data set again
                return;
            }

            service.lastShipmentId = service.shipmentId;
            service.selected = null;
            service.fromDate = fromMoment;
            service.toDate = toMoment;
            totalCount = 0;

            //cache the values in the event a page reload occurs
            var cachedDateRange = {
                shipmentId: service.shipmentId,
                fromDate: service.fromDate.toISOString(),
                toDate: service.toDate.toISOString()
            };
            localStorageService.set(localStorageKey, cachedDateRange);

           
            if(refresh){
                $rootScope.loading = true;
                var promise = ShipmentsReportService.getShipmentReports(service.shipmentId, service.fromDate, service.toDate, 1, maxPageSize).$promise;
                promise.then(
                    function(results) {
                        results = _.orderBy(results, ['messageTimeStamp'], ['desc']);

                        var newList=[];
                        for (var i = 0; i < results.length; i++) {
                            var o = results[i];
                            var exist = newList.find(function(element) {
                              return element.reportGuid == o.reportGuid;
                            });
                            if(!exist){
                                newList.push(o);
                            }else{
                                if(exist.severity=="ok"){
                                    var index=newList.find(function(element) {
                                      return element.reportGuid == o.reportGuid;
                                    });
                                    newList[index]=o;
                                }
                            }
                        }
                        for (var i = newList.length - 1; i >= 0; i--) {
                            var r = newList[i];
                            var activatedAlarms = r.activatedAlarms.map(function (item) {
                                return item.alarmName;
                            });
                            r.activatedAlarms = r.activatedAlarms.filter(function(item, index){
                                return activatedAlarms.indexOf(item.alarmName) >= index;
                            });
                            r.isShockExceeded = (r.shockX!=null&&r.shockY!=null&&r.shockZ!=null);
                            if(r.isShockExceeded){
                                r.shockMagnitude = Math.sqrt(Math.pow(r.shockX, 2)+Math.pow(r.shockY, 2)+Math.pow(r.shockZ, 2)).toFixed(1);
                            }
                            r.isTiltExceeded = (r.tiltX||r.tiltY||r.tiltZ);
                            if(r.isTiltExceeded){
                                r.tiltMagnitude = Math.sqrt(Math.pow(r.tiltX, 2)+Math.pow(r.tiltY, 2)+Math.pow(r.tiltZ, 2)).toFixed(1);
                            }
                        }
                        service.fullReports = newList;
                        let filterList = service.fullReports.filter((r)=>{
                            let time = moment(r.messageTimeStamp);
                            return time.isBetween(service.fromDate, service.toDate);
                        });
                        totalCount = filterList.length;
                        service.reports = filterList;
                        service.isFull = service.reports.length === maxReportCapacity;
                    },
                    function(error) {
                        //todo: handle error
                    }
                ).finally(function(){
                    $rootScope.loading = false;
                });
            }else{
                let filterList = service.fullReports.filter((r)=>{
                    let time = moment(r.messageTimeStamp);
                    return time.isBetween(service.fromDate, service.toDate);
                });
                totalCount = filterList.length;
                service.reports = filterList;
                service.isFull = service.reports.length === maxReportCapacity;   
            }
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