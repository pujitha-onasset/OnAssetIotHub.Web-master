(function() {
    'use strict';

    angular
        .module('api-sentinel')
        .factory('ZoneService', ZoneService);

    ZoneService.$inject = ['$resource', 'SENTINEL_API_HOST_CONSTANTS'];

     function ZoneService($resource, HOST) {
        var api = $resource(HOST.URL + '/rest/1/warehouse/zone', {}, {
            saveZone: { method: 'POST', params: {clientGuid: '@clientGuid'}, url: HOST.URL + '/rest/1/warehouse/zone?clientGuid=:clientGuid' },
            getZones: { method: 'GET', params: {clientGuid: '@clientGuid'},  url: HOST.URL + '/rest/1/warehouse/zone/:clientGuid', isArray: true},
            getZonesByLocation: { method: 'GET', params: {clientGuid: '@clientGuid', locationId: '@locationId'},  url: HOST.URL + '/rest/1/warehouse/zone/GetZones?locationId=:locationId&clientGuid=:clientGuid', isArray: true},
            getZonesByLocationAssets: { method: 'GET', params: {clientGuid: '@clientGuid', locationId: '@locationId'},  url: HOST.URL + '/rest/1/warehouse/zone/GetZonesByLocationAssets?locationId=:locationId&clientGuid=:clientGuid', isArray: true},
            getZoneAssetsById: { method: 'GET', params: {clientGuid: '@clientGuid', zoneId: '@zoneId'},  url: HOST.URL + '/rest/1/warehouse/zone/GetZoneAssetsById?zoneId=:zoneId&clientGuid=:clientGuid'},
            getZone: { method: 'GET', params: { clientGuid: '@clientGuid', zoneId: '@zoneId'}, url: HOST.URL + '/rest/1/warehouse/zone/:zoneId?clientGuid=:clientGuid'},
            updateZone: { method: 'PUT', params: { clientGuid: '@clientGuid', zoneId: '@zoneId' }, url: HOST.URL + '/rest/1/warehouse/zone/:zoneId?clientGuid=:clientGuid'},
            removeZone: { method: 'DELETE', params: { clientGuid:'@clientGuid', zoneId: '@zoneId' }, url: HOST.URL + '/rest/1/warehouse/zone?zoneId=:zoneId&clientGuid=:clientGuid'},
            addImage: { method: 'POST', params: {zoneId: '@zoneId', fileType: '@fileType'},  url: HOST.URL + '/rest/1/images/UpdateZoneImage?zoneId=:zoneId&fileType=:fileType',  transformRequest: []},
            getImages: { method: 'GET', params: {zoneId: '@zoneId'}, url: HOST.URL + '/rest/1/images/ListZoneImages?zoneId=:zoneId', isArray: true},
            removeImage: { method: 'DELETE', params: {name: '@name'}, url: HOST.URL + '/rest/1/images/DeleteZoneImage?strFileName=:name', isArray: true}

        });

        //decided to return a service definition instead of the resource so that UI developer
        //can be abstracted from details of $resource and request logic can be encapsulated if necessary
        var service = {
            saveZone: saveZone,
            getZones: getZones,
            getZonesByLocation: getZonesByLocation,
            getZonesByLocationAssets: getZonesByLocationAssets,
            getZoneAssetsById: getZoneAssetsById,
            getZone: getZone,
            updateZone: updateZone,
            removeZone: removeZone,
            addImage: addImage,
            getImages: getImages,
            removeImage: removeImage,
            resource: api
        };

        return service;

        function saveZone(client, zone) {
            return api.saveZone({ clientGuid: client.id }, zone);
        }

        function getZones(client) {
            return api.getZones({ clientGuid: client.id });
        }

        function getZonesByLocation(client, locationId) {
            return api.getZonesByLocation({ clientGuid: client.id, locationId: locationId });
        }

         function getZoneAssetsById(client, zoneId) {
            return api.getZoneAssetsById({ clientGuid: client.id, zoneId: zoneId });
        }

        function getZonesByLocationAssets(client,locationId) {
            return api.getZonesByLocationAssets({ clientGuid: client.id, locationId: locationId });
        }

        function getZone(client, zoneId) {
            return api.getZone({ clientGuid: client.id, zoneId: zoneId });
        }

        function updateZone(client, zone) {
            return api.updateZone({clientGuid: client.id, zoneId: zone.id }, zone);
        }

        function removeZone(client, zone) {
            return api.removeZone({ clientGuid: client.id, zoneId: zone.id });
        }

       	function addImage(client, zoneId,fileType, obj){
           var b64Data = obj.src.split(",")[1];
            var byteCharacters = atob(b64Data);
            var byteNumbers = new Array(byteCharacters.length);
            for (var i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
          
			return api.addImage({clientGuid: client.id, zoneId: zoneId, fileType: fileType}, byteArray);
		}

        function getImages(zoneId){
            return api.getImages({zoneId: zoneId});
        }

        function removeImage(name){
            return api.removeImage({name: name});
        }
    }

})();
