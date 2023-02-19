(function() {
    'use strict';

    angular
        .module('ui-sentinel.sentinel')
        .controller('SentinelAssignmentController', SentinelAssignmentController);

    /////////////

    SentinelAssignmentController.$inject = ['$rootScope', '$state', 'SentinelUiSession', 'SentinelAdminApiService', 'SentinelAccountApiService', 'AnchortagsService'];
    function SentinelAssignmentController($rootScope, $state, SentinelUiSession, SentinelAdminApiService, SentinelAccountApiService, AnchortagsService) {
        var vm = {
            list: null,
            filter: 'all',
            page: 1,
            totalPages: 1,
            totalItems: 0,
            pageArray: null,
            itemsPerPage: 500,
            load: load,
            next: next,
            previous: previous,
            gotoPage: gotoPage,
            goToWatchlist: goToWatchlist,
            updateAnchorTagInProgress: false,
            updateAnchorTagBegin: updateAnchorTagBegin,
            updateAnchorTagCancel: updateAnchorTagCancel,
            updateAnchorTagSubmit: updateAnchorTagSubmit,
            anchorname: {
                isPristine: true,
                hasError: function () {
                    return this.errors.isBlank;
                },
                errors: {
                    isBlank: true,
                },
                validate: validateAnchorName
            },
            description: {
                isPristine: true,
                hasError: function () {
                    return this.errors.isBlank;
                },
                errors: {
                    isBlank: true,
                },
                validate: validateDescription
            },
            latitude: {
                isPristine: true,
                hasError: function () {
                    return this.errors.isBlank || this.errors.isNotNumber;
                },
                errors: {
                    isBlank: true,
                    isNotNumber: true,
                },
                validate: validateLatitude
            },
            longitude: {
                isPristine: true,
                hasError: function () {
                    return this.errors.isBlank || this.errors.isNotNumber;
                },
                errors: {
                    isBlank: true,
                    isNotNumber: true,
                },
                validate: validateLongitude
            },
        };

        var genericErrorMessage = "Unexpected error ocurred while getting the sentinel assignments";
        activate();
        return vm;

        function activate() {
            load();
        }

        function load() {
            $('.modal').modal('hide');
            $rootScope.loading = true;
            vm.page = 1;
            vm.list = null;

            var countPromise = 
                SentinelAdminApiService.getLatestAssignmentsCount(SentinelUiSession.focus, vm.filter).$promise ;
            var listPromise=
                SentinelAdminApiService.getLatestAssignments(SentinelUiSession.focus, vm.filter, vm.page).$promise ;

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
                SentinelAdminApiService.getLatestAssignments(SentinelUiSession.focus, vm.filter, vm.page).$promise;

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

        function goToWatchlist(sentinel) {
            var returnState = $state.current.name;
            var returnStateParams = $state.params;
            $state.go('watchlist.list', { sentinelId: sentinel.sentinelId, referrer: returnState, referrerParams: returnStateParams } );
        }

        function updateAnchorTagBegin(sentinel) {
            if (!sentinel) {
                return;
            }

            vm.updateAnchorTagInProgress = true;
            vm.updateAnchorTagErrorMessage = null;
            vm.anchortag = {
                sentinelId: sentinel.sentinelId,
                mac: sentinel.sentinelId,
            };

            var promise = AnchortagsService.getAnchorTagsBySentinel(sentinel.sentinelId).$promise;

            promise.then(
                function(result) {
                    if (typeof result.sentinelId !== "undefined") {
                        vm.anchortag = result;
                    }
                },
                function (error) {
                    console.log(error);
                    vm.updateAnchorTagErrorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericUpdateAnchorTagErrorMessage;
                }
            ).finally(function(){
                $rootScope.loading = false;
            });


            vm.anchorname.errors.isBlank = false;
            vm.anchorname.isPristine = false;

            vm.description.errors.isBlank = false;
            vm.description.isPristine = false;

            vm.latitude.errors.isBlank = false;
            vm.latitude.errors.isNotNumber = false;
            vm.latitude.isPristine = false;

            vm.longitude.errors.isBlank = false;
            vm.longitude.errors.isNotNumber = false;
            vm.longitude.isPristine = false;
        }

        function updateAnchorTagCancel() {
            vm.updateAnchorTagErrorMessage = null;
            vm.updateAnchorTagInProgress = false;
            vm.anchortag = null;
        }

        function updateAnchorTagSubmit() {
            if(!vm.anchorname || !vm.description || !vm.latitude || !vm.longitude){
                vm.updateAnchorTagErrorMessage = "Please fill all the required fields";
                return;
            }

            validateAnchorName();
            validateDescription();
            validateLatitude();
            validateLongitude();

            if (vm.anchorname.hasError() || vm.description.hasError() || vm.latitude.hasError() || vm.longitude.hasError()) {
                return;
            }

            $rootScope.loading = true;
            vm.updateAnchorTagErrorMessage = null;

            var promise = AnchortagsService.postAnchorTagsBySentinel(vm.anchortag).$promise;

            promise.then(
                function (result) {
                    load();
                },
                function (error) {
                    console.log(error);
                    vm.updateAnchorTagErrorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericUpdateAnchorTagErrorMessage;
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function validateAnchorName() {
            vm.anchorname.errors.isBlank = false;
            vm.anchorname.isPristine = false;

            vm.anchorname.errors.isBlank = typeof vm.anchortag === 'undefined' || typeof vm.anchortag.anchorName === 'undefined' || vm.anchortag.anchorName === null;
            if (vm.anchorname.errors.isBlank) {
                return;
            }
        }

        function validateDescription() {
            vm.description.errors.isBlank = false;
            vm.description.isPristine = false;
        }

        function validateLatitude() {
            vm.latitude.errors.isBlank = false;
            vm.longitude.errors.isNotNumber = false;
            vm.latitude.isPristine = false;

            if (typeof vm.anchortag !== 'undefined' && typeof vm.anchortag.longitude !== 'undefined' && vm.anchortag.longitude !== null && vm.anchortag.longitude !== "") {
                vm.latitude.errors.isBlank = typeof vm.anchortag === 'undefined' || typeof vm.anchortag.latitude === 'undefined' || vm.anchortag.latitude === null;
                if (vm.latitude.errors.isBlank) {
                    return;
                }
            }

            if (typeof vm.anchortag !== 'undefined' && typeof vm.anchortag.latitude !== 'undefined' && vm.anchortag.latitude !== null && vm.anchortag.latitude !== "") {
                var isNumber = isInt(vm.anchortag.latitude) || isFloat(vm.anchortag.latitude);
                vm.latitude.errors.isNotNumber = !isNumber;
                if (vm.latitude.errors.isNotNumber) {
                    return;
                }
            }
        }

        function validateLongitude() {
            vm.longitude.errors.isBlank = false;
            vm.longitude.errors.isNotNumber = false;
            vm.longitude.isPristine = false;

            if (typeof vm.anchortag !== 'undefined' && typeof vm.anchortag.latitude !== 'undefined' && vm.anchortag.latitude !== null && vm.anchortag.latitude !== "") {
                vm.longitude.errors.isBlank = typeof vm.anchortag === 'undefined' || typeof vm.anchortag.longitude === 'undefined' || vm.anchortag.longitude === null;
                if (vm.longitude.errors.isBlank) {
                    return;
                }
            }
            if (typeof vm.anchortag !== 'undefined' && typeof vm.anchortag.longitude !== 'undefined' && vm.anchortag.longitude !== null && vm.anchortag.longitude !== "") {
                var isNumber = isInt(vm.anchortag.longitude) || isFloat(vm.anchortag.longitude);
                vm.longitude.errors.isNotNumber = !isNumber;
                if (vm.longitude.errors.isNotNumber) {
                    return;
                }
            }
        }

        function isInt(n){
            return !isNaN(n);
        }

        function isFloat(n){
            n = parseFloat(n);
            return !isNaN(n);
        }
    }

})();