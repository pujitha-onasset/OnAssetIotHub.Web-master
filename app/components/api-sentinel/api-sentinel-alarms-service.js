(function() {
    'use strict';

    angular
        .module('api-sentinel')
        .factory('AlarmsService', AlarmsService);

    AlarmsService.$inject = ['$resource', 'SENTINEL_API_HOST_CONSTANTS'];
    function AlarmsService($resource, HOST) {
        var api = $resource(HOST.URL + '/rest/1/alarms', {}, {
            getAlarms: { method: 'GET', isArray: true},
            getAlarmsAccount: { method: 'GET', isArray: true,url: HOST.URL + '/rest/1/alarms/getAlarms'},
            getAlarmsDevice: { method: 'GET', params: { deviceTagId: '@deviceTagId'}, isArray: true, url: HOST.URL + '/rest/1/alarms/{deviceTagId}/getAlarms'},
            getAlarmsForSentinel: { method: 'GET', params: { deviceTagId: '@deviceTagId'}, isArray: true, url: HOST.URL + '/rest/1/alarms/{deviceTagId}/getAlarmsForSentinel'},
            getAlarm: { method: 'GET', params: { alarmId: '@alarmId'}, url: HOST.URL + '/rest/1/alarms/:alarmId'},
            putAlarm: { method: 'PUT', params: { alarmId: '@alarmId' }, url: HOST.URL + '/rest/1/alarms/:alarmId'},
            addAlarm: { method: 'POST', url: HOST.URL + '/rest/1/alarms'},
            removeAlarm: { method: 'DELETE', params: { alarmId: '@alarmId' }, url: HOST.URL + '/rest/1/alarms/:alarmId'},
            getRules: { method: 'GET', params: { alarmId: '@alarmId'}, url: HOST.URL + '/rest/1/alarms/:alarmId/rules', isArray: true},
            getRule: { method: 'GET', params: { alarmId: '@alarmId', ruleId: '@ruleId'}, url: HOST.URL + '/rest/1/alarms/:alarmId/rules/:ruleId'},
            addRule: { method: 'POST', params: { alarmId: '@alarmId'}, url: HOST.URL + '/rest/1/alarms/:alarmId/rules'},
            updateRule: { method: 'PUT', params: { alarmId: '@alarmId', ruleId: '@ruleId'}, url: HOST.URL + '/rest/1/alarms/:alarmId/rules/:ruleId'},
            getConfigAction: { method: 'GET', params: { alarmId: '@alarmId'}, url: HOST.URL + '/rest/1/alarms/:alarmId/configaction' },
            changeConfigAction: { method: 'PUT', params: { alarmId: '@alarmId'}, url: HOST.URL + '/rest/1/alarms/:alarmId/configaction' },
            removeConfigAction: { method: 'DELETE', params: { alarmId: '@alarmId'}, url: HOST.URL + '/rest/1/alarms/:alarmId/configaction'},
            getDevices: {  method: 'GET', params: { alarmId: '@alarmId'}, url: HOST.URL + '/rest/1/alarms/:alarmId/devices/sentries', isArray: true },
            addDevice: { method: 'POST', params: { alarmId: '@alarmId', deviceTagId: '@deviceTagId'}, url: HOST.URL + '/rest/1/alarms/:alarmId/devices/:deviceTagId/sentry', isArray: true},
            removeDevice: { method: 'DELETE', params: { alarmId: '@alarmId', deviceTagId: '@deviceTagId'}, url: HOST.URL + '/rest/1/alarms/:alarmId/devices/:deviceTagId/sentry', isArray: true},
            getSubscribers: {  method: 'GET', params: { alarmId: '@alarmId'}, url: HOST.URL + '/rest/1/alarms/:alarmId/subscribers', isArray: true },
            addSubscriber: { method: 'POST', params: { alarmId: '@alarmId', contactId: '@contactId'}, url: HOST.URL + '/rest/1/alarms/:alarmId/subscribers/:contactId', isArray: true},
            removeSubscriber: { method: 'DELETE', params: { alarmId: '@alarmId', contactId: '@contactId'}, url: HOST.URL + '/rest/1/alarms/:alarmId/subscribers/:contactId', isArray: true},
            getSentinels: {  method: 'GET', params: { alarmId: '@alarmId'}, url: HOST.URL + '/rest/1/alarms/:alarmId/devices/sentinels', isArray: true },
            addSentinel: { method: 'POST', params: { alarmId: '@alarmId', deviceId: '@deviceId'}, url: HOST.URL + '/rest/1/alarms/:alarmId/devices/:deviceId/sentinel', isArray: true},
            removeSentinel: { method: 'DELETE', params: { alarmId: '@alarmId', deviceTagId: '@deviceTagId'}, url: HOST.URL + '/rest/1/alarms/:alarmId/devices/:deviceTagId/sentinel', isArray: true},
        });

        //decided to return a service definition instead of the resource so that UI developer
        //can be abstracted from details of $resource and request logic can be encapsulated if necessary
        var service = {
            addAlarm: addAlarm,
            getAlarms: getAlarms,
            getAlarmsAccount: getAlarmsAccount,
            getAlarmsDevice: getAlarmsDevice,
            getAlarm: getAlarm,
            putAlarm: putAlarm,
            removeAlarm: removeAlarm,
            addRule: addRule,
            getRules: getRules,
            getRule: getRule,
            updateRule: updateRule,
            getConfigAction: getConfigAction,
            changeConfigAction: changeConfigAction,
            removeConfigAction: removeConfigAction,
            getDevices: getDevices,
            addDevice: addDevice,
            removeDevice: removeDevice,
            getSubscribers: getSubscribers,
            addSubscriber: addSubscriber,
            removeSubscriber: removeSubscriber,
            resource: api,
            getSentinels: getSentinels,
            addSentinel: addSentinel,
            removeSentinel: removeSentinel,
            getAlarmsForSentinel: getAlarmsForSentinel,
        };

        return service;

        function getAlarms(client) {
            return api.getAlarms({ clientGuid: client.id });
        }

        function getAlarmsAccount(client) {
            return api.getAlarmsAccount({ clientGuid: client.id });
        }

        function getAlarmsDevice(deviceTagId) {
            return api.getAlarmsDevice({ deviceTagId: deviceTagId });
        }

        function getAlarmsForSentinel(deviceTagId) {
            return api.getAlarmsForSentinel({ deviceTagId: deviceTagId });
        }

        function getAlarm(alarmId) {
            return api.getAlarm({ alarmId: alarmId });
        }

        function putAlarm(alarm) {
            return api.putAlarm({ alarmId: alarm.alarmId }, alarm);
        }

        function removeAlarm(alarm) {
            return api.removeAlarm({ alarmId: alarm.alarmId });
        }

        function addAlarm(client, alarm) {
            return api.addAlarm({ clientGuid: client.id }, alarm);
        }

        function getRules(alarm) {
            return api.getRules({ alarmId: alarm.alarmId });
        }

        function getRule(alarm, rule) {
            return api.getRule({ alarmId: alarm.alarmId, ruleId: rule.ruleId });
        }

        function updateRule(alarm, rule) {
            return api.updateRule({ alarmId: alarm.alarmId, ruleId: rule.ruleId }, rule);
        }

        function addRule(alarm, rule) {
            return api.addRule({ alarmId: alarm.alarmId }, rule);
        }

        function getConfigAction(alarm) {
            return api.getConfigAction({alarmId: alarm.alarmId});
        }

        function changeConfigAction(alarm, config) {
            return api.changeConfigAction({alarmId: alarm.alarmId}, config);
        }

        function removeConfigAction(alarm) {
            return api.removeConfigAction({alarmId: alarm.alarmId});
        }

        function getDevices(client, alarm) {
            return api.getDevices({ accountId: client.id, alarmId: alarm.alarmId });
        }

        function addDevice(alarm, device) {
            return api.addDevice({ alarmId: alarm.alarmId, deviceTagId: device.imei });
        }

        function removeDevice(alarm, device) {
            return api.removeDevice({ alarmId: alarm.alarmId, deviceTagId: device.deviceTagId });
        }

        function getSubscribers(alarm) {
            return api.getSubscribers({ alarmId: alarm.alarmId });
        }

        function addSubscriber(alarm, contact) {
            return api.addSubscriber({ alarmId: alarm.alarmId, contactId: contact.contactId });
        }

        function removeSubscriber(alarm, contact) {
            return api.removeSubscriber({ alarmId: alarm.alarmId, contactId: contact.contactId });
        }

        function getSentinels(client, alarm) {
            return api.getSentinels({ accountId: client.id, alarmId: alarm.alarmId });
        }

        function addSentinel(alarm, sentinel) {
            return api.addSentinel({ alarmId: alarm.alarmId, deviceId: sentinel.deviceId });
        }

        function removeSentinel(alarm, sentinel) {
            return api.removeSentinel({ alarmId: alarm.alarmId, deviceTagId: sentinel.deviceTagId });
        }
    }

})();