(function () {
    'use strict';

    angular
        .module('tracking.ui.shipment')
        .factory('ShipmentReportsService', ShipmentReportsService);

    ShipmentReportsService.$inject = ['TrackingApiService', 'localStorageService'];
    function ShipmentReportsService(TrackingApiService, localStorageService) {
        var maxPageSize = 500;
        var maxReportCapacity = 500;
        var totalCount = 0;
        var localStorageKey = 'shipmentReportsService';

        var service = {
            shipmentId: null,
            lastShipmentId: null,
            shipment: null,
            lastReport: null,
            reports: [],
            fullReports: [],
            selected: null,
            init: init,
            load: load,
            get: get,
            clear: clear,
            fromDate: moment().subtract(7, 'day').startOf('day'),
            toDate: moment().add(1, 'day').endOf('day'),
            isFull: false
        };
        activate();
        return service;

        function activate() {
        }

        function clear() {
            service.lastShipmentId = null;
            service.shipmentId = null;
            service.shipment = null;
            service.lastReport = null;
            service.selected = null;
            service.reports = [];
            service.isFull = false;
            service.fromDate = moment().subtract(7, 'day').startOf('day');
            service.toDate = moment().add(1, 'day').endOf('day');
        }

        function init(shipmentId) {
            if (!shipmentId || service.shipmentId === shipmentId) {
                return;
            }

            clear();

            service.shipmentId = shipmentId;

            var shipmentPromise = TrackingApiService.getShipment(service.shipmentId).$promise;
            shipmentPromise.then(
                function (shipment) {
                    service.shipment = shipment;
                    service.fromDate = moment(service.shipment.shipmentInfo.startDate).subtract(1, 'day').startOf('day');
                    service.toDate = moment(service.shipment.shipmentInfo.endDate).add(1, 'day').endOf('day');

                    var lastReportPromise = TrackingApiService.getLatestShipmentReport(service.shipmentId).$promise;
                    lastReportPromise.then(
                        function(results) {
                            service.lastReport = results;

                            //in case this is a page reload event, check the local storage for 'cached' dates and use those
                            var cachedDateRange = localStorageService.get(localStorageKey);
                            if (cachedDateRange && cachedDateRange.shipmentId === service.shipmentId) {
                                service.fromDate = moment(cachedDateRange.fromDate);
                                service.toDate = moment(cachedDateRange.toDate);
                            }
                            else {
                                //adjust the toDate based on the last report
                                service.toDate = moment(service.lastReport.messageTimeStamp).add(1, 'day').endOf('day');
                            }

                            load(service.fromDate, service.toDate,true);
                        },
                        function(error) {
                            //todo: handle error
                        }
                    );
                },
                function (error) {
                    //todo: handle error
                }
            );
        }

        function load(fromDate, toDate, refresh) {
            if (!service.shipmentId || !service.lastReport || !fromDate || !toDate) {
                clear();
                return;
            }

            var oneYearAgo = moment().subtract(1, 'year');
            var fromMoment = moment.isMoment(fromDate) ? fromDate : moment(fromDate);
            var toMoment = moment.isMoment(toDate) ? toDate : moment(toDate);
            var maxToMoment = moment(fromMoment).add(95, 'day');

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
                var promise = TrackingApiService.getReports(service.shipmentId, service.fromDate, service.toDate, 1, maxPageSize).$promise;
                promise.then(
                    function(results) {
                        service.fullReports = results;
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
                );

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