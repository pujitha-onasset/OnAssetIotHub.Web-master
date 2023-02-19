(function() {
    'use strict';

    angular
        .module('sentinel.gateway.web')
        .run(runBlock);

    ////////////////////////
    runBlock.$inject = ['$rootScope', '$state', '$stateParams', '$location', 'SentinelUiSession', 'RlsUiSession', 'localStorageService'];
    function runBlock($rootScope, $state, $stateParams, $location, SentinelUiSession, RlsUiSession, localStorageService) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;

        var locale = window.navigator.userLanguage || window.navigator.language;
        moment.locale(locale);

        $rootScope.$on('$stateChangeStart', onStateChangeStart);
        $rootScope.$on('$stateChangeSuccess', onStateChangeSuccess);

        function onStateChangeStart (event, toState, toParams, fromState, fromParams) {
            if (toState.data.isRlsRoute || toParams.isRlsRoute || fromParams.isRlsRoute) {
                if (typeof toState.data.isRlsRoute != "undefined") {
                    toState.data.isRlsRoute = true;
                }

                if (typeof toParams.isRlsRoute != "undefined") {
                    toParams.isRlsRoute = true;
                }

                if (typeof toParams.rlsAuthorizationRequired != "undefined") {
                    toParams.rlsAuthorizationRequired = true;
                }

                localStorageService.set('isRlsRoute', true);

                if (toState.name === 'rlslogin') {
                    if (RlsUiSession.isValid() ) {
                        $location.path( "/rls/home" );
                    }
                    return;
                }

                if (toState.data.rlsAuthorizationRequired && !RlsUiSession.isValid()) {
                    event.preventDefault();
                    RlsUiSession.clear();
                    $state.go('rlslogin');
                    return;
                }

                var rlsReloadState = localStorageService.get('rlsReloadState');
                var rlsReloadParams = localStorageService.get('rlsReloadParams');

                if (RlsUiSession.isReloaded && rlsReloadState) {
                    event.preventDefault();
                    RlsUiSession.isReloaded = false;
                    $state.go(rlsReloadState, rlsReloadParams);
                }
                RlsUiSession.isReloaded = false;

            } else {
                localStorageService.set('isRlsRoute', false);

                if (SentinelUiSession.isValid() && SentinelUiSession.isExpired() && toState.name !== 'logins.password') {
                    event.preventDefault();               
                    $state.go('logins.password');
                    return;
                }

                if (SentinelUiSession.isValid() && !SentinelUiSession.isEulaAgreement() && !SentinelUiSession.isExpired() && toState.name !== 'logins.termofservice') {
                    event.preventDefault();               
                    $state.go('logins.termofservice');
                    return;
                }

                if (toState.name === 'login') {
                    if (SentinelUiSession.isValid() ) {
                        //window.history.back();
                        $location.path( "/home" );
                    }
                    return;
                }

                if (toState.data.authorizationRequired && !SentinelUiSession.isValid()) {
                    event.preventDefault();
                    SentinelUiSession.clear();
                    $state.go('login');
                    return;
                }

                var reloadState = localStorageService.get('reloadState');
                var reloadParams = localStorageService.get('reloadParams');

                if (SentinelUiSession.isReloaded && reloadState) {
                    event.preventDefault();
                    SentinelUiSession.isReloaded = false;
                    $state.go(reloadState, reloadParams);
                }
                SentinelUiSession.isReloaded = false;

                //next, make sure user has proper roles
                var authorizedRoles = toState.data.authorizedRoles;
                //if (!AuthService.isAuthorized(authorizedRoles)) {
                //    event.preventDefault();
                //    if (AuthService.isAuthenticated()) {
                //        // user is not allowed
                //        $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
                //    } else {
                //        // user is not logged in
                //        $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
                //    }
                //}
            }
        }

        function onStateChangeSuccess (event, toState, toParams, fromState, fromParams) {
            if (toState.data.isRlsRoute) {
                if (toState.data.rlsAuthorizationRequired) {
                    localStorageService.set('rlsReloadState', toState.name);
                    localStorageService.set('rlsReloadParams', toParams);
                }
            } else {
                if (toState.data.authorizationRequired) {
                    localStorageService.set('reloadState', toState.name);
                    localStorageService.set('reloadParams', toParams);
                }

                // if (ApiToken.isValid()) {
                //     ApiToken.store();
                // }
                // else {
                //     console.log('clearing session');
                //     localStorageService.clearAll();
                // }
            }
        }
    }

})();