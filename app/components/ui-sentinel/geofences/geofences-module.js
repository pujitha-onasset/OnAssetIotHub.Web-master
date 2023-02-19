(function() {
    'use strict';

    angular
        .module('ui-sentinel.geofences', [
            'LocalStorageModule',
            'api-sentinel',
            'ui-sentinel.maps',
        ]);
})();
