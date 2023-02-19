(function() {
    'use strict';

    angular
        .module('api-sentinel')
        .factory('DeviceGroupsService', DeviceGroupsService);

    DeviceGroupsService.$inject = ['$resource', 'SENTINEL_API_HOST_CONSTANTS'];
    function DeviceGroupsService($resource, HOST) {
        var api = $resource(HOST.URL + '/rest/1/devicegroups', {}, {
            addGroup: { method: 'POST', params: { clientGuid: '@clientGuid'}},
            getGroups: { method: 'GET', params: { clientGuid: '@clientGuid'}, isArray: true},
            getGroupsByAccountId: { method: 'GET', params: { accountId: '@accountId'}, url: HOST.URL + '/rest/1/devicegroups/GetDeviceGroupsByAccountId', isArray: true},
            getGroup: { method: 'GET', params: { groupId: '@groupId'}, url: HOST.URL + '/rest/1/devicegroups/:groupId'},
            updateGroup: { method: 'PUT', params: { groupId: '@groupId' }, url: HOST.URL + '/rest/1/devicegroups/:groupId'},
            removeGroup: { method: 'DELETE', params: { groupId: '@groupId',accountId:'@accountId' }, url: HOST.URL + '/rest/1/devicegroups/:groupId'},
            addDeviceToGroup: { method: 'POST', params: { groupId: '@groupId', deviceTagId: '@deviceTagId',accountId:'@accountId' }, url: HOST.URL + '/rest/1/devicegroups/:groupId/devices/:deviceTagId?accountId=:accountId', isArray: true },
            getDevices: { method: 'GET', params: { groupId: '@groupId' }, url: HOST.URL + '/rest/1/devicegroups/:groupId/devices', isArray: true },
            getForwarding: { method: 'GET', params: { groupId: '@groupId'}, url: HOST.URL + '/rest/1/devicegroups/:groupId/forwarding' },
            addForwarding: { method: 'POST', params: { groupId: '@groupId',accountId:'@accountId'}, url: HOST.URL + '/rest/1/devicegroups/:groupId/forwarding?accountId=:accountId' },
            changeForwarding: { method: 'PUT', params: { groupId: '@groupId',accountId:'@accountId'}, url: HOST.URL + '/rest/1/devicegroups/:groupId/forwarding?accountId=:accountId' },
            clearForwarding: { method: 'DELETE', params: { groupId: '@groupId',accountId:'@accountId'}, url: HOST.URL + '/rest/1/devicegroups/:groupId/forwarding?accountId=:accountId' },
            moveDevices: { method: 'POST', params: { sourceGroupId: '@sourceGroupId', targetGroupId: '@targetGroupId',accountId:'@accountId'}, url: HOST.URL + '/rest/1/devicegroups/:sourceGroupId/moveDevicesTo/:targetGroupId?accountId=:accountId', isArray: true }
        });

        //decided to return a service definition instead of the resource so that UI developer
        //can be abstracted from details of $resource and request logic can be encapsulated if necessary
        var service = {
            addGroup: addGroup,
            getGroups: getGroups,
            getGroupsByAccountId: getGroupsByAccountId,
            getGroup: getGroup,
            updateGroup: updateGroup,
            removeGroup: removeGroup,
            addDeviceToGroup: addDeviceToGroup,
            getDevices: getDevices,
            getForwarding: getForwarding,
            addForwarding: addForwarding,
            changeForwarding: changeForwarding,
            clearForwarding: clearForwarding,
            moveDevices: moveDevices,
            resource: api
        };

        return service;

        function addGroup(client, group) {
            return api.addGroup({ accountId: client.id }, group);
        }

        function getGroups(client) {
            return api.getGroups({ accountId: client.id });
        }

        function getGroupsByAccountId(client) {
            return api.getGroupsByAccountId({ accountId: client.id });
        }

        function getGroup(client,groupId) {
            return api.getGroup({ accountId: client.id, groupId: groupId });
        }

        function updateGroup(group) {
            return api.updateGroup({ groupId: group.id }, group);
        }

        function removeGroup(client,group) {
            return api.removeGroup({ accountId:client.id, groupId: group.id });
        }

        function addDeviceToGroup(client,group, device) {
            return api.addDeviceToGroup({ accountId: client.id, groupId: group.id, deviceTagId: device.deviceTagId });
        }

        function getDevices(client,group) {
            return api.getDevices({  accountId: client.id, groupId: group.id });
        }

        function getForwarding(client, group) {
            return api.getForwarding({ accountId: client.id, groupId: group.id });
        }

        function addForwarding(client, group, config) {
            return api.addForwarding({ accountId: client.id, groupId: group.id }, config);
        }

        function changeForwarding(client, group, config) {
            return api.changeForwarding({ accountId: client.id, groupId: group.id }, config);
        }

        function clearForwarding(client, group) {
            return api.clearForwarding({accountId: client.id, groupId: group.id });
        }

        function moveDevices(client,sourceGroup, targetGroup) {
            return api.moveDevices({ accountId: client.id, sourceGroupId: sourceGroup.id, targetGroupId: targetGroup.id });
        }

    }

})();