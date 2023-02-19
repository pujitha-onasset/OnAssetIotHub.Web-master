(function() {
    'use strict';

    angular
        .module('ui-sentinel.shipments.shipmentsList')
        .controller('ShipmentsListController', ShipmentsListController);

    ShipmentsListController.$inject = ['$rootScope', '$state', 'SentinelUiSession', 'ShipmentListService', 'ShipmentsListFilterService', 'FeedbackService'];
    function ShipmentsListController($rootScope, $state, SentinelUiSession, ShipmentListService, ShipmentsListFilterService, FeedbackService) {
        var vm = {
            shipments: [],
            showFilter: true,
            filter: ShipmentsListFilterService,
            feedback: FeedbackService,
            dateRanges: [],
            selectedDateRange: null,
            page: 1,
            totalPages: 1,
            totalItems: 0,
            pageArray: null,
            itemsPerPage: 500,
            hasPermission: {
                toChange: false
            },
            selectDateRange: selectDateRange,
            goToShipmentAdmin: goToShipmentAdmin,
            goToShipmentMap: goToShipmentMap,
            goToShipmentReports: goToShipmentReports,
            goToDeviceAdmin: goToDeviceAdmin,
            goToDeviceMap: goToDeviceMap,
            goToDeviceReports: goToDeviceReports,
            propertyName: 'referenceNumber',
            reverse: false,
            sortBy: sortBy,
            next: next,
            previous: previous,
            gotoPage: gotoPage,
        };
        activate();
        return vm;

        function activate() {
            vm.feedback.clear();

            $rootScope.$on('CLIENT_FOCUS_CHANGED', function (event, args) {
                if ($state.current.name == 'shipments.list') {
                    load();
                }
            });

            $rootScope.$on('$stateChangeSuccess', function (event, args) {
                if ($state.current.name === 'shipments.list') {
                    load();
                }
            });

            setPermissions();
            setDateRanges();
            load();
        }

        function goToDeviceAdmin(shipment) {
            if (shipment) {
                $state.go('device.admin',{ deviceTagId: shipment.deviceTagId, referrer: 'shipments.list' });
            }
        }

        function goToDeviceMap(shipment) {
            if (shipment) {
                $state.go('device.map',{ deviceTagId: shipment.deviceTagId, referrer: 'shipments.list'  });
            }
        }

        function goToDeviceReports(shipment) {
            if (shipment) {
                $state.go('device.reports',{ deviceTagId: shipment.deviceTagId, referrer: 'shipments.list'  });
            }
        }

        function goToShipmentAdmin(shipment) {
            if (shipment) {
                $state.go('shipment.admin',{ shipmentId: shipment.shipmentId, referrer: 'shipments.list' });
            }
        }

        function goToShipmentMap(shipment) {
            if (shipment) {
                $state.go('shipment.map',{ shipmentId: shipment.shipmentId, referrer: 'shipments.list'  });
            }
        }

        function goToShipmentReports(shipment) {
            if (shipment) {
                $state.go('shipment.reports',{ shipmentId: shipment.shipmentId, referrer: 'shipments.list'  });
            }
        }

        function load() {
            if (!vm.selectedDateRange) {
                return;
            }
            
            var oneYearAgo = moment().subtract(364, 'days');
            var thirtyDaysAgo = moment().subtract(30, 'day');
            var twoDaysFromNow = moment().add(2, 'day');
           
            console.log("vm.selectedDateRange",vm.selectedDateRange);

            var fromDate = vm.selectedDateRange.fromDate ? vm.selectedDateRange.fromDate : thirtyDaysAgo;
            var toDate = vm.selectedDateRange.toDate ? vm.selectedDateRange.toDate : twoDaysFromNow;
            var fortyFiveDaysAway = moment(fromDate).add(45, 'day');

            console.log("fromDate",fromDate);
            console.log("toDate",toDate);
            console.log("oneYearAgo",oneYearAgo);
            console.log("fortyFiveDaysAway",fortyFiveDaysAway);
            if (!fromDate || !toDate || fromDate.isBefore(oneYearAgo) || toDate.isAfter(fortyFiveDaysAway)) {
                console.log("No load!!!");
                return;
            }

            $rootScope.loading = true;

            var pagePromise = (SentinelUiSession.user.isSystemAdmin &&
            SentinelUiSession.focus.id==SentinelUiSession.user.accountId)? ShipmentListService.GetAllShipmentListItemsByDateRangeCount(SentinelUiSession.focus, fromDate, null, vm.itemsPerPage).$promise:
            ShipmentListService.GetAllShipmentListItemsByDateForClientRangeCount(SentinelUiSession.focus, fromDate, null, vm.itemsPerPage).$promise;
            pagePromise.then(
                function(result) {
                    vm.totalPages = result.pageCount;
                    vm.totalItems = result.itemCount;

                    var pageArray = [];
                    for (var i = 1; i <= vm.totalPages; i++) {
                        pageArray.push(i);
                    }
                    vm.pageArray = pageArray;
                },
                function (error) {
                    console.log(error);
                    vm.errorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericErrorMessage;
                }
            );

            var promise = (SentinelUiSession.user.isAnAdmin &&
             SentinelUiSession.focus.id==SentinelUiSession.user.accountId) ?
            ShipmentListService.GetAllShipmentListItemsByDateRange(SentinelUiSession.focus, fromDate, null,vm.page,vm.itemsPerPage).$promise:
            ShipmentListService.GetAllShipmentListItemsByDateForClientRange(SentinelUiSession.focus, fromDate, null,vm.page,vm.itemsPerPage).$promise;
            promise.then(
                function(result) {
                    vm.shipments = result;
                },
                function (error) {
                    console.log(error);
                    vm.error = error.data.message;
                    vm.feedback.addError(vm.error);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function selectDateRange(dateRange) {
            vm.selectedDateRange = dateRange;
            load();
        }

        function setDateRanges() {
            vm.dateRanges = [];
            var sevenDaysAgo = moment().subtract(7, 'day');
            var startOfMonth = moment().startOf('month');
            var previousEnd = moment(startOfMonth).subtract(1, 'day').endOf('day');
            var previousStart = moment(startOfMonth).subtract(1, 'day').startOf('month').startOf('day');

            if (startOfMonth.isBefore(sevenDaysAgo)) {
                vm.dateRanges.push({
                    label: 'Shipments for ' + startOfMonth.format('MMMM') + ' ' + startOfMonth.format('YYYY'),
                    fromDate: startOfMonth.startOf('day'),
                    toDate: moment().endOf('month')
                });
            } else {
                //not enough days have passed to give current month its own option, so start with prev month
                vm.dateRanges.push({
                    label: 'Shipments since ' + previousStart.format('MMMM') + ' ' + previousStart.format('YYYY'),
                    fromDate: moment(previousStart),
                    toDate: moment().endOf('day')
                });

                previousEnd = moment(previousStart).subtract(1, 'day').endOf('day');
                previousStart = moment(previousStart).subtract(1, 'day').startOf('month').startOf('day');
            }

            for (var i = 0; vm.dateRanges.length < 12; i++) {
                vm.dateRanges.push({
                    label: 'Shipments for ' + previousStart.format('MMMM') + ' ' + previousStart.format('YYYY'),
                    fromDate: moment(previousStart),
                    toDate: moment(previousEnd)
                });

                previousEnd = moment(previousStart).subtract(1, 'day').endOf('day');
                previousStart = moment(previousStart).subtract(1, 'day').startOf('month').startOf('day');
            }

            vm.selectedDateRange = vm.dateRanges[0];
        }

        function setPermissions() {
            vm.hasPermission.toChange =
                SentinelUiSession.user.isSystemAdmin ||
                SentinelUiSession.user.isAccountAdmin ||
                SentinelUiSession.user.isAccountEditor;
        }

        function sortBy(propertyName) {
            vm.reverse = (vm.propertyName === propertyName) ? !vm.reverse : false;
            vm.propertyName = propertyName;
        }

         function next() {
            if (vm.page !== vm.totalPages) {
                gotoPage(vm.page + 1);
            }
        }

        function previous() {
            if (vm.page !== 1) {
                gotoPage(vm.page - 1);
            }
        }

        function gotoPage(page) {
            $rootScope.loading = true;
            if (page < 1 || page > vm.totalPages) {
                return;
            }
            vm.list = null;
            vm.page = page;
            vm.errorMessage = null;

            var fromDate = vm.selectedDateRange.fromDate ;
            var toDate = vm.selectedDateRange.toDate;

            var listPromise = (SentinelUiSession.user.isSystemAdmin &&
            SentinelUiSession.focus.id==SentinelUiSession.user.accountId)? ShipmentListService.GetAllShipmentListItemsByDateRange(SentinelUiSession.focus, fromDate, toDate,vm.page,vm.itemsPerPage).$promise:
            ShipmentListService.GetAllShipmentListItemsByDateForClientRange(SentinelUiSession.focus, fromDate, toDate,vm.page,vm.itemsPerPage).$promise;
           
          
            listPromise.then(
                function(result) {
                    vm.shipments = result;
                },
                function (error) {
                    console.log(error);
                    vm.error = error.data.message;
                    vm.feedback.addError(vm.error);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }
    }
})();

