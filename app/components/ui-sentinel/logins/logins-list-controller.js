(function() {
    'use strict';

    angular
        .module('ui-sentinel.logins')
        .controller('LoginsListController', LoginsListController);

    /////////////

    LoginsListController.$inject = ['$rootScope', '$state', 'SentinelUiSession', 'LoginsApiService', 'AccountApiService'];
    function LoginsListController($rootScope, $state, SentinelUiSession, LoginsApiService, AccountApiService) {
        var vm = {
            list: null,
            page: 1,
            countOfItems: 0,
            countOfPages: 1,
            itemsPerPage: 500,
            addLoginInProgress: false,
            addLoginAccounts: null,
            addLoginBegin: addLoginBegin,
            addLoginCancel: addLoginCancel,
            addLoginSubmit: addLoginSubmit,
            availableRoles: null,
            changeNameInProgress: false,
            changeNameBegin: changeNameBegin,
            changeNameCancel: changeNameCancel,
            changeNameSubmit: changeNameSubmit,
            changeRoleBegin: changeRoleBegin,
            changeRoleCancel: changeRoleCancel,
            changeRoleSubmit: changeRoleSubmit,
            deleteInProgress: false,
            deleteBegin: deleteBegin,
            deleteCancel: deleteCancel,
            deleteSubmit: deleteSubmit,
            suspendInProgress: false,
            suspendBegin: suspendBegin,
            suspendCancel: suspendCancel,
            suspendSubmit: suspendSubmit,
            unlockBegin: unlockBegin,
            unlockCancel: unlockCancel,
            unlockSubmit: unlockSubmit,
            errorMessage: null,
            addLoginErrorMessage: null,
            changePasswordErrorMessage: null,
            deleteErrorMessage: null,
            changeNameErrorMessage: null,
            suspendErrorMessage: null,
            unlockErrorMessage: null,
            login: null,
            passwordInProgress: false,
            passwordBegin: passwordBegin,
            passwordCancel: passwordCancel,
            passwordSubmit: passwordSubmit,
            canCreateLogin: canCreateLogin,
            password: null,
            passwordGenerate: passwordGenerate,
            hasPermission: {
                toChangeName: false,
                toChangeRole: false,
                toChangePassword: false,
                toChangeAccess: false,
                toDelete: false,
                toCreate: false,
                toOverridePasswordExpiration: false
            },
            checkPermissionsToChangeName: checkPermissionsToChangeName,
            checkPermissionsToChangeRole: checkPermissionsToChangeRole,
            checkPermissionsToChangePassword: checkPermissionsToChangePassword,
            checkPermissionsToChangeAccess: checkPermissionsToChangeAccess,
            checkPermissionsToDelete: checkPermissionsToDelete,
            checkPermissionsToCreate: checkPermissionsToCreate,
            propertyName: 'userName',
            reverse: false,
            sortBy: sortBy,
        };

        var genericErrorMessage = "Unexpected error ocurred while getting the logins records";
        var genericChangePasswordErrorMessage = "Unexpected error ocurred while changing the password";
        var genericAddLoginErrorMessage = "Unexpected error ocurred while adding a login";
        var genericDeleteErrorMessage = "Unexpected error ocurred while deleting a login";
        var genericChangeNameErrorMessage = "Unexpected error ocurred while changing the name";
        var genericSuspendErrorMessage = "Unexpected error ocurred while suspending a login";
        var genericUnlockErrorMessage = "Unexpected error ocurred while unlocking a login";
        var genericChangeRoleErrorMessage = "Unexpected error ocurred while changing the role";
        activate();
        return vm;

        function activate() {
            setPermissions();
            load();
        }

        function setPermissions() {
            vm.hasPermission.toChangeName = false;
            vm.hasPermission.toChangeRole = false;
            vm.hasPermission.toChangePassword = false;
            vm.hasPermission.toChangeAccess = false;
            vm.hasPermission.toDelete = false;
            vm.hasPermission.toCreate = false;

            if (SentinelUiSession.user.isSystemAdmin) {
                vm.hasPermission.toChangeName = true;
                vm.hasPermission.toChangeRole = true;
                vm.hasPermission.toChangePassword =  true;
                vm.hasPermission.toChangeAccess = true;
                vm.hasPermission.toDelete = true;
                vm.hasPermission.toCreate = true;
            }
            if (SentinelUiSession.user.isSupportAdmin) {
                vm.hasPermission.toChangeName = true;
                vm.hasPermission.toChangePassword = true;
                vm.hasPermission.toChangeAccess = true;
                vm.hasPermission.toCreate = true;
            }
            if (SentinelUiSession.user.isAccountAdmin) {
                vm.hasPermission.toChangeName = true;
                vm.hasPermission.toChangeRole = true;
                vm.hasPermission.toChangePassword = true;
                vm.hasPermission.toChangeAccess = true;
                vm.hasPermission.toCreate = true;
            }
            if (SentinelUiSession.user.isAccountEditor) {
                vm.hasPermission.toCreate = true;
            }
        }

        function checkPermissionsToChangeName(login) {
            if (SentinelUiSession.user.isSystemAdmin ||
                SentinelUiSession.user.isAccountAdmin) {
                return true;
            } else if (SentinelUiSession.user.isSupportAdmin) {
                return (login.role === 'WebSupportAdmin' || login.role === 'WebSupportObserver');
            }

            return false;
        }

        function checkPermissionsToChangeRole(login) {
            if (SentinelUiSession.user.isSystemAdmin) {
                return true;
            } else if (SentinelUiSession.user.isAccountAdmin && SentinelUiSession.user.accountName == login.accountName){
                return true;
            }

            return false;
        }

        function checkPermissionsToChangePassword(login) {
            if (SentinelUiSession.user.isSystemAdmin ||
                SentinelUiSession.user.isAccountAdmin) {
                return true;
            } else if (SentinelUiSession.user.isSupportAdmin) {
                return (login.role === 'WebSupportAdmin' || login.role === 'WebSupportObserver');
            }

            return false;
        }

        function checkPermissionsToChangeAccess(login) {
            if (SentinelUiSession.user.isSystemAdmin ||
                SentinelUiSession.user.isAccountAdmin) {
                return true;
            } else if (SentinelUiSession.user.isSupportAdmin) {
                return (login.role === 'WebSupportAdmin' || login.role === 'WebSupportObserver');
            }

            return false;
        }

        function checkPermissionsToDelete(login) {
            if (SentinelUiSession.user.isSystemAdmin) {
                return true;
            }

            return false;
        }

        function checkPermissionsToCreate(login) {
            if (SentinelUiSession.user.isSystemAdmin ||
                SentinelUiSession.user.isAccountAdmin ||
                SentinelUiSession.user.isAccountEditor) {
                return true;
            } else if (SentinelUiSession.user.isSupportAdmin) {
                return (login.role === 'WebSupportAdmin' || login.role === 'WebSupportObserver');
            }

            return false;
        }

        function load() {
            $rootScope.loading = true;
            $('.modal').modal('hide');
            vm.list = null;
            vm.errorMessage = null;
            vm.addLoginErrorMessage = null;
            vm.changePasswordErrorMessage = null;
            vm.deleteErrorMessage = null;
            vm.changeNameErrorMessage = null;
            var promise =  (SentinelUiSession.user.isAnAdmin && SentinelUiSession.focus.id==SentinelUiSession.user.accountId)? LoginsApiService.listLogins().$promise:
            LoginsApiService.listLoginsByClient(SentinelUiSession.focus).$promise;
            promise.then(
                function(result) {
                    vm.list = result;
                    deleteCancel();
                    addLoginCancel();
                    changeNameCancel();
                    passwordCancel();
                },
                function (error) {
                    console.log(error);
                    vm.errorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericErrorMessage;
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function addLoginBegin() {
            $rootScope.loading = true;
            vm.addLoginAccounts = null;
            vm.availableRoles = null;

            vm.login = null;
            vm.addLoginErrorMessage = null;

            console.log(SentinelUiSession.user);

            var rolesPromise = LoginsApiService.getAvailableRoles(SentinelUiSession.user).$promise;

            rolesPromise.then(
                function(result) {
                    vm.availableRoles = [];

                    _.forEach(result, function(role) {
                        var availableRole = {
                            value: role,
                            label: role.replace('Web', '').replace('Admin', ' Admin').replace('Editor', ' Editor').replace('Observer', ' Observer')
                        };

                        if (availableRole.label !== "Support Admin" && availableRole.label !== "Support Observer") {
                            vm.availableRoles.push(availableRole);
                        }
                    });

                },
                function (error) {
                    console.log(error);
                    vm.addLoginErrorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericAddLoginErrorMessage;
                }
            );

            var promise = AccountApiService.listAccounts().$promise;
            promise.then(
                function(result) {
                    vm.addLoginAccounts = result;
                    vm.addLoginInProgress = true;
                    vm.login = {
                        account: null,
                        userName: null,
                        password: null,
                        role: null,
                    };
                },
                function (error) {
                    console.log(error);
                    vm.addLoginErrorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericAddLoginErrorMessage;
                }
            ).finally(function(){
                $rootScope.loading = false;
            });

        }

        function addLoginCancel() {
            vm.addLoginErrorMessage = null;
            vm.addLoginInProgress = false;
            vm.addLoginAccounts = null;
            vm.login = null;
        }

        function addLoginSubmit() {
            if(!vm.login.account || !vm.login.userName || !vm.login.password || !vm.login.role){
                vm.addLoginErrorMessage = "Please fill all the required fields";
                return;
            }

            $rootScope.loading = true;
            vm.addLoginErrorMessage = null;

            var promise = LoginsApiService.addLogin(vm.login.account, vm.login.userName, vm.login.password, vm.login.role).$promise;
            promise.then(
                function (result) {
                    load();

                },
                function (error) {
                    console.log(error);
                    vm.addLoginErrorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericAddLoginErrorMessage;
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function changeRoleBegin(login) {
            $rootScope.loading = true;

            vm.login = login;
            vm.availableRoles = null;
            vm.changeRoleErrorMessage = null;
            vm.newRole = login.role;

            var rolesPromise = LoginsApiService.getAvailableRoles(SentinelUiSession.user).$promise;

            rolesPromise.then(
                function(result) {
                    vm.availableRoles = [];

                    _.forEach(result, function(role) {
                        var availableRole = {
                            value: role,
                            label: role.replace('Web', '').replace('Admin', ' Admin').replace('Editor', ' Editor').replace('Observer', ' Observer')
                        };

                        if (availableRole.label !== "Support Admin" && availableRole.label !== "Support Observer") {
                            vm.availableRoles.push(availableRole);
                        }
                    });

                },
                function (error) {
                    console.log(error);
                    vm.changeRoleErrorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericChangeRoleErrorMessage;
                }
            ).finally(function(){
                $rootScope.loading = false;
            });

        }

        function changeRoleCancel() {
            vm.availableRoles = null;
            vm.changeRoleErrorMessage = null;
            vm.newRole = null;
            vm.login = null;
        }

        function changeRoleSubmit() {
            if (!vm.newRole) {
                return;
            }

            $rootScope.loading = true;

            vm.changeRoleErrorMessage = null;

            var promise = LoginsApiService.changeRoleForLogin(vm.login, vm.newRole).$promise;

            promise.then(
                function (result) {
                    load();
                },
                function (error) {
                    console.log(error);
                    vm.changeRoleErrorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericChangeRoleErrorMessage;
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function changeNameBegin(login) {
            vm.changeNameInProgress = true;
            vm.login = login;
            vm.newName = null;
            vm.changeNameErrorMessage = null;
            document.getElementById('txt-NewName').focus();
        }

        function changeNameCancel() {
            vm.changeNameErrorMessage = null;
            vm.changeNameInProgress = false;
            vm.login = null;
            vm.newName = null;
        }

        function changeNameSubmit() {
            if (!vm.newName) {
                return;
            }

            $rootScope.loading = true;
            vm.changeNameErrorMessage = null;
            var promise = LoginsApiService.changeNameForLogin(vm.login, vm.newName).$promise;
            promise.then(
                function (result) {
                    load();

                },
                function (error) {
                    console.log(error);
                    vm.changeNameErrorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericChangeNameErrorMessage;
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }        

        function deleteBegin(login) {
            vm.deleteInProgress = true;
            vm.login = login;
            vm.deleteErrorMessage = null;
        }

        function deleteCancel() {
            vm.deleteErrorMessage = null;
            vm.deleteInProgress = false;
            vm.login = null;
        }

        function deleteSubmit() {
            $rootScope.loading = true;
            vm.deleteErrorMessage = null;
            var promise = LoginsApiService.deleteLogin(vm.login).$promise;
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

        function suspendBegin(login) {
            vm.suspendInProgress = true;
            vm.login = login;
            vm.suspendErrorMessage = null;
        }

        function suspendCancel() {
            vm.suspendErrorMessage = null;
            vm.suspendInProgress = false;
            vm.login = null;
        }

        function suspendSubmit() {
            $rootScope.loading = true;
            vm.suspendErrorMessage = null;
            var promise = LoginsApiService.revokeAccess(vm.login).$promise;
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

        function unlockBegin(login) {
            vm.unlockInProgress = true;
            vm.login = login;
            vm.unlockErrorMessage = null;
        }

        function unlockCancel() {
            vm.unlockErrorMessage = null;
            vm.unlockInProgress = false;
            vm.login = null;
        }

        function unlockSubmit() {
            $rootScope.loading = true;
            vm.unlockErrorMessage = null;
            var promise = LoginsApiService.grantAccess(vm.login).$promise;
            promise.then(
                function (result) {
                    load();

                },
                function (error) {
                    console.log(error);
                    vm.unlockErrorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericUnlockErrorMessage;
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function passwordBegin(login) {
            vm.password = null;
            vm.passwordInProgress = true;
            vm.login = login;
            vm.changePasswordErrorMessage = null;
        }

        function passwordCancel() {
            vm.changePasswordErrorMessage = null;
            vm.passwordInProgress = false;
            vm.login = null;
        }

        function passwordSubmit() {
            if (!vm.password) {
                return;
            }

            $rootScope.loading = true;
            vm.changePasswordErrorMessage = null;
            var promise = LoginsApiService.setPasswordForLogin(vm.login, vm.password).$promise;
            promise.then(
                function (result) {
                    load();

                },
                function (error) {
                    console.log(error);
                    vm.changePasswordErrorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericChangePasswordErrorMessage;
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function canCreateLogin(){
            var can = !SentinelUiSession.user.isAccountEditor && !SentinelUiSession.user.isAccountObserver;
            return can;
        }

        function passwordGenerate(type) {
            var uppers = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            var symbols = "!#$%&*@";

            var strUpperPart = uppers.charAt(Math.floor(Math.random() * uppers.length));
            var strSymbolsPart = symbols.charAt(Math.floor(Math.random() * symbols.length));

            var strPassword = strUpperPart + Math.random().toString(36).slice(-8) + strSymbolsPart;
            if (type == 'add') {
                vm.login.password = strPassword;
            } else {
                vm.password = strPassword;
            }
        }

        function sortBy(propertyName) {
            vm.reverse = (vm.propertyName === propertyName) ? !vm.reverse : false;
            vm.propertyName = propertyName;
        }
    }



})();