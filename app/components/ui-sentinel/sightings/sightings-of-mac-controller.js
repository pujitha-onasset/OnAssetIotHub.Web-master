(function() {
    'use strict';

    angular
        .module('ui-sentinel.sightings')
        .controller('SightingsOfMacController', SightingsOfMacController);

    /////////////

    SightingsOfMacController.$inject = ['$rootScope', '$state', 'SentinelUiSession', 'SightingsAdminApiService', 'SightingsAccountApiService'];
    function SightingsOfMacController($rootScope, $state, SentinelUiSession, SightingsAdminApiService, SightingsAccountApiService) {
        var pageViews = [
            {
                name: 'hours',
                title: 'Sightings in last few hours',
                icon: 'fa-hourglass-o'
            },
            {
                name: 'range',
                title: 'Sightings in a date range',
                icon: 'fa-calendar'
            }
        ];
        
        var vm = {
            list: null,
            mac: $state.params.mac,
            page: 1,
            totalPages: 1,
            totalItems: 0,
            pageArray: null,
            itemsPerPage: 500,
            hoursText: 8,
            fromText: typeof $state.params.from !== 'undefined' && $state.params.from !== null? moment($state.params.from).format('YYYY-MM-DDTHH:mm:ss') : moment().subtract(8, 'hours').format('YYYY-MM-DDTHH:mm:ss'),
            toText: typeof $state.params.to !== 'undefined' && $state.params.to !== null ? moment($state.params.to).format('YYYY-MM-DDTHH:mm:ss') : moment().add(1, 'day').format('YYYY-MM-DDTHH:mm:ss'),
            changeView: changeView,
            currentPageView: {
                name: 'range',
                title: 'Sightings in a date range',
                icon: 'fa-calendar'
            },
            pageViews: pageViews,
            load: load,
            next: next,
            previous: previous,
            gotoPage: gotoPage,
            gotoSightingsForReport: gotoSightingsForReport,
            validateDateRange: validateDateRange,
        };

        var genericErrorMessage = "Unexpected error ocurred while getting the sightings by MAC";
        activate();
        return vm;

        function activate() {
            if ($state.params.view) {
                changeView($state.params.view);
            }
            load();
        }

        function changeView(viewName) {
            // if (viewName === 'assign') {
            //     assignCancel();
            // }
            var view = _.find(vm.pageViews, function(v) {
                return v.name === viewName;
            });
            if (view !== undefined) {
                vm.currentPageView = view;
            }
        }

        function load() {
            vm.list = null;
            vm.page = 1;
            vm.errorMessage = null;
            $rootScope.loading = true;

            if (!vm.mac) {
                return;
            }
            var countPromise;
            var listPromise;
            var from;
            var to;
            if (vm.currentPageView.name === 'hours') {
                from = moment().subtract(vm.hoursText, 'hour');
                to = moment();
            }
            else {
                from = moment(vm.fromText);
                to = moment(vm.toText);
            }

            countPromise =
                SightingsAdminApiService.countSightingsOfMac(SentinelUiSession.focus, vm.mac, from, to, vm.itemsPerPage).$promise;
            listPromise = 
                SightingsAdminApiService.listSightingsOfMac(SentinelUiSession.focus, vm.mac, from, to, vm.page, vm.itemsPerPage).$promise;

            countPromise.then(
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

            listPromise.then(
                function(result) {
                    vm.list = result;
                },
                function (error) {
                    console.log(error);
                    vm.errorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericErrorMessage;
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
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
            
            var from = moment(vm.fromText);
            var to = moment(vm.toText);
            var listPromise = 
                SightingsAdminApiService.listSightingsOfMac(SentinelUiSession.focus, vm.mac, from, to, vm.page, vm.itemsPerPage).$promise ;
            listPromise.then(
                function(result) {
                    vm.list = result;
                },
                function (error) {
                    console.log(error);
                    vm.errorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericErrorMessage;
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function gotoSightingsForReport(report) {
            $state.go('sightings.for-report', { reportId: report.sentryStatusId });
        }

        function validateDateRange() {
            vm.errorMessage = null;

            var fromDateMoment = moment(vm.fromText, 'YYYY-MM-DDTHH:mm:ss');
            var toDateMoment = moment(vm.toText, 'YYYY-MM-DDTHH:mm:ss');

            if (toDateMoment.isSame(fromDateMoment) || toDateMoment.isBefore(fromDateMoment)) {
                vm.errorMessage = 'End date must be after ' + fromDateMoment.format('L LT');
                return;
            }
        }


    }

})();