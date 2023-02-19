(function() {
    'use strict';

    angular
        .module('tracking.api.host')
        .factory('TrackingHostRestInterceptor', TrackingHostRestInterceptor)
        .config(configureInterceptor);

    TrackingHostRestInterceptor.$inject = ['$q', 'API_HOST_CONSTANTS'];
    function TrackingHostRestInterceptor($q, HOST) {
        var interceptor = {
            request: requestInterceptor
        };
        return interceptor;

        ////////////////////////////////////////////

        function requestInterceptor(config) {
            if (!_.startsWith(config.url, HOST.URL + '/rest/1/tracking')) {
                return config;
            }

            return angular.extend(config, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
        }
    }

    configureInterceptor.$inject = ['$httpProvider'];
    function configureInterceptor($httpProvider) {
        $httpProvider.interceptors.push('TrackingHostRestInterceptor');
    }
})();