(function () {
    'use strict';

    angular
        .module('api-sentinel')
        .factory('SentinelExceptionApiService', SentinelExceptionApiService);

    SentinelExceptionApiService.$inject = ['$resource', 'SENTINEL_API_HOST_CONSTANTS'];
    function SentinelExceptionApiService($resource, HOST) {

        var api = $resource(HOST.URL + '/rest/1/exceptions', {}, {
            getException: {  method: 'GET', params: { imei: '@id'}, url: HOST.URL + '/rest/1/exceptions/:id'},
            getExceptions: {  method: 'GET', url: HOST.URL + '/rest/1/exceptions', isArray: true }
        });

        var service = {
            getException: getException,
            getExceptions: getExceptions
        };
        return service;

        //////////////////////////////////////////////////////////////////////////////////////////////////////

        function getException(id) {
            return api.getException({ id: id });
        }

        function getExceptions() {
            return api.getExceptions();
        }
    }

})();