(function() {
    'use strict';

    angular
        .module('api-rls')
        .factory('BranchContactService', BranchContactService);

    BranchContactService.$inject = ['$resource', 'SENTINEL_API_HOST_CONSTANTS'];

     function BranchContactService($resource, HOST) {

        var api = $resource(HOST.URL + '/rest/1/branch/', {}, {
            saveBranchContact: { method: 'POST', params: {branchId: '@branchId'}, url: HOST.URL + '/rest/1/branch/:branchId/people' },
            getBranchContacts: { method: 'GET', params: {branchId: '@branchId'},  url: HOST.URL + '/rest/1/branch/:branchId/people/getBranchContactList', isArray: true},
            getBranchContact: { method: 'GET', params: { branchId: '@branchId', branchContactId: '@branchContactId'}, url: HOST.URL + '/rest/1/branch/:branchId/people/:branchContactId'},
            updateBranchContact: { method: 'PUT', params: { branchId: '@branchId'}, url: HOST.URL + '/rest/1/branch/:branchId/people'},
            removeBranchContact: { method: 'DELETE', params: { branchId:'@branchId', branchContactId: '@branchContactId' }, url: HOST.URL + '/rest/1/branch/:branchId/people/:branchContactId'}
        });

        //decided to return a service definition instead of the resource so that UI developer
        //can be abstracted from details of $resource and request logic can be encapsulated if necessary
        var service = {
            saveBranchContact: saveBranchContact,
            getBranchContacts: getBranchContacts,
            getBranchContact: getBranchContact,
            updateBranchContact: updateBranchContact,
            removeBranchContact: removeBranchContact,
            resource: api
        };

        return service;

        function saveBranchContact(client, branchcontact) {
            return api.saveBranchContact({ clientGuid: client.id, branchId:branchcontact.branchId }, branchcontact);
        }

        function getBranchContacts(client, branchId) {
            return api.getBranchContacts({ clientGuid: client.id,branchId:branchId });
        }

        function getBranchContact(client, branchId,branchContactId) {
            return api.getBranchContact({ clientGuid: null, branchId: branchId, branchContactId:branchContactId });
        }

        function updateBranchContact(client, branchcontact) {
            return api.updateBranchContact({clientGuid: client.id, branchId: branchcontact.branchId }, branchcontact);
        }

        function removeBranchContact(client, branchId,branchContactId) {
            return api.removeBranchContact({ clientGuid: client.id, branchId: branchId,branchContactId:branchContactId });
        }

    }

})();
