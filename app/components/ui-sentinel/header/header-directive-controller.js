(function() {
    'use strict';

    angular
        .module('ui-sentinel.header')
        .controller('HeaderController', HeaderController);

    HeaderController.$inject = ['$rootScope','$scope', '$state','ApiToken','SentinelUiSession'];
    function HeaderController($rootScope, $scope, $state, ApiToken, SentinelUiSession) {
        var vm = {
            references: {
                home: 'sentry',
                logo: './img/OnAssetHeaderLogo.png'
            },
            focusName: null,
            accountName: null,
            showNavigation: showNavigation,
            showLogout: showLogout,
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
            session: SentinelUiSession
        };
        activate();
        return vm;

        function activate() {
            // $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            //
            // });
            $scope.$watch(
                function() {
                    return SentinelUiSession.focus;
                },
                function(focus) {
                    if(SentinelUiSession.user){
                        vm.accountName = SentinelUiSession.user.accountName;
                    }

                    if (!focus || focus.id === SentinelUiSession.user.accountId) {
                        vm.focusName = null;
                    } else {
                        vm.focusName = focus.name;
                    }
                }
            );
        }

        function showNavigation() {
            return SentinelUiSession.user && SentinelUiSession.user.isEulaAgreement && true;
        }

         function showLogout() {
            return SentinelUiSession.user && !SentinelUiSession.user.isEulaAgreement && true;
        }

        function showSystemAdminMenu() {
            return SentinelUiSession.user && SentinelUiSession.user.isSystemAdmin;
        }
        
        function showAdminMenu() {
            return (SentinelUiSession.user && SentinelUiSession.user.isAnAdmin);
        }

        function showAccountMenu() {
            return (SentinelUiSession.user && !SentinelUiSession.user.isAnAdmin) || (SentinelUiSession.user && SentinelUiSession.user.isAnAdmin && SentinelUiSession.focus.id !== SentinelUiSession.user.accountId);
        }

        function showSupportAdminMenu() {
            return (SentinelUiSession.user && SentinelUiSession.user.isSupportAdmin);
        }

        function showSupportObserverMenu() {
            return (SentinelUiSession.user && SentinelUiSession.user.isSupportObserver);
        }

        function showAccountAdminMenu() {
            return (SentinelUiSession.user && SentinelUiSession.user.isAccountAdmin);
        }

        function showAccountEditorMenu() {
            return (SentinelUiSession.user && SentinelUiSession.user.isAccountEditor);
        }

        function showAccountObserverMenu() {
            return (SentinelUiSession.user && SentinelUiSession.user.isAccountObserver);
        }

        function go(state) {
            vm.showMenu = false;
            $state.go(state);
        }

        function logout() {
            vm.showMenu = false;
            ApiToken.clear();
            SentinelUiSession.clear();
            $state.go('login');
        }

        function toggleMenu() {
            vm.showMenu = !vm.showMenu;
        }

        function navigateToParent() {
            $state.go($state.current.data.parentState);
        }

        function clearFocus() {
            vm.focusName = null;
            SentinelUiSession.setFocus(null);
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
            $state.go('logins.username', { loginId: SentinelUiSession.user.id, referrer: returnState, referrerParams: returnStateParams } );
        }


    }
})();