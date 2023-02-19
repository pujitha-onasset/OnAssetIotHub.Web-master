(function () {
    'use strict';

    angular.module('ui-sentinel.devices', [
        //'ui-sentinel.api',
        //'ui-sentinel.devices.devicesList',
        //'ui-sentinel.devices.deviceAdmin',
        'ui-sentinel.devices.deviceTracking',
        'ui-sentinel.devices.sentinelTracking',
        'ui-sentinel.devices.latestDeviceTracking',
        'ui-sentinel.devices.devicePivot'
    ]);
})();