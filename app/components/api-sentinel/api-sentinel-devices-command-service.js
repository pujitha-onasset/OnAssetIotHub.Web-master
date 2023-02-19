(function() {
    'use strict';

    angular
        .module('api-sentinel')
        .factory('DeviceCommandsService', DeviceCommandsService);

    DeviceCommandsService.$inject = ['$resource', 'SENTINEL_API_HOST_CONSTANTS'];
    function DeviceCommandsService($resource, HOST) {
        var api = $resource(HOST.URL + '/rest/1/admin/commands/', {}, {
            getAll: { method: 'GET', params: { clientId: '@clientId', deviceId: '@deviceId' }, url: HOST.URL + '/rest/1/admin/commands/getAll', isArray: true},
            getPending: { method: 'GET', params: { clientId: '@clientId', deviceId: '@deviceId' }, url: HOST.URL + '/rest/1/admin/commands/getPending', isArray: true},
            cancelCommand: { method: 'DELETE', 
            params: { clientId: '@clientId', sentryCommandId: '@sentryCommandId', SentryCommandRequestId: '@SentryCommandRequestId' }, 
            url: HOST.URL + '/rest/1/admin/commands/cancelcommand?clientId=:clientId&sentryCommandId=:sentryCommandId&SentryCommandRequestId=:SentryCommandRequestId'},
            submitCommand: { method: 'POST', params: { clientId: '@clientId', deviceId: '@deviceId' }, url: HOST.URL + '/rest/1/admin/commands/sentrycommand'}
        });

        //decided to return a service definition instead of the resource so that UI developer
        //can be abstracted from details of $resource and request logic can be encapsulated if necessary
        var service = {
            getAll: getAll,
            getPending: getPending,
            cancelCommand: cancelCommand,
            requestDataLog: requestDataLog,
            submitCommand: submitCommand,
            resource: api
        };

        return service;

        function getAll(clientId, deviceId) {
            return api.getAll({ clientId: clientId, deviceId: deviceId });
        }
        function getPending(clientId, deviceId) {
            return api.getPending({ clientId: clientId, deviceId: deviceId });
        }

        function cancelCommand(clientId, commandId, groupCommandId) {
            return api.cancelCommand({ clientId: clientId, sentryCommandId: commandId, SentryCommandRequestId: groupCommandId });
        }

        function requestDataLog(clientId, deviceId) {
            var sentryCommand = {
                command: 'Ota_PutLogs /ErrorLogs all'
            };

            return api.submitCommand({ clientId: clientId, deviceId: deviceId }, sentryCommand);
        }

        function submitCommand(clientId, deviceId, command) {
            var sentryCommand = {
                command: command
            };

            return api.submitCommand({ clientId: clientId, deviceId: deviceId }, sentryCommand);
        }

    }

})();