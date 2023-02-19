(function() {
    'use strict';

    angular
        .module('ui-sentinel.devices')
        .config(routes);

    routes.$inject = ['$stateProvider', 'SENTINEL_API_HOST_CONSTANTS'];
    function routes($stateProvider, USER_ROLES) {
        $stateProvider
            .state('devices', {
                abstract: true,
                url: '/devices',
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
                    pageTitle: 'Manage Devices',
                    subTitle: null,
                    parentState: null
                }
            })
            /*.state('devices.list', {
                url: '/list',
                templateUrl: 'vision-devices-devices-list/devices-list.html',
            })*/
            .state('devices.map', {
                url: '/map',
                templateUrl: 'ui-sentinel-devices.latestDeviceTracking/latest-device-tracking-map.html',
                data: {
                    pageTitle: 'Track Devices',
                    subTitle: null,
                    parentState: null
                },
                params: {
                    forceUseLastDateRange:false
                }
            })
            .state('devices.reports', {
                url: '/reports',
                templateUrl: 'ui-sentinel-devices.latestDeviceTracking/latest-device-tracking-list.html',
                data: {
                    pageTitle: 'Track Devices',
                    subTitle: null,
                    parentState: null
                }
            })
            .state('devices.devicereport', {
                url: '/devicereport',
                templateUrl: 'ui-sentinel-devices.devicePivot/device-pivot.html',
                data: {
                    pageTitle: 'Device Report',
                    subTitle: null,
                    parentState: null
                }
            })
            .state('devices.sentinelreport', {
                url: '/sentinelreport',
                templateUrl: 'ui-sentinel-devices.devicePivot/sentinel-pivot.html',
                data: {
                    pageTitle: 'Sentinel Report',
                    subTitle: null,
                    parentState: null
                }
            })
            .state('device', {
                abstract: true,
                url: '/devices/:deviceTagId',
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
                    pageTitle: 'Manage Devices',
                    subTitle: null,
                    parentState: 'devices.list'
                },
                params: {
                    referrer: 'devices.list',
                    referrerParams: null
                }
            })
            /*.state('device.admin', {
                url: '/admin',
                templateUrl: 'vision-devices-device-admin/device-admin.html'
            })*/
            .state('device.reports', {
                url: '/reports',
                templateUrl: 'ui-sentinel-devices.deviceTracking/device-tracking-list.html',
                data: {
                    pageTitle: 'Track Devices',
                    subTitle: null,
                    parentState: 'devices.map'
                }
            })
            .state('device.map', {
                url: '/map',
                templateUrl: 'ui-sentinel-devices.deviceTracking/device-tracking-map.html',
                data: {
                    pageTitle: 'Track Devices',
                    subTitle: null,
                    parentState: 'devices.map'
                }
            })
            .state('device.summary', {
                url: '/summary',
                templateUrl: 'ui-sentinel-devices.deviceTracking/device-tracking-summary.html',
                data: {
                    pageTitle: 'Track Devices',
                    subTitle: null,
                    parentState: 'devices.map'
                }
            })
            .state('device.sentinelreports', {
                url: '/sentinelreports',
                templateUrl: 'ui-sentinel-devices.sentinelTracking/sentinel-tracking-list.html',
                data: {
                    pageTitle: 'Track Devices',
                    subTitle: null,
                    parentState: 'devices.map'
                }
            })
            .state('device.sentinelmap', {
                url: '/sentinelmap',
                templateUrl: 'ui-sentinel-devices.sentinelTracking/sentinel-tracking-map.html',
                data: {
                    pageTitle: 'Track Devices',
                    subTitle: null,
                    parentState: 'sentinel.map'
                }
            })
            .state('device.sentinelsummary', {
                url: '/sentinelsummary',
                templateUrl: 'ui-sentinel-devices.sentinelTracking/sentinel-tracking-summary.html',
                data: {
                    pageTitle: 'Track Devices',
                    subTitle: null,
                    parentState: 'sentinel.map'
                }
            });
    }
})();