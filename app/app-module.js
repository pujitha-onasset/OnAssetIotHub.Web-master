(function() {
    'use strict';

    angular.module('sentinel.gateway.web', [
        'ui.router',
        'ngResource',
        'ngSanitize',
        'LocalStorageModule',
        'api-common',
        'api-sentinel',
        'api-rls',
        'scanner.detection',
        'ui-common',
        'ui-sentinel.home',
        'ui-sentinel.login',
        'ui-sentinel.header',
        'ui-sentinel.session',
        'ui-sentinel.accounts',
        'ui-sentinel.logins',
        'ui-sentinel.sentry',
        'ui-sentinel.sentinel',
        'ui-sentinel.sentry-reports',
        'ui-sentinel.sentry-configs',
        'ui-sentinel.sentry-commands',
        'ui-sentinel.sightings',
        'ui-sentinel.simulators',
        'ui-sentinel.feedback',
        'ui-sentinel.maps',
        'ui-sentinel.alarms',
        'ui-sentinel.geofences',
        'ui-sentinel.shipments',
        'ui-sentinel.watchlist',
        'ui-sentinel.devicegroups',
        'ui-sentinel.devices',
        'ui-sentinel.locations',
        'ui-sentinel.zones',
        'ui-sentinel.assets',
        'ui-sentinel.calibrations',
        'ui-sentinel.fulfillment',
        'ui-rls.login',
        'ui-rls.home',
        'ui-rls.header',
        'ui-rls.session',
        'ui-rls.branches',
        'ui-rls.recovery',
        'ui-rls.exceptions',
        'checklist-model'
        // 'sentinel-ui.sentry',
        //'sentinel-ui.sightings',
        //'sentinel-ui.emulator'
        // 'sentinel-ui.exception'
    ]);

})();

