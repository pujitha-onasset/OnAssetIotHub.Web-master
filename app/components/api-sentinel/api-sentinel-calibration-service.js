(function() {
    'use strict';

    angular
        .module('api-sentinel')
        .factory('CalibrationService', CalibrationService);

    CalibrationService.$inject = ['$resource', 'ApiToken', 'SENTINEL_API_HOST_CONSTANTS'];

    function CalibrationService($resource, ApiToken, HOST) {
        var api = $resource(HOST.URL + '/rest/1/warehouse/assets', {}, {
            saveCalibration: { method: 'POST', url: HOST.URL + '/rest/1/warehouseassets/SaveAssetCalibration' },
            getCalibrations: { method: 'GET', params: { deviceId: '@deviceId' },  url: HOST.URL + '/rest/1/warehouseassets/GetAssetCalibrationList', isArray: true},
            getAssetCalibrationsInfoList: { method: 'GET', params: { accountId: '@accountId' },  url: HOST.URL + '/rest/1/warehouseassets/GetAssetCalibrationInfoList?accountId=:accountId&includeCompleted=true', isArray: true},
            GetPivotAssetCalibrationList: { method: 'GET', params: { accountId: '@accountId',fromDate:'@fromDate',toDate:'toDate' },  url: HOST.URL + '/rest/1/warehouseassets/GetPivotAssetCalibrationList?accountId=:accountId&includeCompleted=false&from=:fromDate&to=:toDate', isArray: true},
            getCalibration: { method: 'GET', params: { assetCalibrationId: '@assetCalibrationId' }, url: HOST.URL + '/rest/1/warehouseassets/assetsCalibration/:assetCalibrationId'},
            updateCalibration: { method: 'PUT', url: HOST.URL + '/rest/1/warehouseassets/UpdateAsssetCalibration'},
            removeCalibration: { method: 'DELETE', params: { assetCalibrationId:'@assetCalibrationId' }, url: HOST.URL + '/rest/1/warehouseassets/assetsCalibration/:assetCalibrationId'},
            addTechDataFile: { method: 'POST', params: {calibrationId: '@calibrationId', fileType: '@fileType', fileName: '@fileName'}, url: HOST.URL + '/rest/1/files/UploadTechDataFile?calibrationId=:calibrationId&fileType=:fileType&fileName=:fileName', transformRequest: []},
            getTechDataFiles: { method: 'GET', params: {calibrationId: '@calibrationId'}, url: HOST.URL + '/rest/1/files/ListTechDataFile?calibrationId=:calibrationId', isArray: true},
            addLastCalibrationFile: { method: 'POST', params: {calibrationId: '@calibrationId', fileType: '@fileType', fileName: '@fileName'}, url: HOST.URL + '/rest/1/files/UploadLastCalibrationRecord?calibrationId=:calibrationId&fileType=:fileType&fileName=:fileName', transformRequest: []},
            getLastCalibrationFiles: { method: 'GET', params: {calibrationId: '@calibrationId'}, url: HOST.URL + '/rest/1/files/ListLastCalibrationRecord?calibrationId=:calibrationId', isArray: true},
            removeDataFile: { method: 'DELETE', params: {name: '@name'}, url: HOST.URL + '/rest/1/files/DeleteDataFile?strFileName=:name', isArray: true}
        });

        //decided to return a service definition instead of the resource so that UI developer
        //can be abstracted from details of $resource and request logic can be encapsulated if necessary
        var service = {
            saveCalibration: saveCalibration,
            getCalibrations: getCalibrations,
            getCalibration: getCalibration,
            getAssetCalibrationsInfoList: getAssetCalibrationsInfoList,
            GetPivotAssetCalibrationList: GetPivotAssetCalibrationList,
            updateCalibration: updateCalibration,
            removeCalibration: removeCalibration,
            addTechDataFile: addTechDataFile,
            getTechDataFiles: getTechDataFiles,
            addLastCalibrationFile: addLastCalibrationFile,
            getLastCalibrationFiles: getLastCalibrationFiles,
            removeDataFile: removeDataFile,
            resource: api
        };

        return service;

        function saveCalibration(calibration) {
            return api.saveCalibration({}, calibration);
        }

        function getCalibrations(sentinelId) {
            return api.getCalibrations({ deviceId: sentinelId });
        }

        function getAssetCalibrationsInfoList(accountId) {
            return api.getAssetCalibrationsInfoList({ accountId: accountId });
        }

        function GetPivotAssetCalibrationList(accountId,fromDate, toDate) {
            return api.GetPivotAssetCalibrationList({ accountId: accountId, fromDate: fromDate, toDate: toDate });
        }

        function getCalibration(calibrationId) {
            return api.getCalibration({ assetCalibrationId: calibrationId });
        }

        function updateCalibration(calibration) {
            console.log(calibration);
            return api.updateCalibration({}, calibration);
        }

        function removeCalibration(calibrationId) {
            return api.removeCalibration({ assetCalibrationId: calibrationId });
        }

       	function addTechDataFile(calibrationId, fileType, fileName, obj){
            var b64Data = obj.src.split(",")[1];
            var byteCharacters = atob(b64Data);
            var byteNumbers = new Array(byteCharacters.length);
            for (var i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
			return api.addTechDataFile({calibrationId: calibrationId, fileType: fileType, fileName: fileName}, byteArray);
		}

         function getTechDataFiles(calibrationId){
            return api.getTechDataFiles({calibrationId: calibrationId});
        }

        function addLastCalibrationFile(calibrationId, fileType, fileName, obj){
            var b64Data = obj.src.split(",")[1];
            var byteCharacters = atob(b64Data);
            var byteNumbers = new Array(byteCharacters.length);
            for (var i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
            return api.addLastCalibrationFile({calibrationId: calibrationId, fileType: fileType, fileName: fileName}, byteArray);
        }

        function getLastCalibrationFiles(calibrationId){
            return api.getLastCalibrationFiles({calibrationId: calibrationId});
        }

        function removeDataFile(name){
            return api.removeDataFile({name: name});
        }


    }

})();
