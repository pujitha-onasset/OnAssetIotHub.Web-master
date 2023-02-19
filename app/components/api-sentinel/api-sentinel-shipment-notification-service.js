(function() {
    'use strict';

    angular
        .module('api-sentinel')
        .factory('ShipmentNotificationsService', ShipmentNotificationsService);

    ShipmentNotificationsService.$inject = ['$resource', 'SENTINEL_API_HOST_CONSTANTS'];
    function ShipmentNotificationsService($resource, HOST) {
        var api = $resource(HOST.URL + '/rest/1/shipmentnotifications', {}, {
            getNotifications: { method: 'GET', params: { clientGuid: '@clientGuid'}, url: HOST.URL + '/rest/1/shipmentnotifications/:clientGuid', isArray: true},
            getArrival: { method: 'GET', params: { clientGuid: '@clientGuid'}, url: HOST.URL + '/rest/1/shipmentnotifications/:clientGuid/stoparrival'},
            updateArrival: { method: 'PUT', params: { clientGuid: '@clientGuid'}, url: HOST.URL + '/rest/1/shipmentnotifications/:clientGuid/stoparrival'},
            getCompleted: { method: 'GET', params: { clientGuid: '@clientGuid'}, url: HOST.URL + '/rest/1/shipmentnotifications/:clientGuid/shipmentcompleted'},
            updateCompleted: { method: 'PUT', params: { clientGuid: '@clientGuid'}, url: HOST.URL + '/rest/1/shipmentnotifications/:clientGuid/shipmentcompleted'},
            getCreated: { method: 'GET', params: { clientGuid: '@clientGuid'}, url: HOST.URL + '/rest/1/shipmentnotifications/:clientGuid/shipmentcreated'},
            updateCreated: { method: 'PUT', params: { clientGuid: '@clientGuid'}, url: HOST.URL + '/rest/1/shipmentnotifications/:clientGuid/shipmentcreated'},
            getDeparture: { method: 'GET', params: { clientGuid: '@clientGuid'}, url: HOST.URL + '/rest/1/shipmentnotifications/:clientGuid/stopdeparture'},
            updateDeparture: { method: 'PUT', params: { clientGuid: '@clientGuid'}, url: HOST.URL + '/rest/1/shipmentnotifications/:clientGuid/stopdeparture'},
            getOverdue: { method: 'GET', params: { clientGuid: '@clientGuid'}, url: HOST.URL + '/rest/1/shipmentnotifications/:clientGuid/shipmentoverdue'},
            updateOverdue: { method: 'PUT', params: { clientGuid: '@clientGuid'}, url: HOST.URL + '/rest/1/shipmentnotifications/:clientGuid/shipmentoverdue'},
            getContacts: { method: 'GET', params: { clientGuid: '@clientGuid'}, url: HOST.URL + '/rest/1/shipmentnotificationcontacts/:clientGuid', isArray: true},
            getContact: { method: 'GET', params: { clientGuid: '@clientGuid', contactGuid: '@contactGuid'}, url: HOST.URL + '/rest/1/shipmentnotificationcontacts/:clientGuid/:contactGuid'},
            updateContact: { method: 'PUT', params: { clientGuid: '@clientGuid', contactGuid: '@contactGuid'}, url: HOST.URL + '/rest/1/shipmentnotificationcontacts/:clientGuid/:contactGuid'},
            addContact: { method: 'POST', params: { clientGuid: '@clientGuid'}, url: HOST.URL + '/rest/1/shipmentnotificationcontacts/:clientGuid'},
            removeContact: { method: 'DELETE', params: { clientGuid: '@clientGuid', contactGuid: '@contactGuid'}, url: HOST.URL + '/rest/1/shipmentnotificationcontacts/:clientGuid/:contactGuid'}
        });

        //decided to return a service definition instead of the resource so that UI developer
        //can be abstracted from details of $resource and request logic can be encapsulated if necessary
        var service = {
            getNotifications: getNotifications,
            getArrival: getArrival,
            updateArrival: updateArrival,
            getCompleted: getCompleted,
            updateCompleted: updateCompleted,
            getCreated: getCreated,
            updateCreated: updateCreated,
            getDeparture: getDeparture,
            updateDeparture: updateDeparture,
            getOverdue: getOverdue,
            updateOverdue: updateOverdue,
            getContacts: getContacts,
            getContact: getContact,
            updateContact: updateContact,
            addContact: addContact,
            removeContact: removeContact,
            resource: api
        };

        return service;

        function getNotifications(client) {
            return api.getNotifications({ clientGuid: client.clientGuid });
        }

        function getArrival(client) {
            return api.getArrival({ clientGuid: client.clientGuid });
        }

        function updateArrival(client, notification) {
            return api.updateArrival({ clientGuid: client.clientGuid }, notification);
        }

        function getCompleted(client) {
            return api.getCompleted({ clientGuid: client.clientGuid });
        }

        function updateCompleted(client, notification) {
            return api.updateCompleted({ clientGuid: client.clientGuid }, notification);
        }

        function getCreated(client) {
            return api.getCreated({ clientGuid: client.clientGuid });
        }

        function updateCreated(client, notification) {
            return api.updateCreated({ clientGuid: client.clientGuid }, notification);
        }

        function getDeparture(client) {
            return api.getDeparture({ clientGuid: client.clientGuid });
        }

        function updateDeparture(client, notification) {
            return api.updateDeparture({ clientGuid: client.clientGuid }, notification);
        }

        function getOverdue(client) {
            return api.getOverdue({ clientGuid: client.clientGuid });
        }

        function updateOverdue(client, notification) {
            return api.updateOverdue({ clientGuid: client.clientGuid }, notification);
        }

        function getContacts(client) {
            return api.getContacts({ clientGuid: client.clientGuid });
        }

        function getContact(client, contactId) {
            return api.getContact({ clientGuid: client.clientGuid, contactGuid: contactId });
        }

        function updateContact(client, contact) {
            return api.updateContact({ clientGuid: client.clientGuid, contactGuid: contact.id }, contact);
        }

        function addContact(client, contact) {
            return api.addContact({ clientGuid: client.clientGuid }, contact);
        }

        function removeContact(client, contact) {
            return api.removeContact({ clientGuid: client.clientGuid, contactGuid: contact.id });
        }


    }

})();