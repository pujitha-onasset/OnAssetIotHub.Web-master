(function() {
    'use strict';

    angular
        .module('api-sentinel')
        .factory('ShipmentTemplatesService', ShipmentTemplatesService);

    ShipmentTemplatesService.$inject = ['$resource', 'SENTINEL_API_HOST_CONSTANTS'];
    function ShipmentTemplatesService($resource, HOST) {
        var api = $resource(HOST.URL + '/rest/1/shipmentTemplates', {}, {
            getTemplates: { method: 'GET', isArray: true },
            getTemplatesCount: { method: 'GET', url: HOST.URL + '/rest/1/shipmentTemplates/count' },
            getTemplatesByClient: { method: 'GET', url: HOST.URL + '/rest/1/shipmentTemplates/GetTemplatesByClient' , isArray: true },
            getTemplatesCountByClient: { method: 'GET', url: HOST.URL + '/rest/1/shipmentTemplates/GetTemplatesForClient_Count' },
            getTemplate: { method: 'GET', url: HOST.URL + '/rest/1/shipmentTemplates/:templateId' },
            createTemplate: { method: 'POST', params: { clientGuid: '@clientGuid'}, url: HOST.URL + '/rest/1/shipmentTemplates/POST' },
            addStops: { method: 'POST', params: { clientGuid: '@clientGuid', shipmentTemplateId: '@shipmentTemplateId'}, url: HOST.URL + '/rest/1/shipmentTemplates/:shipmentTemplateId/stops' , isArray: true},
            getStops: { method: 'GET', params: { clientGuid: '@clientGuid', shipmentTemplateId: '@shipmentTemplateId'}, url: HOST.URL + '/rest/1/shipmentTemplates/:shipmentTemplateId/stops' , isArray: true},
            deleteStop: { method: 'DELETE', params: { clientGuid: '@clientGuid', shipmentTemplateId: '@shipmentTemplateId', destinationId: '@destinationId'}, url: HOST.URL + '/rest/1/shipmentTemplates/:shipmentTemplateId/stops/:destinationId'},
            updateStop: { method: 'PUT', params: { clientGuid: '@clientGuid', shipmentTemplateId: '@shipmentTemplateId', destinationId: '@destinationId'}, url: HOST.URL + '/rest/1/shipmentTemplates/:shipmentTemplateId/stops/:destinationId'},
            updateTemplate: { method: 'PUT', url: HOST.URL + '/rest/1/shipmentTemplates/:templateId' },
            removeTemplate: { method: 'DELETE', url: HOST.URL + '/rest/1/shipmentTemplates/:templateId' }
        });

        //decided to return a service definition instead of the resource so that UI developer
        //can be abstracted from details of $resource and request logic can be encapsulated if necessary
        var service = {
            getTemplates: getTemplates,
            getTemplatesCount: getTemplatesCount,
            getTemplatesByClient:getTemplatesByClient,
            getTemplatesCountByClient:getTemplatesCountByClient,
            searchTemplates: searchTemplates,
            getTemplate: getTemplate,
            createTemplate: createTemplate,
            updateTemplate: updateTemplate,
            removeTemplate: removeTemplate,
            addStops: addStops,
            getStops: getStops,
            deleteStop: deleteStop,
            updateStop: updateStop,
            resource: api
        };

        return service;

        function getTemplates(client, page, pageSize) {
            return api.getTemplates({ clientGuid: client.id, pageSize: pageSize, page: page});
        }

        function getTemplatesCount(client) {
            return api.getTemplatesCount({ clientGuid: client.id});
        }

         function getTemplatesByClient(client, page, pageSize) {
            return api.getTemplatesByClient({ clientGuid: client.id, pageSize: pageSize, page: page});
        }

        function getTemplatesCountByClient(client) {
            return api.getTemplatesCountByClient({ clientGuid: client.id});
        }

        function searchTemplates(client, searchText, numResults) {
            return api.getTemplates({ clientGuid: client.id, searchText: searchText, numResults: numResults});
        }

        function getTemplate(templateId) {
            return api.getTemplate({ templateId: templateId });
        }

        function createTemplate(client, template) {
            return api.createTemplate({ clientGuid: client.id }, template);
        }

        function updateTemplate(template) {
            return api.updateTemplate({ templateId: template.id }, template);
        }

        function removeTemplate(template) {
            return api.removeTemplate({ templateId: template.id });
        }

        function addStops(client, templateId, stops) {
            return api.addStops({ clientGuid: client.id, shipmentTemplateId: templateId }, stops);
        }

        function getStops(client, templateId) {
            return api.getStops({ clientGuid: client.id, shipmentTemplateId: templateId });
        }

        function deleteStop(client, templateId, id) {
            return api.deleteStop({ clientGuid: client.id, shipmentTemplateId: templateId, destinationId: id });
        }

        function updateStop(client, templateId, stop) {
            return api.updateStop({ clientGuid: client.id, shipmentTemplateId: templateId, destinationId: stop.destinationId }, stop);
        }
    }

})();