(function() {
    'use strict';

    angular
        .module('api-sentinel')
        .factory('RoutesService', RoutesService);

    RoutesService.$inject = ['$resource', 'SENTINEL_API_HOST_CONSTANTS'];
    function RoutesService($resource, HOST) {
        var api = $resource(HOST.URL + '/rest/1/routes', {}, {
            addRoute: { method: 'POST' },
            getRoutes: { method: 'GET', isArray: true},
            getRoute: { method: 'GET', params: { routeId: '@routeId'}, url: HOST.URL + '/rest/1/routes/:routeId'},
            updateRoute: { method: 'PUT', params: { routeId: '@routeId' }, url: HOST.URL + '/rest/1/routes/:routeId'},
            removeRoute: { method: 'DELETE', params: { routeId: '@routeId' }, url: HOST.URL + '/rest/1/routes/:routeId'},
            getAlarms: { method: 'GET', params: { routeId: '@routeId'}, url: HOST.URL + '/rest/1/routes/:routeId/alarms', isArray: true}
        });

        //decided to return a service definition instead of the resource so that UI developer
        //can be abstracted from details of $resource and request logic can be encapsulated if necessary
        var service = {
            addRoute: addRoute,
            getRoutes: getRoutes,
            getRoute: getRoute,
            updateRoute: updateRoute,
            removeRoute: removeRoute,
            getAlarms: getAlarms,
            resource: api
        };

        return service;

        function addRoute(client, route) {
            return api.addRoute({ clientGuid: client.id }, route);
        }

        function getRoutes(client) {
            return api.getRoutes({ clientGuid: client.id });
        }

        function getRoute(routeId) {
            return api.getRoute({ routeId: routeId });
        }

        function updateRoute(route) {
            return api.updateRoute({ routeId: route.routeId }, route);
        }

        function removeRoute(route) {
            return api.removeRoute({ routeId: route.routeId });
        }

        function getAlarms(route) {
            return api.getAlarms({ routeId: route.routeId });
        }
    }

})();