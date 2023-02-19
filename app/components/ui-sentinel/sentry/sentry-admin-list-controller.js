(function() {
    'use strict';

    angular
        .module('ui-sentinel.sentry')
        .controller('SentryAdminController', SentryAdminController);

    /////////////

    SentryAdminController.$inject = ['$rootScope', '$state', 'SentryAdminApiService','SentryAccountApiService','SentinelUiSession', 'AccountApiService'];
    function SentryAdminController($rootScope, $state, SentryAdminApiService,SentryAccountApiService,SentinelUiSession, AccountApiService) {
        var pageViews = [
            {
                name: 'assign',
                title: 'Assign',
                icon: 'fa-plus'
            },
            {
                name: 'list',
                title: 'Availability',
                icon: 'fa-list'
            },
            {
                name: 'search',
                title: 'Search',
                icon: 'fa-binoculars'
            },
        ];
        
        var vm = {
            accounts: null,
            assignAccount: null,
            assignImeiText: null,
            assignIsBackfill: false,
            assignBackfillFrom: null,
            list: null,
            hasPermission: {
                toSetDeviceName: false,
                toRemove: false,
                toSetLogRetriever: false,
                toConfig: false,
                toSeeCommandLogs: false,
            },
            filter: 'all',
            logRetrieverFilter: 'all',
            searchText: null,
            searchResults: null,
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
            search: search,
            load: load,
            assignSubmit: assignSubmit,
            assignCancel: assignCancel,
            removeAssignment: null,
            removeInProgress: false,
            removeBegin: removeBegin,
            removeCancel: removeCancel,
            removeSubmit: removeSubmit,
            friendlyNameSentry: null,
            sentrySelected: null,
            friendlyNameErrorMessage: null,
            logRetrieverBegin: logRetrieverBegin,
            logRetrieverCancel: logRetrieverCancel,
            logRetrieverSubmit: logRetrieverSubmit,
            logRetriever: {
                value: 'no',
                isPristine: true,
                hasError: function () {
                    return this.errors.isBlank;
                },
                errors: {
                    isBlank: true,
                },
            },
            setFriendlyNameBegin: setFriendlyNameBegin,
            setFriendlyNameCancel: setFriendlyNameCancel,
            setFriendlyNameSubmit: setFriendlyNameSubmit,
            getConfig: getConfig,
            next: next,
            previous: previous,
            gotoPage: gotoPage,
            errorMessage: null,
            assignErrorMessage: null,
            removeErrorMessage: null,
            isSystemAdmin: false,
            getCommandQueue: getCommandQueue,
            getCommandLog: getCommandLog,
        };

        var genericErrorMessage = "Unexpected error ocurred in the sentry admin panel";
        var genericAssignErrorMessage = "Unexpected error ocurred while assigning the sentry to an account";
        var genericRemoveErrorMessage = "Unexpected error ocurred while removing the sentry from assignment";
        var genericLogRetrieverErrorMessage = "Unexpected error ocurred while setting a log retriever";
        activate();
        return vm;

        function activate() {
            load();
            loadAccounts();
            setPermissions();
        }

        function changeView(viewName) {
            if (viewName === 'assign') {
                assignCancel();
                $('#assignModal').modal('show'); 
            } else {
                var view = _.find(vm.pageViews, function(v) {
                    return v.name === viewName;
                });
                if (view !== undefined) {
                    vm.currentPageView = view;
                }
            }
        }

        function load() {
            $rootScope.loading = true;
            $('.modal').modal('hide');

            vm.page = 1;
            vm.list = null;
            vm.errorMessage = null;
            vm.assignErrorMessage = null;
            vm.removeErrorMessage = null;
            vm.isSystemAdmin =SentinelUiSession.user.isSystemAdmin;

            var pagePromise = SentryAdminApiService.getLatestAssignmentsCount(SentinelUiSession.focus, vm.filter).$promise;
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

            var listPromise = SentryAdminApiService.getLatestAssignments(SentinelUiSession.focus, vm.filter, vm.page).$promise;
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

        function setPermissions() {
            vm.hasPermission.toSetDeviceName = true;
            vm.hasPermission.toRemove = SentinelUiSession.user.isSystemAdmin;
            vm.hasPermission.toSetLogRetriever = SentinelUiSession.user.isSystemAdmin;
            vm.hasPermission.toConfig =   SentinelUiSession.user.isSystemAdmin ||
                SentinelUiSession.user.isAccountAdmin ||
                SentinelUiSession.user.isAccountEditor;
            vm.hasPermission.toSeeCommandLogs = SentinelUiSession.user.isSystemAdmin;
        }

        function loadAccounts() {
            vm.errorMessage = null;
            var listPromise = AccountApiService.listAccounts().$promise;
            listPromise.then(
                function(result) {
                    vm.accounts = result;
                },
                function (error) {
                    console.log(error);
                    vm.errorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericErrorMessage;
                }
            );
        }

        function search() {
            vm.list = null;
            vm.errorMessage = null;
            $rootScope.loading = true;

            var listPromise = SentryAdminApiService.searchLatestAssignments(SentinelUiSession.focus,vm.searchText).$promise;
            listPromise.then(
                function(result) {
                    vm.list = result;
                    vm.totalPages = 1;
                    vm.totalItems = result.length;
                },
                function (error) {
                    console.log(error);
                    vm.errorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericErrorMessage;
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }
        
        function assignCancel() {
            vm.assignErrorMessage = null;
            vm.assignAccount = null;
            vm.assignImeiText = null;
            vm.assignBackfillFrom = null;
        }
        
        function assignSubmit() {
            if (!vm.assignAccount || !vm.assignImeiText) {
                return;
            }

            $rootScope.loading = true;
            vm.assignErrorMessage = null;
            var imeiList = _.split(vm.assignImeiText, '\n');

            if (vm.assignIsBackfill) {
                var backfillPromise = SentryAdminApiService.backfillSentries(vm.assignAccount, imeiList, vm.assignBackfillFrom).$promise;
                backfillPromise.then(
                    function(result) {
                        load();
                        assignCancel();
                        changeView('list');
                    },
                    function (error) {
                        console.log(error);
                        vm.assignErrorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericAssignErrorMessage;
                    }
                ).finally(function(){
                    $rootScope.loading = false;
                });
                return;
            }

            var assignPromise = SentryAdminApiService.assignSentries(vm.assignAccount, imeiList).$promise;
            assignPromise.then(
                function(result) {
                    load();
                    assignCancel();
                    changeView('list');
                },
                function (error) {
                    console.log(error);
                    vm.assignErrorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericAssignErrorMessage;
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }
        
        function removeBegin(assignment) {
            vm.removeInProgress = true;
            vm.removeAssignment = assignment;
            vm.removeErrorMessage = null;
        }
        
        function removeCancel() {
            vm.removeErrorMessage = null;
            vm.removeInProgress = false;
            vm.removeAssignment = null;
        }
        
        function removeSubmit() {
            if (!vm.removeAssignment || !vm.removeAssignment.latestAssignment ) {
                return;
            }
            $rootScope.loading = true;
            vm.removeErrorMessage = null;

            var promise = SentryAdminApiService.removeSentry(vm.removeAssignment.latestAssignment.accountId, vm.removeAssignment.imei).$promise;
            promise.then(
                function(result) {
                    load();
                    removeCancel();
                },
                function (error) {
                    console.log(error);
                    vm.removeErrorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericRemoveErrorMessage;
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function logRetrieverBegin(sentry) {
            vm.logRetrieverErrorMessage = null;
            vm.logRetrieverInProgress = true;
            vm.logRetrieverSentry = sentry;
            vm.logRetriever.value = typeof sentry.logRetriever !== "undefined" && sentry.logRetriever ? 'yes' : 'no';
            vm.logRetriever.isPristine = false;
            vm.logRetriever.errors.isBlank = false;
        }

        function logRetrieverCancel() {
            vm.logRetrieverErrorMessage = null;
            vm.logRetrieverInProgress = false;
            vm.logRetrieverSentry = null;
        }

        function logRetrieverSubmit() {
            if (!vm.logRetriever || !vm.logRetriever.value) {
                vm.logRetrieverErrorMessage = "Please fill all the required fields";
                vm.logRetriever.errors.isBlank = typeof vm.logRetriever === 'undefined' || vm.logRetriever.value === null;
                return;
            }

            var logRetrieverValue = vm.logRetriever.value === "yes" ? true : false;

            $rootScope.loading = true;
            vm.logRetrieverErrorMessage = null;

            var promise = SentryAdminApiService.putLogRetriever(vm.logRetrieverSentry.imei, logRetrieverValue).$promise;

            promise.then(
                function (result) {
                    //load();
                    vm.logRetrieverSentry.logRetriever = logRetrieverValue;
                    vm.logRetrieverErrorMessage = null;
                    vm.logRetrieverInProgress = false;
                    $("#logRetrieverModal").modal('hide');
                },
                function (error) {
                    console.log(error);
                    vm.logRetrieverErrorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericLogRetrieverErrorMessage;
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function setFriendlyNameBegin(sentry) {
            vm.friendlyNameErrorMessage = null;
            vm.sentrySelected = sentry;
            vm.friendlyNameSentry = angular.copy(sentry);
        }

        function setFriendlyNameCancel() {
            vm.friendlyNameErrorMessage = null;
            vm.friendlyNameSentry = false;
        }

        function setFriendlyNameSubmit() {
            $rootScope.loading = true; 
            var updatePromise= SentinelUiSession.user.isSystemAdmin ?
                SentryAdminApiService.updateSentry(vm.friendlyNameSentry.imei,vm.friendlyNameSentry.friendlyName).$promise :
                SentryAccountApiService.updateSentry(vm.friendlyNameSentry.imei,vm.friendlyNameSentry.friendlyName).$promise;
                updatePromise.then(
                    function(result) {
                        //load();
                        $("#friendlyNameModal").modal('toggle');
                        vm.sentrySelected.friendlyName = vm.friendlyNameSentry.friendlyName;
                        setFriendlyNameCancel();
                    },
                    function (error) {
                        console.log(error);
                        vm.friendlyNameErrorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericRemoveErrorMessage;
                    }
                ).finally(function(){
                    $rootScope.loading = false;
                });
        }

        function getConfig(item) {
            $state.go('sentry-configs.by-device', { assignmentAccountId: item.latestAssignment.accountId, imei: item.imei });
        }

        function getCommandQueue(item) {
            $state.go('sentry-commands.queue', { imei: item.imei });
        }

        function getCommandLog(item) {
            $state.go('sentry-commands.log', { imei: item.imei });
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

            var listPromise = SentryAdminApiService.getLatestAssignments(SentinelUiSession.focus, vm.filter, vm.page).$promise;
          
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