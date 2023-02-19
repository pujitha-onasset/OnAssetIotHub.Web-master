(function() {
    'use strict';

    angular
        .module('api-rls')
        .factory('DeviceRecoveryService', DeviceRecoveryService);

    DeviceRecoveryService.$inject = ['$resource', 'SENTINEL_API_HOST_CONSTANTS'];

     function DeviceRecoveryService($resource, HOST) {

        var api = $resource(HOST.URL + '/rest/1/devicerecovery', {}, {
            getDeviceRecoveryList: { method: 'GET', params: {fromDate: '@fromDate', toDate: '@toDate'}, url: HOST.URL + '/rest/1/devicerecovery/getDeviceRecoveryList?from=:fromDate&to=:toDate', isArray: true},
            getDeviceRecoveryById: { method: 'GET', params: {deviceRecoveryId: '@deviceRecoveryId'}, url: HOST.URL + '/rest/1/devicerecovery/:deviceRecoveryId'},
            getDeviceRecoveryByToken: { method: 'GET', params: {token: '@token'}, url: HOST.URL + '/rest/1/devicerecovery/getDeviceRecoveryByToken'},
            deleteDeviceRecovery: { method: 'DELETE', params: {deviceRecoveryId: '@deviceRecoveryId'}, url: HOST.URL + '/rest/1/devicerecovery/:deviceRecoveryId'},
            postOAIShipments: { method: 'POST', params: {fromDate: '@fromDate', toDate: '@toDate'}, url: HOST.URL + '/rest/1/devicerecovery/PostCompletedShipments?fromDate=:fromDate&toDate=:toDate' },
            postVisionShipments: { method: 'POST', params: {fromDate: '@fromDate', toDate: '@toDate'},  url: HOST.URL + '/rest/1/devicerecovery/PostCompletedShipmentsFromVision?fromDate=:fromDate&toDate=:toDate' },
            updateDeviceRecoveryByToken: { method: 'PUT', params: {token: '@token'}, url: HOST.URL + '/rest/1/devicerecovery/UpdateDeviceRecovery' },
            updateCompleteDeviceRecovery: { method: 'PUT', params: {accountId: '@accountId', deviceRecoveryId: '@deviceRecoveryId'}, url: HOST.URL + '/rest/1/devicerecovery/UpdateCompleteDeviceRecovery' }
        });

        var service = {
            getDeviceRecoveryList: getDeviceRecoveryList,
            getDeviceRecoveryById: getDeviceRecoveryById,
            getDeviceRecoveryByToken: getDeviceRecoveryByToken,
            deleteDeviceRecovery: deleteDeviceRecovery,
            postOAIShipments: postOAIShipments,
            postVisionShipments: postVisionShipments,
            updateDeviceRecoveryByToken:updateDeviceRecoveryByToken,
            updateCompleteDeviceRecovery:updateCompleteDeviceRecovery
        };

        return service;

        function getDeviceRecoveryList(client, fromDate, toDate, deviceRecoveryListType) {
            if (typeof deviceRecoveryListType == "undefined") {
                deviceRecoveryListType = "recoverylist";
            }
            return api.getDeviceRecoveryList({ accountId:client.id, fromDate: fromDate, toDate: toDate, deviceRecoveryListType: deviceRecoveryListType });
        }

        function getDeviceRecoveryById(deviceRecoveryId) {
            return api.getDeviceRecoveryById({ deviceRecoveryId: deviceRecoveryId });
        }

        function getDeviceRecoveryByToken(token) {
            return api.getDeviceRecoveryByToken({ token: token });
        }

        function deleteDeviceRecovery(deviceRecoveryId) {
            return api.deleteDeviceRecovery({ deviceRecoveryId: deviceRecoveryId });
        }

        function postOAIShipments(fromDate, toDate) {
            return api.postOAIShipments({ fromDate: fromDate, toDate: toDate });
        }

        function postVisionShipments(fromDate, toDate) {
            return api.postVisionShipments({ fromDate: fromDate, toDate: toDate });
        }

        function updateDeviceRecoveryByToken(token) {
            return api.updateDeviceRecoveryByToken({ token: token });
        }

        function updateCompleteDeviceRecovery(client, deviceRecoveryId) {
            return api.updateCompleteDeviceRecovery({ accountId:client.id, deviceRecoveryId: deviceRecoveryId });
        }

    }

})();
