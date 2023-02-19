//TODO: see about using a interceptor option with a custom interceptor for these calls to handle the headers for example

(function() {
    'use strict';

    angular
        .module('api-sentinel')
        .factory('SentinelAuthenticationService', SentinelAuthenticationService);

    SentinelAuthenticationService.$inject = ['$resource', 'SENTINEL_API_HOST_CONSTANTS'];
    function SentinelAuthenticationService($resource, HOST) {
        var apiHeaders = {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        };

        var api = $resource(HOST.URL + '/token', {}, {
            postWithClientCredentials: { method: 'POST', headers: apiHeaders },
            postWithResourceOwner: { method: 'POST', headers: apiHeaders }
        });

        var service = {
            getTokenUsingClientCredentials: getTokenUsingClientCredentials,
            getTokenUsingResourceOwner: getTokenUsingResourceOwner
        };

        return service;

        function getTokenUsingClientCredentials(clientId, clientSecret) {
            var params = {
                grant_type: 'client_credentials',
                client_id: clientId,
                client_secret: clientSecret
            };

            return api.postWithClientCredentials($.param(params));
        }

        function getTokenUsingResourceOwner(username, password) {
            var params = {
                grant_type: 'password',
                username: username,
                password: password
            };

            return api.postWithResourceOwner($.param(params));
        }
    }

})();