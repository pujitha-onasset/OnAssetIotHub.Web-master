(function() {
    'use strict';

    angular
        .module('ui-sentinel.calibrations')
        .config(routes);

    routes.$inject = ['$stateProvider', 'SENTINEL_API_HOST_CONSTANTS'];
    function routes($stateProvider, USER_ROLES) {
        $stateProvider
            .state('calibrations', {
                abstract: true,
                url: '/calibrations',
                template: '<ui-view/>',
                data: {
                    authorizationRequired: true,
                    authorizedRoles: [
                        USER_ROLES.systemAdmin,
                        USER_ROLES.supportAdmin,
                        USER_ROLES.supportObserver,
                        USER_ROLES.accountAdmin,
                        USER_ROLES.accountEditor
                    ],
                    pageTitle: 'Manage Calibrations',
                    subTitle: null,
                    parentState: null
                }
            })
            .state('calibrations.controlcenter', {
                url: '/controlcenter/map',
                templateUrl: 'ui-sentinel-calibrations.calibrationControlCenter/calibration-control-center-map.html',
                data: {
                    pageTitle: 'Control Center',
                    subTitle: null,
                    parentState: null
                }
            })
            /*.state('calibrations.controlcenter.reports', {
                url: '/controlcenter/reports',
                templateUrl: 'ui-sentinel-devices.calibrationControlCenter/calibration-control-center-list.html',
                data: {
                    pageTitle: 'Control Center',
                    subTitle: null,
                    parentState: null
                }
            })*/
            .state('calibrations.alerts', {
                url: '/alerts',
                templateUrl: 'ui-sentinel-calibrations/calibration-alerts.html',
                data: {
                    subTitle: 'Alerts'
                },
            })
            .state('calibrations.list', {
                url: '/:sentinelId/list',
                templateUrl: 'ui-sentinel-calibrations/calibrations-list.html',
                params: {
                    referrer: 'assets.list',
                    referrerParams: null,
                    clearMessage:true,
                    asset: null
                },
            })
            .state('calibrations.new', {
                url: '/:sentinelId/new',
                templateUrl: 'ui-sentinel-calibrations/calibration-admin.html',
                params: {
                    referrer: 'calibrations.list',
                    referrerParams: null,
                    clearMessage:true,
                    asset: null
                },
                data: {
                    subTitle: 'Create a new calibration'
                }
            })
            .state('calibration', {
                abstract: true,
                url: '/calibration',
                template: '<ui-view/>',
                data: {
                    authorizationRequired: true,
                    authorizedRoles: [
                        USER_ROLES.systemAdmin,
                        USER_ROLES.supportAdmin,
                        USER_ROLES.supportObserver,
                        USER_ROLES.accountAdmin,
                        USER_ROLES.accountEditor
                    ],
                    pageTitle: 'Manage Calibrations',
                    subTitle: null,
                    parentState: 'calibrations.list'
                }
            })
            .state('calibration.admin', {
                url: '/:calibrationId/admin',
                templateUrl: 'ui-sentinel-calibrations/calibration-admin.html',
                params: {
                    referrer: 'calibrations.list',
                    referrerParams: null,
                    clearMessage:true,
                    calibration: null,
                }
            });
    }
})();