(function() {
    'use strict';

    angular
        .module('ui-sentinel.alarms')
        .config(routes);

    routes.$inject = ['$stateProvider', 'SENTINEL_API_HOST_CONSTANTS'];
    function routes($stateProvider, USER_ROLES) {
        $stateProvider
            .state('alarms', {
                abstract: true,
                url: '/alarms',
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
                    pageTitle: 'Manage Alarms',
                    subTitle: null,
                    parentState: null
                }
            })
            .state('alarms.list', {
                url: '/list',
                templateUrl: 'ui-sentinel-alarms/alarms-list.html'
            })
            .state('alarms.by-device', {
                url: '/{device}',
                templateUrl: 'ui-sentinel-alarms/alarms-by-device.html',
                data: {
                    subTitle: 'By Device'
                }
            })
            .state('alarms.by-sentinel', {
                url: '/sentinel/{sentinel}',
                templateUrl: 'ui-sentinel-alarms/alarms-by-sentinel.html',
                data: {
                    subTitle: 'By Sentinel'
                }
            })
            .state('alarm', {
                abstract: true,
                url: '/alarm',
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
                    pageTitle: 'Manage Alarms',
                    subTitle: null,
                    parentState: 'alarms.list'
                }
            })
            .state('alarm.new', {
                url: '/new',
                templateUrl: 'ui-sentinel-alarms/alarm-admin.html',
                params: {
                    referrer: 'alarms.list',
                    referrerParams: null
                },
                data: {
                    subTitle: 'Create a new alarm'
                }
            })
            .state('alarm.admin', {
                url: '/:alarmId/admin',
                templateUrl: 'ui-sentinel-alarms/alarm-admin.html',
                params: {
                    referrer: 'alarms.list',
                    referrerParams: null,
                    clearMessage:true
                }
            })
            .state('alarmcontacts', {
                abstract: true,
                url: '/alarmcontacts',
                template: '<ui-view/>',
                data: {
                    authorizationRequired: true,
                    authorizedRoles: [
                        USER_ROLES.systemAdmin,
                        USER_ROLES.supportAdmin,
                        USER_ROLES.supportObserver,
                        USER_ROLES.accountAdmin,
                        USER_ROLES.accountEditor,
                        USER_ROLES.accountObserver
                    ],
                    pageTitle: 'Manage Alarm Contacts',
                    subTitle: null,
                    parentState: null
                }
            })
            .state('alarmcontacts.list', {
                url: '/list',
                templateUrl: 'ui-sentinel-alarms/alarmcontacts-list.html'
            })
            .state('alarmcontact', {
                abstract: true,
                url: '/alarmcontacts',
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
                    pageTitle: 'Manage Alarm Contacts',
                    subTitle: null,
                    parentState: 'alarmcontacts.list'
                }
            })
            .state('alarmcontact.new', {
                url: '/new',
                templateUrl: 'ui-sentinel-alarms/alarmcontact-admin.html',
                params: {
                    referrer: 'alarmcontacts.list',
                    referrerParams: null
                },
                data: {
                    subTitle: 'Create a new alarm contact'
                }
            })
            .state('alarmcontact.admin', {
                url: '/:contactId/admin',
                templateUrl: 'ui-sentinel-alarms/alarmcontact-admin.html',
                params: {
                    referrer: 'alarmcontacts.list',
                    referrerParams: null
                }
            });

    }
})();