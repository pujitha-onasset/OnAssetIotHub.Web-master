(function() {
    'use strict';

    angular
        .module('api-sentinel')
        .factory('ClientsService', ClientsService);

    ClientsService.$inject = ['$resource', 'SENTINEL_API_HOST_CONSTANTS'];
    function ClientsService($resource, HOST) {
        var api = $resource(HOST.URL + '/rest/1/clients', {}, {
            getClients: { method: 'GET', isArray: true},
            getChildrenOf: { method: 'GET', params: { clientGuid: '@clientGuid' }, url: HOST.URL + '/rest/1/clients/:clientGuid/children', isArray: true},
            getClient: { method: 'GET', params: { clientGuid: '@clientGuid'}, url: HOST.URL + '/rest/1/clients/:clientGuid'},
            putClient: { method: 'PUT', params: { clientGuid: '@clientGuid' }, url: HOST.URL + '/rest/1/clients/:clientGuid'},
            deleteClient: { method: 'DELETE', params: { clientGuid: '@clientGuid' }, url: HOST.URL + '/rest/1/clients/:clientGuid'},
            deactivateClient: { method: 'POST', params: { clientGuid: '@clientGuid'}, url: HOST.URL + '/rest/1/clients/:clientGuid/deactivate'},
            activateClient: { method: 'POST', params: { clientGuid: '@clientGuid'}, url: HOST.URL + '/rest/1/clients/:clientGuid/activate'},
            getParentOf: { method: 'GET', params: { clientGuid: '@clientGuid'}, url: HOST.URL + '/rest/1/clients/:clientGuid/parent'},
            setParentOf: { method: 'POST', params: { clientGuid: '@clientGuid'}, url: HOST.URL + '/rest/1/clients/:clientGuid/parent'},
            addClient: { method: 'POST', params: { parentGuid: '@clientGuid' }, url: HOST.URL + '/rest/1/clients/:parentGuid/children'},
            getLogo: {
                method: 'GET',
                params: { clientGuid: '@clientGuid'},
                url: HOST.URL + '/rest/1/clients/:clientGuid/logo',
                responseType: 'arraybuffer',
                transformResponse: function (data, headersGetter) {
                    return {
                        type: headersGetter()['content-type'],
                        image: data
                    };
                }
            },
            setLogo: {
                method: 'POST', 
                params: { clientGuid: '@clientGuid'}, 
                url: HOST.URL + '/rest/1/clients/:clientGuid/logo', 
                transformRequest: angular.identity
            },
            clearLogo: { method: 'DELETE', params: { clientGuid: '@clientGuid'}, url: HOST.URL + '/rest/1/clients/:clientGuid/logo' }
        });

        //decided to return a service definition instead of the resource so that UI developer
        //can be abstracted from details of $resource and request logic can be encapsulated if necessary
        var service = {
            getClients: getClients,
            getChildrenOf: getChildrenOf,
            getClientByGuid: getClientByGuid,
            getParentOf: getParentOf,
            getParentOfClientGuid: getParentOfClientGuid,
            getClient: getClient,
            putClient: putClient,
            deleteClient: deleteClient,
            deactivateClient: deactivateClient,
            activateClient: activateClient,
            setParentOf: setParentOf,
            addClient: addClient,
            getLogo: getLogo,
            getLogoUrl: getLogoUrl,
            clearLogo: clearLogo,
            setLogo: setLogo,
            resource: api
        };

        return service;

        function addClient(client) {
            return api.addClient({ parentGuid: client.parentGuid }, client);
        }

        function getClient(clientGuid) {
            return api.getClient({ clientGuid: clientGuid });
        }

        function getClients() {
            return api.getClients();
        }

        function getChildrenOf(client) {
            return api.getChildrenOf({ clientGuid: client.clientGuid });
        }

        function getParentOf(client) {
            return api.getParentOf({ clientGuid: client.clientGuid });
        }

        function getParentOfClientGuid(clientGuid) {
            return api.getParentOf({ clientGuid: clientGuid });
        }


        function getClientByGuid(clientGuid) {
            return api.getClient({ clientGuid: clientGuid });
        }

        function putClient(client) {
            return api.putClient({ clientGuid: client.clientGuid }, client);
        }

        function deleteClient(client) {
            return api.deleteClient({ clientGuid: client.clientGuid });
        }

        function deactivateClient(client) {
            return api.deactivateClient({ clientGuid: client.clientGuid });
        }

        function activateClient(client) {
            return api.activateClient({ clientGuid: client.clientGuid });
        }

        function setParentOf(client, parent) {
            return api.setParentOf({ clientGuid: client.clientGuid }, parent);
        }

        function getLogo(client) {
            return api.getLogo({ clientGuid: client.clientGuid });
        }

        function getLogoUrl(client) {
            return HOST.URL + '/rest/1/clients/' + client.clientGuid + '/logo';
        }

        function clearLogo(client) {
            return api.clearLogo({ clientGuid: client.clientGuid });
        }

        function setLogo(client, formData) {
            return api.setLogo({ clientGuid: client.clientGuid }, formData);
        }

    }

})();