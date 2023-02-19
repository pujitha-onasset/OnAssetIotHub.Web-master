(function() {
    'use strict';

    angular
        .module('ui-sentinel.accounts')
        .controller('AccountsListController', AccountsListController);

    /////////////

    AccountsListController.$inject = ['$rootScope', '$state', 'AccountApiService', 'SentinelUiSession','SentryAdminApiService','SentryAccountApiService','SentinelAccountApiService','SentinelAdminApiService'];
    function AccountsListController($rootScope, $state, AccountApiService, SentinelUiSession, SentryAdminApiService, SentryAccountApiService, SentinelAccountApiService,SentinelAdminApiService) {
        var vm = {
            list: null,
            account: null,
            newName: null,
            newSubAccountName: null,
            parentAccountTransfer: null,
            subaccounts: null,
            transferSentriesImeiText: null,
            transferSentinelsMacText: null,
            transferMode: null,
            transferTitle: null,
            page: 1,
            roles: ["Gateway","Warehouse","Calibration"],
            countOfItems: 0,
            countOfPages: 1,
            itemsPerPage: 500,
            activateInProgress: false,
            rolesAccessAccount: null,
            setFocus: setFocus,
            activateBegin: activateBegin,
            activateCancel: activateCancel,
            activateSubmit: activateSubmit,
            activeAccount:activeAccount,
            suspendAccount: suspendAccount,
            rolesAccessBegin: rolesAccessBegin,
            rolesAccessCancel: rolesAccessCancel,
            rolesAccessSubmit: rolesAccessSubmit,
            filterRoles:filterRoles,
            transferSentriesBegin: transferSentriesBegin,
            untransferSentriesBegin: untransferSentriesBegin,
            transferSentriesCancel: transferSentriesCancel,
            transferSentriesSubmit: transferSentriesSubmit,
            transferSentinelsBegin: transferSentinelsBegin,
            untransferSentinelsBegin: untransferSentinelsBegin,
            transferSentinelsCancel: transferSentinelsCancel,
            transferSentinelsSubmit: transferSentinelsSubmit,
            addAccountInProgress: false,
            addAccountBegin: addAccountBegin,
            addAccountCancel: addAccountCancel,
            addAccountSubmit: addAccountSubmit,
            suspendInProgress: false,
            suspendBegin: suspendBegin,
            suspendCancel: suspendCancel,
            suspendSubmit: suspendSubmit,
            changeNameInProgress: false,
            changeNameBegin: changeNameBegin,
            changeNameCancel: changeNameCancel,
            changeNameSubmit: changeNameSubmit,
            canCreateAccount: canCreateAccount,
            canCreateSubAccount: canCreateSubAccount,
            canSuspendAccount: canSuspendAccount,
            errorMessage: null,
            activateErrorMessage: null,
            rolesAccessErrorMessage: null,
            addAccountErrorMessage: null,
            changeNameErrorMessage: null,
            transferSentriesErrorMessage: null,
            transferSentinelsErrorMessage: null,
            suspendErrorMessage: null,
            addSubAccountInProgress: false,
            addSubAccountBegin: addSubAccountBegin,
            addSubAccountCancel: addSubAccountCancel,
            addSubAccountSubmit: addSubAccountSubmit,
            treeifyAccountList: treeifyAccountList,
            deleteBegin: deleteBegin,
            deleteCancel: deleteCancel,
            deleteSubmit: deleteSubmit,
            isSystemAdmin: isSystemAdmin,
            propertyName: 'name',
            reverse: false,
            sortBy: sortBy,
        };

        var genericErrorMessage = "Unexpected error ocurred while getting the logins records";
        var genericErrorTransferMessage = "Unexpected error ocurred while Transfer devices records";
        var genericAddAccountErrorMessage = "Unexpected error ocurred while adding an account";
        var genericActivateErrorMessage = "Unexpected error ocurred while activating an account";
        var genericSuspendErrorMessage = "Unexpected error ocurred while suspending an account";
        var genericChangeNameErrorMessage = "Unexpected error ocurred while changing the name";
        var genericAddSubAccountErrorMessage = "Unexpected error ocurred while adding a subaccount";
        var genericDeleteErrorMessage = "Unexpected error ocurred while deleting a subaccount";

        activate();
        return vm;

        function activate() {
            load();
        }

        function load() {
            $rootScope.loading = true;
            $('.modal').modal('hide');
            vm.list = null;
            vm.errorMessage = null;
            vm.activateErrorMessage = null;
            vm.addAccountErrorMessage = null;
            vm.changeNameErrorMessage = null;
            vm.suspendErrorMessage = null;
            var promise = AccountApiService.listAccounts().$promise;
            promise.then(
                function(result) {
                    vm.list = treeifyAccountList(result);
                    console.log("List of accounts",vm.list);
                    suspendCancel();
                    changeNameCancel();
                    activateCancel();
                    addAccountCancel();
                },
                function (error) {
                    console.log(error);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function activateBegin(account) {
            vm.activateInProgress = true;
            vm.account = account;
            vm.activateErrorMessage = null;
        }

        function activateCancel() {
            vm.activateErrorMessage = null;
            vm.activateInProgress = false;
            vm.account = null;
        }

        function activateSubmit() {
            $rootScope.loading = true;
            var promise = AccountApiService.activateAccount(vm.account).$promise;
            promise.then(
                function (result) {
                    load();

                },
                function (error) {
                    console.log(error);
                    vm.activateErrorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericActivateErrorMessage;
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function activeAccount() {
            $rootScope.loading = true;
            var promise = AccountApiService.activateAccount(vm.account).$promise;
            promise.then(
                function (result) {
                    vm.account.status = 'active';
                },
                function (error) {
                    console.log(error);
                    vm.activateErrorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericActivateErrorMessage;
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function rolesAccessBegin(account) {
            vm.account = account;
            vm.rolesAccessAccount = angular.copy(account);

            vm.rolesAccessErrorMessage = null;
        }

        function rolesAccessCancel() {
            vm.rolesAccessErrorMessage = null;
            vm.rolesAccessAccount = null;
        }

        function rolesAccessSubmit() {
            $rootScope.loading = true;
            var promise = AccountApiService.changeaccesslevel(vm.account, vm.rolesAccessAccount.accessLevel).$promise;
            promise.then(
                function (result) {
                    load();
                },
                function (error) {
                    console.log(error);
                    vm.rolesAccessErrorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericActivateErrorMessage;
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function filterRoles(role){
            return role !== "Gateway";
        }

        function transferSentriesBegin(account) {
            vm.subaccounts = account.children;
            vm.parentAccountTransfer = account;
            vm.transferSentriesErrorMessage = null;
            vm.transferSentriesImeiText = null;
            vm.transferMode = "add";
            vm.transferTitle = "Transfer Sentries to subaccount";
        }

        function untransferSentriesBegin(account) {
            vm.subaccounts = account.children;
            vm.parentAccountTransfer = account;
            vm.transferSentriesErrorMessage = null;
            vm.transferSentriesImeiText = null;
            vm.transferMode = "remove";
            vm.transferTitle = "Remove Sentries on subaccount";
        }

        function transferSentriesCancel() {
            vm.subaccounts = null;
            vm.parentAccountTransfer = null;
            vm.transferSentriesErrorMessage = null;
            vm.transferSentriesImeiText = null;
            vm.transferMode = null;
            vm.transferTitle = null;
        }

        function isSystemAdmin(){
            return SentinelUiSession.user.isSystemAdmin;
        }

        function transferSentriesSubmit() {
            if (!vm.transferSentriesSubAccount || !vm.transferSentriesImeiText) {
                return;
            }

            console.log("Parent Account",vm.parentAccountTransfer);
            console.log("SubAccount",vm.transferSentriesSubAccount);
            console.log("Imeis",vm.transferSentriesImeiText);

            $rootScope.loading = true;
            vm.transferSentriesErrorMessage = null;
            
            var imeiList = _.split(vm.transferSentriesImeiText, '\n');

            if (vm.transferMode === "add") {
                console.log("imeiList",imeiList);
                var promise= SentinelUiSession.user.isSystemAdmin ?
                    SentryAdminApiService.transferSentries(vm.transferSentriesSubAccount, imeiList).$promise :
                    SentryAccountApiService.transferSentries(vm.transferSentriesSubAccount, imeiList).$promise;

                promise.then(
                    function(result) {
                        load();
                        transferSentriesCancel();
                    },
                    function (error) {
                        console.log(error);
                        vm.transferSentriesErrorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericErrorTransferMessage;
                    }
                ).finally(function(){
                    $rootScope.loading = false;
                });
            } else if(vm.transferMode === "remove"){
                var promiseRem = SentinelUiSession.user.isSystemAdmin ?
                    SentryAdminApiService.untransferSentries(vm.transferSentriesSubAccount, imeiList).$promise :
                    SentryAccountApiService.untransferSentries(vm.transferSentriesSubAccount, imeiList).$promise;
                    promiseRem.then(
                    function(result) {
                        load();
                        transferSentriesCancel();
                    },
                    function (error) {
                        console.log(error);
                        vm.transferSentriesErrorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericErrorTransferMessage;
                    }
                ).finally(function(){
                    $rootScope.loading = false;
                });
            }
        }

        function transferSentinelsBegin(account) {
            vm.subaccounts = account.children;
            vm.parentAccountTransfer = account;
            vm.transferSentinelsErrorMessage = null;
            vm.transferSentinelsMacText = null;
            vm.transferMode = "add";
            vm.transferTitle = "Transfer Sentinels to subaccount";
        }

        function untransferSentinelsBegin(account) {
            vm.subaccounts = account.children;
            vm.parentAccountTransfer = account;
            vm.transferSentinelsErrorMessage = null;
            vm.transferSentinelsMacText = null;
            vm.transferMode = "remove";
            vm.transferTitle = "Remove Sentinels on subaccount";
        }

        function transferSentinelsCancel() {
            vm.subaccounts = null;
            vm.parentAccountTransfer = null;
            vm.transferSentinelsErrorMessage = null;
            vm.transferSentinelsMacText = null;
            vm.transferMode = null;
            vm.transferTitle = null;
        }

        function transferSentinelsSubmit() {
            if (!vm.transferSentriesSubAccount || !vm.transferSentinelsMacText) {
                return;
            }

            console.log("Parent Account",vm.parentAccountTransfer);
            console.log("SubAccount",vm.transferSentriesSubAccount);
            console.log("MACs",vm.transferSentinelsMacText);

            $rootScope.loading = true;
            vm.transferSentinelsErrorMessage = null;
            
            var imeiList = _.split(vm.transferSentinelsMacText, '\n');

            if (vm.transferMode === "add") {
                console.log("imeiList",imeiList);
                var promise= SentinelUiSession.user.isSystemAdmin ?
                    SentinelAdminApiService.transferSentinels(vm.transferSentriesSubAccount, imeiList).$promise :
                    SentinelAccountApiService.transferSentinels(vm.transferSentriesSubAccount, imeiList).$promise;

                promise.then(
                    function(result) {
                        load();
                        transferSentriesCancel();
                    },
                    function (error) {
                        console.log(error);
                        vm.transferSentinelsErrorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericErrorTransferMessage;
                    }
                ).finally(function(){
                    $rootScope.loading = false;
                });
            } else if(vm.transferMode === "remove"){
                var promise1= SentinelUiSession.user.isSystemAdmin ?
                SentinelAdminApiService.untransferSentinels(vm.transferSentriesSubAccount, imeiList).$promise :
                SentinelAccountApiService.untransferSentinels(vm.transferSentriesSubAccount, imeiList).$promise;
                promise1.then(
                    function(result) {
                        load();
                        transferSentinelsCancel();
                    },
                    function (error) {
                        console.log(error);
                        vm.transferSentinelsErrorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericErrorTransferMessage;
                    }
                ).finally(function(){
                    $rootScope.loading = false;
                });
            }
        }

        function addAccountBegin() {
            vm.addAccountInProgress = true;
            vm.account = null;
            vm.newName = null;
            vm.addAccountErrorMessage = null;
        }

        function addAccountCancel() {
            vm.addAccountErrorMessage = null;
            vm.addAccountInProgress = false;
            vm.account = null;
        }


        function addAccountSubmit() {
            $rootScope.loading = true;
            var promise = AccountApiService.addAccount(vm.newName).$promise;
            promise.then(
                function (result) {
                    load();

                },
                function (error) {
                    console.log(error);
                    vm.addAccountErrorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericAddAccountErrorMessage;
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function addSubAccountBegin(account) {
            vm.addSubAccountErrorMessage = null;
            vm.addSubAccountInProgress = true;
            vm.newSubAccountName = null;
            vm.subaccount = null;
            vm.account = account;
        }

        function addSubAccountCancel() {
            vm.addSubAccountErrorMessage = null;
            vm.addSubAccountInProgress = false;
            vm.subaccount = null;
            vm.account = null;
        }

        function addSubAccountSubmit() {
            $rootScope.loading = true;
            var promise = AccountApiService.addSubAccount(vm.account, vm.newSubAccountName).$promise;
            promise.then(
                function (result) {
                    load();

                },
                function (error) {
                    console.log(error);
                    vm.addSubAccountErrorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericAddSubAccountErrorMessage;
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function suspendBegin(account) {
            vm.suspendInProgress = true;
            vm.account = account;
            vm.suspendErrorMessage = null;
        }

        function suspendCancel() {
            vm.suspendErrorMessage = null;
            vm.suspendInProgress = false;
            vm.account = null;
        }

        function suspendSubmit() {
            $rootScope.loading = true;
            var promise = AccountApiService.suspendAccount(vm.account).$promise;
            promise.then(
                function (result) {
                    load();

                },
                function (error) {
                    console.log(error);
                    vm.suspendErrorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericSuspendErrorMessage;
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function suspendAccount() {
            $rootScope.loading = true;
            var promise = AccountApiService.suspendAccount(vm.account).$promise;
            promise.then(
                function (result) {
                    vm.account.status = 'suspended';
                },
                function (error) {
                    console.log(error);
                    vm.suspendErrorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericSuspendErrorMessage;
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function deleteBegin(account) {
            vm.deleteErrorMessage = null;
            vm.deleteInProgress = true;
            vm.account = account;
        }

        function deleteCancel() {
            vm.deleteErrorMessage = null;
            vm.deleteInProgress = false;
            vm.account = null;
        }

        function deleteSubmit() {
            $rootScope.loading = true;
            var promise = AccountApiService.deleteSubAccount(vm.account).$promise;
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


        function changeNameBegin(account) {
            console.log("Account to edit",account);
            vm.changeNameInProgress = true;
            vm.account = account;
            vm.newName = account.name;
            vm.changeNameErrorMessage = null;
            document.getElementById('txt-NewName').focus();
        }

        function changeNameCancel() {
            vm.changeNameErrorMessage = null;
            vm.changeNameInProgress = false;
            vm.account = null;
            vm.newName = null;
        }

        function changeNameSubmit() {
            if (!vm.newName) {
                return;
            }
            $rootScope.loading = true;
            var promise = AccountApiService.changeNameForAccount(vm.account, vm.newName).$promise;
            promise.then(
                function (result) {
                    //load();
                    vm.account.name = vm.newName;
                },
                function (error) {
                    console.log(error);
                    vm.changeNameErrorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericChangeNameErrorMessage;
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function setFocus(account) {
            SentinelUiSession.setFocus(account);
            $state.go('home');
        }

        function canCreateAccount(){
            var can = SentinelUiSession.user.isSystemAdmin;//!SentinelUiSession.user.isAccountEditor && !SentinelUiSession.user.isAccountObserver;
            return can;
        }

        function canCreateSubAccount(){
            var can = !SentinelUiSession.user.isAccountEditor && !SentinelUiSession.user.isAccountObserver;
            return can;
        }

         function canSuspendAccount(accountId){
            var can = accountId!= SentinelUiSession.user.accountId;
            return can;
        }

        function treeifyAccountList(accountList) {
            var indexed_nodes = {}, tree_roots = [];
            var i = 0;
            for (i = 0; i < accountList.length; i += 1) {
                accountList[i].children = [];
                indexed_nodes[accountList[i].id] = accountList[i];
            }
            for (i = 0; i < accountList.length; i += 1) {
                var parent_id = accountList[i].parentId;
                //console.log(accountList[i].id);
                /*if (accountList[i].id !== "cb4ac86d-a61c-42ff-924c-e48de595ec10" && accountList[i].id !== "bcb80e60-2922-4b9d-a2fc-6d8ab8216aed") {
                    var myArray = ["cb4ac86d-a61c-42ff-924c-e48de595ec10", "bcb80e60-2922-4b9d-a2fc-6d8ab8216aed"];
                    var rand = myArray[Math.floor(Math.random() * myArray.length)];
                    if (accountList[i].id == "5f8c6a56-29a7-423f-b4d0-37e8f39626ec") {
                        var parent_id = "cafb56b0-cc09-4311-b517-2083dc226eb6";
                    } else if (accountList[i].id == "cafb56b0-cc09-4311-b517-2083dc226eb6") {
                        var parent_id = "01c5c50c-95ca-4ab9-98ef-a35bc5b66592";
                    } else {
                        var parent_id = rand;
                    }
                }else {
                    var parent_id = 0;
                }*/
                if (typeof parent_id !== "undefined") {
                    if (parent_id === 0 || parent_id === null || !indexed_nodes[parent_id]) {
                        tree_roots.push(accountList[i]);
                    } else {
                        accountList[i].parentName = indexed_nodes[parent_id].name;
                        indexed_nodes[parent_id].children.push(accountList[i]);
                    }
                }
            }

            return (tree_roots === undefined || tree_roots.length == 0) ? accountList : tree_roots;
        }

        function sortBy(propertyName) {
            vm.reverse = (vm.propertyName === propertyName) ? !vm.reverse : false;
            vm.propertyName = propertyName;
        }
    }
})();
