(function () {
    'use strict';

    angular
        .module('ui-sentinel.watchlist')
        .controller('WatchlistDataController', WatchlistDataController);

    WatchlistDataController.$inject = ['$rootScope', '$state', 'SentinelUiSession', 'WatchlistsService', 'FeedbackService', 'DatetimeValidatorService', 'SightingsAdminApiService'];
    function WatchlistDataController($rootScope, $state, SentinelUiSession, WatchlistsService, FeedbackService, DatetimeValidatorService, SightingsAdminApiService) {
        var vm = {
            session: SentinelUiSession,
            feedback: FeedbackService,
            list: null,
            page: 1,
            totalPages: 1,
            totalItems: 0,
            pageArray: null,
            itemsPerPage: 500,
            load: load,
            next: next,
            previous: previous,
            gotoPage: gotoPage,
            watchlist: null,
            propertyName: 'sentinelId',
            reverse: false,
            sortBy: sortBy,
        };
        activate();
        return vm;

        function activate() {
            if (typeof $state.params.watchlist !== null) {
                vm.watchlist = $state.params.watchlist;
            }
            vm.feedback.clear();
            load();
        }

        function load() {
            vm.page = 1;
            vm.list = null;
            $rootScope.loading = true;


            var countPromise = WatchlistsService.getWatchlistLogDataCount($state.params.watchlistId, vm.itemsPerPage, null, null).$promise;
            var listPromise = WatchlistsService.getWatchlistLogData($state.params.watchlistId, vm.page, vm.itemsPerPage, null, null).$promise;

            countPromise.then(
                function (result) {
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
                    vm.feedback.addError(error.data.message);
                }
            );

            listPromise.then(
                function (result) {
                    vm.list = result;
                },
                function (error) {
                    console.log(error);
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function () {
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



            var listPromise = WatchlistsService.getWatchlistLogData($state.params.watchlistId, vm.page, vm.itemsPerPage, null, null).$promise;

            listPromise.then(
                function (result) {
                    vm.list = result;
                },
                function (error) {
                    console.log(error);
                    vm.list = [];
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function () {
                $rootScope.loading = false;
            });
        }

        function sortBy(propertyName) {
            vm.reverse = (vm.propertyName === propertyName) ? !vm.reverse : false;
            vm.propertyName = propertyName;
        }
    }

})();