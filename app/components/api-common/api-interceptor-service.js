(function () {
    'use strict';

    angular
        .module('api-common')
        .factory('ApiInterceptorService', ApiInterceptorService)
        .config(configureInterceptor);

    ApiInterceptorService.$inject = ['SENTINEL_API_HOST_CONSTANTS', 'ApiToken', 'localStorageService'];
    function ApiInterceptorService(HOST, ApiToken, localStorageService) {
        var interceptor = {
            request: requestInterceptor
        };
        return interceptor;

        function requestInterceptor(config) {
            if (!_.startsWith(config.url, HOST.URL + '/rest/')) {
                return config;
            }
            if (_.startsWith(config.url, HOST.URL + '/rest/1/devicerecovery/getDeviceRecoveryByToken')) {
                return config;
            }
            if (_.startsWith(config.url, HOST.URL + '/rest/1/devicerecovery/UpdateDeviceRecovery')) {
                 return config;
            }

            if (_.startsWith(config.url, HOST.VISION_URL)) {
                return config;
            }

            var apiToken = null;

            if (localStorageService.get('isRlsRoute')) {
                apiToken = ApiToken.getRlsToken();
            } else {
                apiToken = ApiToken.get();
            }

            return angular.extend(config, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': apiToken.type + ' ' + apiToken.token
                }
            });
        }
    }

    configureInterceptor.$inject = ['$httpProvider'];
    function configureInterceptor($httpProvider) {
        $httpProvider.interceptors.push('ApiInterceptorService');
    }
})();