(function() {
    'use strict';

    angular
        .module('ui-sentinel.sentinel')
        .controller('SentinelAdminController', SentinelAdminController);

    /////////////

    SentinelAdminController.$inject = ['$rootScope', '$state', 'SentinelAdminApiService','SentinelAccountApiService', 'SentinelUiSession','AccountApiService'];
    function SentinelAdminController($rootScope, $state, SentinelAdminApiService,SentinelAccountApiService,SentinelUiSession, AccountApiService) {
        var pageViews = [
            {
                name: 'assign',
                title: 'Assign',
                icon: 'fa-plus'
            },
            {
                name: 'search',
                title: 'Search',
                icon: 'fa-binoculars'
            }
        ];
        
        var vm = {
            accounts: null,
            assignAccount: null,
            assignMacText: null,
            assignIsBackfill: false,
            assignBackfillFrom: null,
            latestList: null,
            hasPermission: {
                toSetDeviceName: false,
                toRemove: false,
            },
            filter: 'all',
            searchText: null,
            searchResults: null,
            page: 1,
            totalPages: 1,
            totalItems: 0,
            pageArray: null,
            itemsPerPage: 500,
            pageViewTitle: '',
            friendlyNameSentinel: null,
            sentinelSelected: null,
            friendlyNameErrorMessage: null,
            changeView: changeView,
            currentPageView: {
                name: 'search',
                title: 'Search',
                icon: 'fa-binoculars'
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
            goToWatchlist: goToWatchlist,
            showIsAdmin: false,
            setFriendlyNameBegin: setFriendlyNameBegin,
            setFriendlyNameCancel: setFriendlyNameCancel,
            setFriendlyNameSubmit: setFriendlyNameSubmit,
            next: next,
            previous: previous,
            gotoPage: gotoPage,
            errorMessage: null,
            assignErrorMessage: null,
            removeErrorMessage: null,
        };

        var genericErrorMessage = "Unexpected error ocurred in the sentinel admin panel";
        var genericAssignErrorMessage = "Unexpected error ocurred while assigning the sentinel to an account";
        var genericRemoveErrorMessage = "Unexpected error ocurred while removing the sentinel from assignment";
        activate();
        return vm;

        function activate() {
            vm.showIsAdmin = (SentinelUiSession.user && SentinelUiSession.user.isSystemAdmin);
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

        function goToWatchlist(sentinel) {
            console.log("goToWatchlist",sentinel);
            var returnState = $state.current.name;
            var returnStateParams = $state.params;
            $state.go('watchlist.list', { sentinelId: sentinel.mac} );
        }
        

        function load() {
            $rootScope.loading = true;
            $('.modal').modal('hide');
            
            vm.latestList = null;
            vm.page = 1;
            vm.errorMessage = null;
            vm.assignErrorMessage = null;
            vm.removeErrorMessage = null;
            console.log(SentinelUiSession.user);
            console.log(SentinelUiSession.focus.id==SentinelUiSession.user.accountId);

            var pagePromise = 
            SentinelAdminApiService.getLatestAssignmentsCount(SentinelUiSession.focus, vm.filter).$promise;
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

            var listPromise = SentinelAdminApiService.getLatestAssignments(SentinelUiSession.focus, vm.filter, vm.page).$promise ;
            listPromise.then(
                function(result) {
                    vm.latestList = result;
                    for (var i = 0; i <= vm.latestList.length; i++) {
                        if(!vm.latestList[i].latestAssignment){
                            vm.latestList[i].latestAssignment={
                                accountId:"",
                                accountName: vm.latestList[i].accountName,
                                timeOfAssignment: vm.latestList[i].timeOfAssignment,
                                timeOfRemoval: vm.latestList[i].timeOfRemoval
                            }
                        }
                        
                    }
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
            vm.latestList = null;
            vm.errorMessage = null;
            $rootScope.loading = true;

            var listPromise = SentinelAdminApiService.searchLatestAssignments(SentinelUiSession.focus,vm.searchText).$promise;
            listPromise.then(
                function(result) {
                    vm.latestList = result;
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
            vm.assignMacText = null;
            vm.assignBackfillFrom = null;
        }
        
        function assignSubmit() {
            if (!vm.assignAccount || !vm.assignMacText) {
                return;
            }

            $rootScope.loading = true;
            vm.assignErrorMessage = null;
            var macList = _.split(vm.assignMacText, '\n');

            if (vm.assignIsBackfill) {
                var backfillPromise = SentinelAdminApiService.backfillSentinels(vm.assignAccount, macList, vm.assignBackfillFrom).$promise;
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

            var assignPromise = SentinelAdminApiService.assignSentinels(vm.assignAccount, macList).$promise;
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

            var promise = SentinelAdminApiService.removeSentinel(vm.removeAssignment.latestAssignment.accountId, vm.removeAssignment.mac).$promise;
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

        function setFriendlyNameBegin(sentinel) {
            vm.friendlyNameErrorMessage = null;
            vm.sentinelSelected = sentinel;
            vm.friendlyNameSentinel = angular.copy(sentinel);
        }

        function setFriendlyNameCancel() {
            vm.friendlyNameErrorMessage = null;
            vm.friendlyNameSentinel = false;
        }

        function setFriendlyNameSubmit() {
            $rootScope.loading = true; 
            var updatePromise= SentinelUiSession.user.isSystemAdmin ?
                SentinelAdminApiService.updateSentinel(vm.friendlyNameSentinel.mac,vm.friendlyNameSentinel.friendlyName).$promise :
                SentinelAccountApiService.updateSentinel(vm.friendlyNameSentinel.mac,vm.friendlyNameSentinel.friendlyName).$promise;
                updatePromise.then(
                    function(result) {
                        //load();
                        vm.sentinelSelected.friendlyName = vm.friendlyNameSentinel.friendlyName;
                        $("#friendlyNameModal").modal('toggle');
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
            vm.latestList = null;
            vm.page = page;
            vm.errorMessage = null;

            var listPromise = SentinelAdminApiService.getLatestAssignments(SentinelUiSession.focus, vm.filter, vm.page).$promise ;

            listPromise.then(
                function(result) {
                    console.log(result);
                    vm.latestList = result;
                },
                function (error) {
                    console.log(error);
                    vm.errorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericErrorMessage;
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

    }

})();