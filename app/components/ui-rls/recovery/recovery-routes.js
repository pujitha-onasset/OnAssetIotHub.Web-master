(function() {
    'use strict';

    angular
        .module('ui-rls.recovery')
        .config(routes);

    routes.$inject = ['$stateProvider', 'SENTINEL_API_HOST_CONSTANTS'];
    function routes($stateProvider, USER_ROLES) {
        $stateProvider
            .state('recover', {
                url: '/rls/recover/{token}',
                templateUrl: 'ui-rls-recovery/device-recovery.html',
                data: {
                    isRlsRoute: true,
                    rlsAuthorizationRequired: false
                }
            })
            .state('recovery', {
                abstract: true,
                url: '/recovery',
                template: '<ui-view/>',
                data: {
                    isRlsRoute: true,
                    rlsAuthorizationRequired: true,
                    pageTitle: 'Manage Recovery Devices',
                    subTitle: null,
                    parentState: null
                }
            })
            .state('recovery.list', {
                url: '/list',
                templateUrl: 'ui-rls-recovery/recovery-list.html'
            })
            .state('recovery.admin', {
                url: '/:recoveryDeviceId/admin',
                templateUrl: 'ui-rls-recovery/recovery-admin.html',
                params: {
                    referrer: 'recovery.list',
                    referrerParams: null,
                    clearMessage:true
                },
                data: {
                    isRlsRoute: true,
                    rlsAuthorizationRequired: true,
                }
            });
    }
})();