(function() {
    'use strict';

    angular
        .module('api-sentinel')
        .factory('AlarmContactsService', AlarmContactsService);

    AlarmContactsService.$inject = ['$resource', 'SENTINEL_API_HOST_CONSTANTS'];
    function AlarmContactsService($resource, HOST) {
        var api = $resource(HOST.URL + '/rest/1/alarmcontacts', {}, {
            getContacts: { method: 'GET', isArray: true},
            getContact: { method: 'GET', params: { contactId: '@contactId'}, url: HOST.URL + '/rest/1/alarmcontacts/:contactId'},
            getContactsForClient: { method: 'GET', params: { clientGuid: '@clientGuid'}, url: HOST.URL + '/rest/1/alarmcontacts/GetAlarmContactsForClient',isArray: true},
            changeContact: { method: 'PUT', params: { contactId: '@contactId' }, url: HOST.URL + '/rest/1/alarmcontacts/:contactId'},
            removeContact: { method: 'DELETE', params: { contactId: '@contactId' }, url: HOST.URL + '/rest/1/alarmcontacts/:contactId'},
            addContact: { method: 'POST', params: { clientGuid: '@clientGuid' } },
            getSubscriptions: { method: 'GET', params: { contactId: '@contactId'}, url: HOST.URL + '/rest/1/alarmcontacts/:contactId/subscriptions', isArray: true}
        });

        //decided to return a service definition instead of the resource so that UI developer
        //can be abstracted from details of $resource and request logic can be encapsulated if necessary
        var service = {
            getContacts: getContacts,
            getContactsForClient: getContactsForClient,
            getContact: getContact,
            changeContact: changeContact,
            removeContact: removeContact,
            addContact: addContact,
            getSubscriptions: getSubscriptions,
            resource: api
        };

        return service;

        function getContacts() {
            return api.getContacts();
        }

        function getContactsForClient(client) {
            return api.getContactsForClient({ clientGuid: client.id });
        }

        function getContact(contactId) {
            return api.getContact({ contactId: contactId });
        }

        function changeContact(contact) {
            return api.changeContact({ contactId: contact.contactId }, contact);
        }

        function removeContact(contact) {
            return api.removeContact({ contactId: contact.contactId });
        }

        function addContact(client, contact) {
            return api.addContact({ clientGuid: client.id }, contact);
        }

        function getSubscriptions(contact) {
            return api.getSubscriptions({ contactId: contact.contactId });
        }
    }

})();