(function() {
    'use strict';

    angular
        .module('api-sentinel')
        .factory('AlarmCalibrationService', AlarmCalibrationService);

    AlarmCalibrationService.$inject = ['$resource', 'SENTINEL_API_HOST_CONSTANTS'];
    function AlarmCalibrationService($resource, HOST) {
        var api = $resource(HOST.URL + '/rest/1/alarmcalibration', {}, {
            getAlarmCalibration: { method: 'GET', params: {clientGuid: '@clientGuid'},url: HOST.URL + '/rest/1/alarmcalibration?accountId=:clientGuid', isArray: true},
            create: { method: 'POST', params: { clientGuid: '@clientGuid' }, url: HOST.URL + '/rest/1/alarmcalibration?accountId=:clientGuid' },
            update: { method: 'PUT', params: { clientGuid: '@clientGuid' }, url: HOST.URL + '/rest/1/alarmcalibration?accountId=:clientGuid' }
        });

        //decided to return a service definition instead of the resource so that UI developer
        //can be abstracted from details of $resource and request logic can be encapsulated if necessary
        var service = {
            getAlarmCalibration: getAlarmCalibration,
            create: create,
            update: update,
            resource: api
        };

        return service;

        function getAlarmCalibration(client) {
            return api.getAlarmCalibration({ clientGuid: client.id });
        }

        function create(client, data) {
            return api.create({ clientGuid: client.id }, data);
        }

        function update(client, data) {
            return api.update({ clientGuid: client.id }, data);
        }

    }

})();