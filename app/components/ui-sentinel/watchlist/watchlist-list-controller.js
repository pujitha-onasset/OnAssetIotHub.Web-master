(function() {
    'use strict';

    angular
        .module('ui-sentinel.watchlist')
        .controller('WatchlistListController', WatchlistListController);

    WatchlistListController.$inject = ['$rootScope', '$state', 'SentinelUiSession', 'WatchlistsService', 'FeedbackService', 'DatetimeValidatorService'];
    function WatchlistListController($rootScope, $state, SentinelUiSession, WatchlistsService, FeedbackService, DatetimeValidatorService) {
        var vm = {
            session: SentinelUiSession,
            feedback: FeedbackService,
            list: null,
            hasPermission: {
                toCreate: false,
                toUpdate: false,
                toDelete: false,
                toComplete: false,
            },
            page: 1,
            totalPages: 1,
            totalItems: 0,
            pageArray: null,
            itemsPerPage: 500,
            load: load,
            next: next,
            previous: previous,
            gotoPage: gotoPage,
            addWatchlistInProgress: false,
            addWatchlistBegin: addWatchlistBegin,
            addWatchlistCancel: addWatchlistCancel,
            addWatchlistSubmit: addWatchlistSubmit,
            deleteInProgress: false,
            deleteBegin: deleteBegin,
            deleteCancel: deleteCancel,
            deleteSubmit: deleteSubmit,
            completeInProgress: false,
            completeBegin: completeBegin,
            completeCancel: completeCancel,
            completeSubmit: completeSubmit,
            updateInProgress: false,
            updateBegin: updateBegin,
            updateCancel: updateCancel,
            updateSubmit: updateSubmit,
            watchlist: {
                sentinelId: $state.params.sentinelId,
                accountId: SentinelUiSession.focus.id,
                startDate: null,
                endDate: null,
            },
            newEndDate: {
                date: moment().add(1, 'day').format('L'),
                time: moment().format('LT'),
                value: moment().add(1, 'day').toDate(),
                isPristine: true,
                hasError: function () {
                    return this.errors.isBlank || this.errors.isNotADate || this.errors.isTimeBlank || this.errors.isNotATime || this.errors.isSameOrBeforeStart;
                },
                errors: {
                    isBlank: true,
                    isBeforeNow: false,
                    isNotADate: false,
                    isNotATime: false,
                    isTimeBlank: false
                },
                validate: validateEndDate
            },
            newStartDate: {
                date: moment().format('L'),
                time: moment().format('LT'),
                value: moment().toDate(),
                isPristine: true,
                hasError: function () {
                    return this.errors.isBlank || this.errors.isNotADate || this.errors.isTimeBlank || this.errors.isNotATime;
                },
                errors: {
                    isBlank: true,
                    isBeforeNow: false,
                    isNotADate: false,
                    isNotATime: false,
                    isTimeBlank: false
                },
                validate: validateStartDate
            },
            endDate: {
                date: moment().add(1, 'day').format('L'),
                time: moment().format('LT'),
                value: moment().add(1, 'day').toDate(),
                isPristine: true,
                hasError: function () {
                    return this.errors.isBlank || this.errors.isNotADate || this.errors.isTimeBlank || this.errors.isNotATime || this.errors.isSameOrBeforeStart;
                },
                errors: {
                    isBlank: true,
                    isBeforeNow: false,
                    isNotADate: false,
                    isNotATime: false,
                    isTimeBlank: false
                },
                validate: validateEndDate
            },
            startDate: {
                date: moment().format('L'),
                time: moment().format('LT'),
                value: moment().toDate(),
                isPristine: true,
                hasError: function () {
                    return this.errors.isBlank || this.errors.isNotADate || this.errors.isTimeBlank || this.errors.isNotATime;
                },
                errors: {
                    isBlank: true,
                    isBeforeNow: false,
                    isNotADate: false,
                    isNotATime: false,
                    isTimeBlank: false
                },
                validate: validateStartDate
            },
            goToViewLog: goToViewLog,
            propertyName: 'sentinelId',
            reverse: false,
            sortBy: sortBy,
        };
        var genericAddWatchlistErrorMessage = "Unexpected error ocurred while adding a watchlist";
        var genericUpdateErrorMessage = "Unexpected error ocurred while updating a watchlist";
        var genericDeleteErrorMessage = "Unexpected error ocurred while deleting a watchlist";
        var genericCompleteErrorMessage = "Unexpected error ocurred while force completing a watchlist";
        activate();
        return vm;

        function activate() {
            vm.feedback.clear();
            $('#newEndDate').datepicker();
            $('#newEndTime').timepicker({ 'timeFormat': DatetimeValidatorService.localTimeFormat()});
            $('#newStartDate').datepicker();
            $('#newStartTime').timepicker({ 'timeFormat': DatetimeValidatorService.localTimeFormat()});

            $('#endDate').datepicker();
            $('#endTime').timepicker({ 'timeFormat': DatetimeValidatorService.localTimeFormat()});
            $('#startDate').datepicker();
            $('#startTime').timepicker({ 'timeFormat': DatetimeValidatorService.localTimeFormat()});
            setPermissions();
            load();
        }

        function load() {
            $('.modal').modal('hide');
            vm.page = 1;
            vm.list = null;
            $rootScope.loading = true;

            var countPromise = WatchlistsService.getWatchlistCount(SentinelUiSession.focus,$state.params.sentinelId, vm.itemsPerPage).$promise;
            var listPromise = WatchlistsService.getWatchlist(SentinelUiSession.focus,$state.params.sentinelId, vm.page, vm.itemsPerPage).$promise;

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
                    vm.feedback.addError(error.data.message);
                }
            );

            listPromise.then(
                function(result) {
                    vm.list = result;
                },
                function (error) {
                    console.log(error);
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function setPermissions() {
            vm.hasPermission.toCreate =
                SentinelUiSession.user.isSystemAdmin ||
                SentinelUiSession.user.isAccountAdmin ||
                SentinelUiSession.user.isAccountEditor ||
                SentinelUiSession.user.role === 'api-login';

            vm.hasPermission.toUpdate =
                SentinelUiSession.user.isSystemAdmin ||
                SentinelUiSession.user.isAccountAdmin ||
                SentinelUiSession.user.isAccountEditor ||
                SentinelUiSession.user.role === 'api-login';

            vm.hasPermission.toDelete =
                SentinelUiSession.user.isSystemAdmin ||
                SentinelUiSession.user.isAccountAdmin ||
                SentinelUiSession.user.isAccountEditor ||
                SentinelUiSession.user.role === 'api-login';

            vm.hasPermission.toComplete =
                SentinelUiSession.user.isSystemAdmin ||
                SentinelUiSession.user.isAccountAdmin ||
                SentinelUiSession.user.isAccountEditor ||
                SentinelUiSession.user.role === 'api-login';
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

            var listPromise = WatchlistsService.getWatchlist(SentinelUiSession.focus,$state.params.sentinelId, vm.page, vm.itemsPerPage).$promise;

            listPromise.then(
                function(result) {
                    vm.list = result;
                },
                function (error) {
                    console.log(error);
                    vm.list = [];
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function addWatchlistBegin() {
            vm.addWatchlistInProgress = true;
            vm.addWatchlistErrorMessage = null;

            vm.newStartDate.date = moment().format('L');
            vm.newStartDate.time = moment().format('LT');
            vm.newStartDate.value = moment().toDate();

            vm.newEndDate.date = moment().add(1, 'day').format('L');
            vm.newEndDate.time = moment().format('LT');
            vm.newEndDate.value = moment().add(1, 'day').toDate();

            vm.newStartDate.errors.isBlank = false;
            vm.newStartDate.errors.isTimeBlank = false;
            vm.newStartDate.errors.isNotADate = false;
            vm.newStartDate.errors.isNotATime = false;
            vm.newStartDate.isPristine = false;

            vm.newEndDate.errors.isBlank = false;
            vm.newEndDate.errors.isTimeBlank = false;
            vm.newEndDate.errors.isNotADate = false;
            vm.newEndDate.errors.isNotATime = false;
            vm.newEndDate.errors.isSameOrBeforeStart = false;
            vm.newEndDate.isPristine = false;
        }

        function addWatchlistCancel() {
            vm.addWatchlistErrorMessage = null;
            vm.addWatchlistInProgress = false;
            vm.addLoginAccounts = null;
        }

        function addWatchlistSubmit() {
            if(!vm.newStartDate || !vm.newEndDate || !vm.newStartDate.date || !vm.newStartDate.time || !vm.newEndDate.date || !vm.newEndDate.time){
                vm.addWatchlistErrorMessage = "Please fill all the required fields";
                return;
            }

            validateNewStartDate();
            validateNewEndDate();

            if (vm.newStartDate.hasError() || vm.newEndDate.hasError()) {
                return;
            }

            vm.watchlist.endDate = moment(vm.newEndDate.value).utc().format();
            vm.watchlist.startDate = moment(vm.newStartDate.value).utc().format();

            $rootScope.loading = true;
            vm.addWatchlistErrorMessage = null;

            var promise = WatchlistsService.postWatchlist($state.params.sentinelId, vm.watchlist).$promise;
            promise.then(
                function (result) {
                    load();
                },
                function (error) {
                    console.log(error);
                    vm.addWatchlistErrorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericAddWatchlistErrorMessage;
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function updateBegin(watchlist) {
            vm.updateInProgress = true;
            vm.watchlist = watchlist;
            vm.newName = null;
            vm.updateErrorMessage = null;

            vm.startDate.errors.isBlank = false;
            vm.startDate.errors.isTimeBlank = false;
            vm.startDate.errors.isNotADate = false;
            vm.startDate.errors.isNotATime = false;
            vm.startDate.isPristine = false;

            vm.endDate.errors.isBlank = false;
            vm.endDate.errors.isTimeBlank = false;
            vm.endDate.errors.isNotADate = false;
            vm.endDate.errors.isNotATime = false;
            vm.endDate.errors.isSameOrBeforeStart = false;
            vm.endDate.isPristine = false;

            var updateStartDate = moment(watchlist.startDate).local();
            vm.startDate.value = updateStartDate.toDate();
            vm.startDate.date = updateStartDate.format('L');
            vm.startDate.time =  updateStartDate.format('LT');

            //var updateStartDate = new Date(watchlist.startDate);
            //vm.startDate.date = updateStartDate.toLocaleDateString([], { year: 'numeric', month: '2-digit', day: '2-digit' });
            //vm.startDate.time = updateStartDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

            var updateEndDate = moment(watchlist.endDate).local();
            vm.endDate.value = updateEndDate.toDate();
            vm.endDate.date = updateEndDate.format('L');
            vm.endDate.time =  updateEndDate.format('LT');

            //var updateEndDate = new Date(watchlist.endDate);
            //vm.endDate.date = updateEndDate.toLocaleDateString([], { year: 'numeric', month: '2-digit', day: 'numeric' });
            //vm.endDate.time = updateEndDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        }

        function updateCancel() {
            vm.updateErrorMessage = null;
            vm.updateInProgress = false;
            //vm.watchlist = null;
            vm.newName = null;
        }

        function updateSubmit() {
            if(!vm.startDate || !vm.endDate || !vm.startDate.date || !vm.startDate.time || !vm.endDate.date || !vm.endDate.time){
                vm.updateErrorMessage = "Please fill all the required fields";
                return;
            }

            validateStartDate();
            validateEndDate();

            if (vm.startDate.hasError() || vm.endDate.hasError()) {
                return;
            }

            vm.watchlist.watchListId = vm.watchlist.id;
            vm.watchlist.endDate = moment(vm.endDate.value).utc().format();
            vm.watchlist.startDate = moment(vm.startDate.value).utc().format();

            $rootScope.loading = true;
            vm.updateErrorMessage = null;

            var promise = WatchlistsService.putWatchlist(vm.watchlist).$promise;

            promise.then(
                function (result) {
                    load();

                },
                function (error) {
                    console.log(error);
                    vm.updateErrorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericUpdateErrorMessage;
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }   

        function deleteBegin(watchlist) {
            vm.deleteInProgress = true;
            vm.watchlist = watchlist;
            vm.deleteErrorMessage = null;
        }

        function deleteCancel() {
            vm.deleteErrorMessage = null;
            vm.deleteInProgress = false;
            //vm.watchlist = null;
        }

        function deleteSubmit() {
            $rootScope.loading = true;
            vm.deleteErrorMessage = null;

            var promise = WatchlistsService.deleteWatchlist(vm.watchlist).$promise;

            promise.then(
                function (result) {
                    load();

                },
                function (error) {
                    console.log(error);
                    vm.deleteErrorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericDeleteErrorMessage;
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function completeBegin(watchlist) {
            vm.completeErrorMessage = null;
            vm.completeInProgress = true;
            vm.watchlist = watchlist;
        }

        function completeCancel() {
            vm.completeErrorMessage = null;
            vm.completeInProgress = false;
        }

        function completeSubmit() {
            $rootScope.loading = true;
            vm.completeErrorMessage = null;

            var promise = WatchlistsService.forceCompleteWatchlist(vm.watchlist).$promise;

            promise.then(
                function (result) {
                    load();

                },
                function (error) {
                    console.log(error);
                    vm.completeErrorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericCompleteErrorMessage;
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function validateNewEndDate() {
            vm.newEndDate.errors.isBlank = false;
            vm.newEndDate.errors.isTimeBlank = false;
            vm.newEndDate.errors.isNotADate = false;
            vm.newEndDate.errors.isNotATime = false;
            vm.newEndDate.errors.isSameOrBeforeStart = false;
            vm.newEndDate.isPristine = false;

            vm.newEndDate.errors.isBlank = typeof vm.newEndDate.date === 'undefined' || vm.newEndDate.date === null;
            if (vm.newEndDate.errors.isBlank) {
                return;
            }

            vm.newEndDate.errors.isTimeBlank = typeof vm.newEndDate.time === 'undefined' || vm.newEndDate.time === null || vm.newEndDate.time.trim() === '';
            if (vm.newEndDate.errors.isTimeBlank) {
                return;
            }

            var newStartDateTimeMoment = DatetimeValidatorService.toMoment(vm.newStartDate.date, vm.newStartDate.time);
            var newEndDateTimeMoment = DatetimeValidatorService.toMoment(vm.newEndDate.date, vm.newEndDate.time);
            if (!newEndDateTimeMoment) {
                vm.newEndDate.errors.isNotADate = DatetimeValidatorService.dateError;
                vm.newEndDate.errors.isNotATime = DatetimeValidatorService.timeError;
                return;
            }

            vm.newEndDate.errors.isSameOrBeforeStart = newEndDateTimeMoment.isSameOrBefore(newStartDateTimeMoment);
            if (vm.newEndDate.errors.isSameOrBeforeStart) {
                return;
            }

            vm.newEndDate.value = newEndDateTimeMoment.toDate();
        }

        function validateNewStartDate() {
            vm.newStartDate.errors.isBlank = false;
            vm.newStartDate.errors.isTimeBlank = false;
            vm.newStartDate.errors.isNotADate = false;
            vm.newStartDate.errors.isNotATime = false;
            vm.newStartDate.isPristine = false;

            vm.newStartDate.errors.isBlank = typeof vm.newStartDate.date === 'undefined' || vm.newStartDate.date === null;
            if (vm.newStartDate.errors.isBlank) {
                return;
            }

            vm.newStartDate.errors.isTimeBlank = typeof vm.newStartDate.time === 'undefined' || vm.newStartDate.time === null || vm.newStartDate.time.trim() === '';
            if (vm.newStartDate.errors.isTimeBlank) {
                return;
            }

            var newStartDateTimeMoment = DatetimeValidatorService.toMoment(vm.newStartDate.date, vm.newStartDate.time);
            if (!newStartDateTimeMoment) {
                vm.newStartDate.errors.isNotADate = DatetimeValidatorService.dateError;
                vm.newStartDate.errors.isNotATime = DatetimeValidatorService.timeError;
                return;
            }

            vm.newStartDate.value = newStartDateTimeMoment.toDate();
        }

        function validateEndDate() {
            vm.endDate.errors.isBlank = false;
            vm.endDate.errors.isTimeBlank = false;
            vm.endDate.errors.isNotADate = false;
            vm.endDate.errors.isNotATime = false;
            vm.endDate.errors.isSameOrBeforeStart = false;
            vm.endDate.isPristine = false;

            vm.endDate.errors.isBlank = typeof vm.endDate.date === 'undefined' || vm.endDate.date === null;
            if (vm.endDate.errors.isBlank) {
                return;
            }

            vm.endDate.errors.isTimeBlank = typeof vm.endDate.time === 'undefined' || vm.endDate.time === null || vm.endDate.time.trim() === '';
            if (vm.endDate.errors.isTimeBlank) {
                return;
            }

            var startDateTimeMoment = DatetimeValidatorService.toMoment(vm.startDate.date, vm.startDate.time);
            var endDateTimeMoment = DatetimeValidatorService.toMoment(vm.endDate.date, vm.endDate.time);
            if (!endDateTimeMoment) {
                vm.endDate.errors.isNotADate = DatetimeValidatorService.dateError;
                vm.endDate.errors.isNotATime = DatetimeValidatorService.timeError;
                return;
            }

            vm.endDate.errors.isSameOrBeforeStart = endDateTimeMoment.isSameOrBefore(startDateTimeMoment);
            if (vm.endDate.errors.isSameOrBeforeStart) {
                return;
            }

            vm.endDate.value = endDateTimeMoment.toDate();
        }

        function validateStartDate() {
            vm.startDate.errors.isBlank = false;
            vm.startDate.errors.isTimeBlank = false;
            vm.startDate.errors.isNotADate = false;
            vm.startDate.errors.isNotATime = false;
            vm.startDate.isPristine = false;

            vm.startDate.errors.isBlank = typeof vm.startDate.date === 'undefined' || vm.startDate.date === null;
            if (vm.startDate.errors.isBlank) {
                return;
            }

            vm.startDate.errors.isTimeBlank = typeof vm.startDate.time === 'undefined' || vm.startDate.time === null || vm.startDate.time.trim() === '';
            if (vm.startDate.errors.isTimeBlank) {
                return;
            }

            var startDateTimeMoment = DatetimeValidatorService.toMoment(vm.startDate.date, vm.startDate.time);
            if (!startDateTimeMoment) {
                vm.startDate.errors.isNotADate = DatetimeValidatorService.dateError;
                vm.startDate.errors.isNotATime = DatetimeValidatorService.timeError;
                return;
            }

            vm.startDate.value = startDateTimeMoment.toDate();
        }

        function goToViewLog(watchlist) {
            var returnState = $state.current.name;
            var returnStateParams = $state.params;
            $state.go('watchlist.data', { watchlistId: watchlist.id, referrer: returnState, referrerParams: returnStateParams, watchlist: watchlist } );
        }

        function sortBy(propertyName) {
            vm.reverse = (vm.propertyName === propertyName) ? !vm.reverse : false;
            vm.propertyName = propertyName;
        }
    }

})();