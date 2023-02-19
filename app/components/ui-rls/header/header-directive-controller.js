(function() {
    'use strict';

    angular
        .module('ui-rls.header')
        .controller('RlsHeaderController', RlsHeaderController);

    RlsHeaderController.$inject = ['$rootScope','$scope', '$state','ApiToken','RlsUiSession', 'localStorageService'];
    function RlsHeaderController($rootScope, $scope, $state, ApiToken, RlsUiSession, localStorageService) {
        var vm = {
            references: {
                home: 'sentry',
                logo: './img/OnAssetHeaderLogo.png'
            },
            focusName: null,
            accountName: null,
            showNavigation: showNavigation,
            showMenu: false,
            showAdminMenu: showAdminMenu,
            showAccountMenu: showAccountMenu,
            showSystemAdminMenu: showSystemAdminMenu,
            showAccountAdminMenu: showAccountAdminMenu,
            showAccountEditorMenu: showAccountEditorMenu,
            showAccountObserverMenu: showAccountObserverMenu,
            logout: logout,
            go: go,
            toggleMenu: toggleMenu,
            navigateToParent: navigateToParent,
            clearFocus: clearFocus,
            changeFocus: changeFocus,
            changePassword: changePassword,
            changeUsername: changeUsername,
            session: RlsUiSession
        };
        activate();
        return vm;

        function activate() {
            // $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            //
            // });
            $scope.$watch(
                function() {
                    return RlsUiSession.focus;
                },
                function(focus) {
                    if(RlsUiSession.user){
                        vm.accountName = RlsUiSession.user.accountName;
                    }

                    if (!focus || focus.id === RlsUiSession.user.accountId) {
                        vm.focusName = null;
                    } else {
                        vm.focusName = focus.name;
                    }
                }
            );
        }

        function showNavigation() {
            return RlsUiSession.user && true;
        }

        function showSystemAdminMenu() {
            return RlsUiSession.user && RlsUiSession.user.isSystemAdmin;
        }
        
        function showAdminMenu() {
            return (RlsUiSession.user && RlsUiSession.user.isAnAdmin);
        }

        function showAccountMenu() {
            return (RlsUiSession.user && !RlsUiSession.user.isAnAdmin) || (RlsUiSession.user && RlsUiSession.user.isAnAdmin && RlsUiSession.focus.id !== RlsUiSession.user.accountId);
        }

        function showSupportAdminMenu() {
            return (RlsUiSession.user && RlsUiSession.user.isSupportAdmin);
        }

        function showSupportObserverMenu() {
            return (RlsUiSession.user && RlsUiSession.user.isSupportObserver);
        }

        function showAccountAdminMenu() {
            return (RlsUiSession.user && RlsUiSession.user.isAccountAdmin);
        }

        function showAccountEditorMenu() {
            return (RlsUiSession.user && RlsUiSession.user.isAccountEditor);
        }

        function showAccountObserverMenu() {
            return (RlsUiSession.user && RlsUiSession.user.isAccountObserver);
        }

        function go(state) {
            vm.showMenu = false;
            $state.go(state, { isRlsRoute: true, rlsAuthorizationRequired: true });
        }

        function logout() {
            vm.showMenu = false;
            ApiToken.clear();
            RlsUiSession.clear();

            localStorageService.remove('visionToken');
            localStorageService.remove('visionUser');
            localStorageService.remove('visionClient');

            $state.go('rlslogin');
        }

        function toggleMenu() {
            vm.showMenu = !vm.showMenu;
        }

        function navigateToParent() {
            $state.go($state.current.data.parentState);
        }

        function clearFocus() {
            vm.focusName = null;
            RlsUiSession.setFocus(null);
            $state.go('accounts.list');
        }

        function changeFocus() {
            $state.go('accounts.list');
        }

        function changePassword() {
            var returnState = $state.current.name;
            var returnStateParams = $state.params;
            $state.go('logins.password', { referrer: returnState, referrerParams: returnStateParams } );
        }

        function changeUsername() {
            var returnState = $state.current.name;
            var returnStateParams = $state.params;
            $state.go('logins.username', { loginId: RlsUiSession.user.id, referrer: returnState, referrerParams: returnStateParams } );
        }


    }
})();