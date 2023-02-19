(function() {
    'use strict';

    angular
        .module('api-sentinel')
        .factory('AssetService', AssetService);

    AssetService.$inject = ['$resource', 'SENTINEL_API_HOST_CONSTANTS'];

     function AssetService($resource, HOST) {
        var api = $resource(HOST.URL + '/rest/1/warehouse/assets', {}, {
            saveAsset: { method: 'POST', params: {clientGuid: '@clientGuid',sentinelId:'@sentinelId'}, url: HOST.URL + '/rest/1/warehouse/assets?clientGuid=:clientGuid&sentinelId=:sentinelId' },
            getAssets: { method: 'GET', params: {clientGuid: '@clientGuid'},  url: HOST.URL + '/rest/1/warehouse/assets/GetAssets?clientGuid=:clientGuid', isArray: true},
            getAsset: { method: 'GET', params: { clientGuid: '@clientGuid', sentinelId: '@sentinelId'}, url: HOST.URL + '/rest/1/warehouse/assets?clientGuid=:clientGuid&sentinelId=:sentinelId'},
            updateAsset: { method: 'PUT', params: { clientGuid: '@clientGuid', sentinelId: '@sentinelId' }, url: HOST.URL + '/rest/1/warehouse/assets?clientGuid=:clientGuid&sentinelId=:sentinelId'},
            removeAsset: { method: 'DELETE', params: { clientGuid:'@clientGuid', sentinelId: '@sentinelId' }, url: HOST.URL + '/rest/1/warehouse/assets?clientGuid=:clientGuid&sentinelId=:sentinelId'},
            addImage: { method: 'POST', params: {sentinelId: '@sentinelId', fileType: '@fileType'}, url: HOST.URL + '/rest/1/images/updateSentinelImage?deviceId=:sentinelId&fileType=:fileType', transformRequest: []},
            getImages: { method: 'GET', params: {sentinelId: '@sentinelId'}, url: HOST.URL + '/rest/1/images/ListSentinelImages?deviceId=:sentinelId', isArray: true},
            removeImage: { method: 'DELETE', params: {name: '@name'}, url: HOST.URL + '/rest/1/images/DeleteSentinelImage?strFileName=:name', isArray: true}
        });

        //decided to return a service definition instead of the resource so that UI developer
        //can be abstracted from details of $resource and request logic can be encapsulated if necessary
        var service = {
            saveAsset: saveAsset,
            getAssets: getAssets,
            getAsset: getAsset,
            updateAsset: updateAsset,
            removeAsset: removeAsset,
            addImage: addImage,
             getImages: getImages,
            removeImage: removeImage,
            resource: api
        };

        return service;

        function saveAsset(client, sentinelId, asset) {
            return api.saveAsset({ clientGuid: client.id, sentinelId: sentinelId }, asset);
        }

        function getAssets(client) {
            return api.getAssets({ clientGuid: client.id });
        }

        function getAsset(client, sentinelId) {
            return api.getAsset({ clientGuid: client.id, sentinelId: sentinelId });
        }

        function updateAsset(client, sentinelId, asset) {
            return api.updateAsset({clientGuid: client.id, sentinelId: sentinelId }, asset);
        }

        function removeAsset(client, asset) {
            return api.removeAsset({ clientGuid: client.id, sentinelId: asset.sentinelId });
        }

       	function addImage(client, sentinelId, fileType, obj){
            var b64Data = obj.src.split(",")[1];
            var byteCharacters = atob(b64Data);
            var byteNumbers = new Array(byteCharacters.length);
            for (var i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
			return api.addImage({clientGuid: client.id, sentinelId: sentinelId, fileType: fileType}, byteArray);
		}

         function getImages(sentinelId){
            return api.getImages({sentinelId: sentinelId});
        }

        function removeImage(name){
            return api.removeImage({name: name});
        }


    }

})();
