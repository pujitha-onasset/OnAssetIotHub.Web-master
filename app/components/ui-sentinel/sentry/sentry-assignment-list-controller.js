(function() {
    'use strict';

    angular
        .module('ui-sentinel.sentry')
        .controller('SentryAssignmentListController', SentryAssignmentListController);

    /////////////

    SentryAssignmentListController.$inject = ['$rootScope', '$state', 'SentinelUiSession', 'SentryAdminApiService', 'SentryAccountApiService'];
    function SentryAssignmentListController($rootScope, $state, SentinelUiSession, SentryAdminApiService, SentryAccountApiService) {
        var pageViews = [
            {
                name: 'list',
                title: 'Availability',
                icon: 'fa-list'
            }
        ];
        
        var vm = {
            list: null,
            filter: 'all',
            page: 1,
            totalPages: 1,
            totalItems: 0,
            pageArray: null,
            itemsPerPage: 500,
            pageViewTitle: '',
            changeView: changeView,
            currentPageView: {
                name: 'list',
                title: 'Availability',
                icon: 'fa-list'
            },
            pageViews: pageViews,
            load: load,
            next: next,
            previous: previous,
            gotoPage: gotoPage
        };

        var genericErrorMessage = "Unexpected error ocurred while getting the sentry assignments";
        activate();
        return vm;

        function activate() {
            load();
        }

        function changeView(viewName) {
            var view = _.find(vm.pageViews, function(v) {
                return v.name === viewName;
            });
            if (view !== undefined) {
                vm.currentPageView = view;
            }
        }

        function load() {
            $rootScope.loading = true;
            vm.page = 1;
            vm.list = null;

            var countPromise =
                SentryAdminApiService.getLatestAssignmentsCount(SentinelUiSession.focus, vm.filter).$promise;
            var listPromise= 
                SentryAdminApiService.getLatestAssignments(SentinelUiSession.focus, vm.filter, vm.page).$promise ;

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

            var listPromise=
                SentryAdminApiService.getLatestAssignments(SentinelUiSession.focus, vm.filter, vm.page).$promise;

            listPromise.then(
                function(result) {
                    vm.list = result;
                },
                function (error) {
                    console.log(error);
                    vm.list = [];
                    vm.errorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericErrorMessage;
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }
    }

})();