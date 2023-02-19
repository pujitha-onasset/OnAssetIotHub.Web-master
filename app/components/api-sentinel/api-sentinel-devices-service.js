(function() {
    'use strict';

    angular
        .module('api-sentinel')
        .factory('DevicesService', DevicesService);

    DevicesService.$inject = ['$resource', 'SENTINEL_API_HOST_CONSTANTS'];
    function DevicesService($resource, HOST) {
        var api = $resource(HOST.URL + '/rest/1/devices', {}, {
            getDevices: { method: 'GET', isArray: true},
            getDevice: { method: 'GET', params: { deviceTagId: '@deviceTagId'}, url: HOST.URL + '/rest/1/devices/:deviceTagId'},
            putDevice: { method: 'PUT', params: { deviceTagId: '@deviceTagId' }, url: HOST.URL + '/rest/1/devices/:deviceTagId'},
            getAlarms: { method: 'GET', params: { deviceTagId: '@deviceTagId' }, url: HOST.URL + '/rest/1/alarms/:deviceTagId/getAlarms', isArray: true },
            getAlarmsForShipment: { method: 'GET', params: { shipmentId: '@shipmentId' }, url: HOST.URL + '/rest/1/alarms/:shipmentId/GetAlarmsForShipment', isArray: true },
            addAlarm: { method: 'POST', params: { alarmId: '@alarmId', deviceTagId: '@deviceTagId', shipmentId: '@shipmentId' }, url: HOST.URL + '/rest/1/alarms/:alarmId/devices/:deviceTagId/AddSentryToAlarmShipmentById?shipmentId=:shipmentId', isArray: true},
            addAlarmSentinel: { method: 'POST', params: { alarmId: '@alarmId', deviceTagId: '@deviceTagId', shipmentId: '@shipmentId' }, url: HOST.URL + '/rest/1/alarms/:alarmId/devices/:deviceTagId/AddSentinelToAlarmShipmentById?shipmentId=:shipmentId', isArray: true},
            removeAlarm: { method: 'DELETE', params: { alarmId: '@alarmId', deviceTagId: '@deviceTagId', shipmentId: '@shipmentId'}, url: HOST.URL + '/rest/1/alarms/:alarmId/devices/:deviceTagId/DeleteSentryDeviceByAlarmById?shipmentId=:shipmentId', isArray: true},
            removeAlarmSentinel: { method: 'DELETE', params: { alarmId: '@alarmId', deviceTagId: '@deviceTagId', shipmentId: '@shipmentId'}, url: HOST.URL + '/rest/1/alarms/:alarmId/devices/:deviceTagId/DeleteSentinelDeviceByAlarmById?shipmentId=:shipmentId', isArray: true},
            getCheckInLog: { method: 'GET', params: { deviceTagId: '@deviceTagId' }, url: HOST.URL + '/rest/1/devices/:deviceTagId/checkinlog', isArray: true },
            getClient: { method: 'GET', params: { deviceTagId: '@deviceTagId' }, url: HOST.URL + '/rest/1/devices/:deviceTagId/client'},
            getDeviceGroup: { method: 'GET', params: { deviceTagId: '@deviceTagId' }, url: HOST.URL + '/rest/1/devices/:deviceTagId/devicegroup'},
            changeGroup: { method: 'POST', params: { deviceTagId: '@deviceTagId', groupId: '@groupId' }, url: HOST.URL + '/rest/1/devicegroups/:groupId/devices/:deviceTagId', isArray: true },
            getDeviceRegistration: { method: 'GET', params: { deviceTagId: '@deviceTagId'}, url: HOST.URL + '/rest/1/devices/:deviceTagId/registration'},
            search: { method: 'GET', url: HOST.URL + '/rest/1/search/devices', isArray: true},
            addDevice:  { method: 'POST', url: HOST.URL + '/rest/1/devices'}
        });

        //decided to return a service definition instead of the resource so that UI developer
        //can be abstracted from details of $resource and request logic can be encapsulated if necessary
        var service = {
            addAlarm: addAlarm,
            addAlarmSentinel:addAlarmSentinel,
            getAlarms: getAlarms,
            getAlarmsForShipment: getAlarmsForShipment,
            getCheckInLog: getCheckInLog,
            getDevice: getDevice,
            getDeviceRegistration: getDeviceRegistration,
            getDevices: getDevices,
            putDevice: putDevice,
            removeAlarm: removeAlarm,
            removeAlarmSentinel: removeAlarmSentinel,
            getClient: getClient,
            getDeviceGroup: getDeviceGroup,
            changeGroup: changeGroup,
            search: search,
            addDevice: addDevice,
            resource: api
        };

        return service;

        function getDevices(client) {
            return api.getDevices({ clientGuid: client.clientGuid });
        }

        function getDevice(deviceTagId) {
            return api.getDevice({ deviceTagId: deviceTagId });
        }

        function getDeviceRegistration(device) {
            return api.getDeviceRegistration({ deviceTagId: device.deviceTagId });
        }

        function putDevice(device) {
            return api.putDevice({ deviceTagId: device.deviceTagId }, device);
        }

        function getCheckInLog(device) {
            return api.getCheckInLog({ deviceTagId: device.deviceTagId });
        }

        function getAlarms(device) {
            return api.getAlarms({ deviceTagId: device.imei });
        }

        function getAlarmsForShipment(shipmentID) {
            return api.getAlarmsForShipment({ shipmentId: shipmentID });
        }

        function addAlarm(device, alarm, shipmentID) {
            console.log("shipmentID",shipmentID);
            return api.addAlarm({alarmId: alarm.alarmId, deviceTagId: device.imei, shipmentId: shipmentID });
        }

        function addAlarmSentinel(device, alarm, shipmentID) {
            console.log("shipmentID",shipmentID);
            return api.addAlarmSentinel({alarmId: alarm.alarmId, deviceTagId: device.deviceId, shipmentId: shipmentID });
        }

        function removeAlarm(device, alarm, shipmentID) {
            return api.removeAlarm({alarmId: alarm.alarmId, deviceTagId: device.imei, shipmentId: shipmentID });
        }

         function removeAlarmSentinel(device, alarm, shipmentID) {
            return api.removeAlarmSentinel({alarmId: alarm.alarmId, deviceTagId: device.deviceId, shipmentId: shipmentID });
        }

        function getClient(device) {
            return api.getClient({ deviceTagId: device.deviceTagId });
        }

        function getDeviceGroup(device) {
            return api.getDeviceGroup({ deviceTagId: device.deviceTagId });
        }

        function changeGroup(device, group) {
            return api.changeGroup({ deviceTagId: device.deviceTagId, groupId: group.groupId });
        }

        function search(pattern) {
            return api.search({ pattern: pattern });
        }

        function addDevice(imei, name) {
            return api.addDevice({ imei: imei, name: name });
        }

    }

})();