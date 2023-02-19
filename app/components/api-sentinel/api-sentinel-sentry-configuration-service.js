(function() {
    'use strict';

    angular
        .module('api-sentinel')
        .factory('SentryConfigurationService', SentryConfigurationService);

   SentryConfigurationService.$inject = ['$resource', 'SENTINEL_API_HOST_CONSTANTS'];
    function SentryConfigurationService($resource, HOST) {
        var api = $resource(HOST.URL + '/rest/1/admin/commands/sentrycommand/:setting?deviceId=:deviceId&clientId=:clientId', {}, {
            getOperationState: {  url:HOST.URL + '/rest/1/admin/commands/:setting?deviceId=:deviceId&clientId=:clientId', method: 'GET', params: { setting: 'operationstate',deviceId: '@deviceId',clientId: '@clientId' }},
            cancelOperationState: { url:HOST.URL + '/rest/1/admin/commands/:setting?operationStateId=:operationStateId&clientId=:clientId', method: 'DELETE', params: { setting: 'canceloperationstate',operationStateId: '@operationStateId',clientId: '@clientId' }},
            changeExtendedReportingInterval: { method: 'POST', params: {  setting: 'extendedreportinginterval' ,deviceId: '@deviceId',clientId: '@clientId' }},
            changeFirmware: { method: 'POST', params: { deviceTagId: '@deviceTagId', setting: 'firmware' }},
            changeFtpServer: { method: 'POST', params: { deviceTagId: '@deviceTagId', setting: 'ftpserver' }},
            changeLight: { method: 'POST', params: { setting: 'light',deviceId: '@deviceId',clientId: '@clientId' }},
            changeOperationState: { url:HOST.URL + '/rest/1/admin/commands/:setting?deviceId=:deviceId&clientId=:clientId', method: 'POST', params: { setting: 'operationstate',deviceId: '@deviceId',clientId: '@clientId' }},
            changeHumidity: { method: 'POST', params: { setting: 'humidity',deviceId: '@deviceId',clientId: '@clientId'  }},
            changeTilt: { method: 'POST', params: { setting: 'tilt',deviceId: '@deviceId',clientId: '@clientId'  }},
            changeWifi:{ method: 'POST', params: { setting: 'wifi',deviceId: '@deviceId',clientId: '@clientId'  }},
            changePressure: { method: 'POST', params: { setting: 'pressure',deviceId: '@deviceId',clientId: '@clientId'  }},
            changeReportServer: { method: 'POST', params: { setting: 'reportserver',deviceId: '@deviceId',clientId: '@clientId' }},
            changeShock: { method: 'POST', params: { setting: 'shock',deviceId: '@deviceId',clientId: '@clientId' }},
            changeStandardReportingInterval: { method: 'POST', params: { setting: 'standardreportinginterval',deviceId: '@deviceId',clientId: '@clientId'  }},
            changeTemperature: { method: 'POST', params: { setting: 'temperature',deviceId: '@deviceId',clientId: '@clientId' }},
            refreshConfig: { method: 'POST', params: { setting: 'refresh',deviceId: '@deviceId',clientId: '@clientId'  }}
        });

        //decided to return a service definition instead of the resource so that UI developer
        //can be abstracted from details of $resource and request logic can be encapsulated if necessary
        var service = {
            changeExtendedReportingInterval: changeExtendedReportingInterval,
            changeFirmware: changeFirmware,
            changeFtpServer: changeFtpServer,
            changeHumidity: changeHumidity,
            changeTilt: changeTilt,
            changeLight: changeLight,
            changeWifi: changeWifi,
            getOperationState:getOperationState,
            changeOperationState: changeOperationState,
            cancelOperationState:cancelOperationState,
            changePressure: changePressure,
            changeReportServer: changeReportServer,
            changeShock: changeShock,
            changeStandardReportingInterval: changeStandardReportingInterval,
            changeTemperature: changeTemperature,
            refreshConfig: refreshConfig,
            resource: api
        };

        return service;

        function changeExtendedReportingInterval( command) {
            return api.changeExtendedReportingInterval( command);
        }

        function changeFirmware(device, appVersion, bootVersion) {
            //var command = {
            //    deviceTagId: device.deviceTagId,
            //
            //};
            //return api.changeFirmware({ deviceTagId: device.deviceTagId }, command);
        }

        function changeFtpServer(device, server, port, username, password) {
            var command = {
                deviceTagId: device.deviceTagId,
                serverUrl: server,
                serverPort: port,
                userName: username,
                password: password
            };
            return api.changeFtpServer( command);
        }

        function changeLight(command) {
            return api.changeLight(command);
        }

        function changeOperationState(device,clientId, operationState) {
            var command = {
                deviceId: device,
                clientId: clientId,
                opMode: operationState
            };
            return api.changeOperationState( command);
        }

        function changePressure( command) {
            return api.changePressure( command);
        }

        function changeReportServer( command) {
            return api.changeReportServer(command);
        }

        function changeShock( command) {
            return api.changeShock(command);
        }

        function changeHumidity( command) {
            return api.changeHumidity(command);
        }

        function changeTilt( command) {
            return api.changeTilt(command);
        }

        function changeWifi( command) {
            return api.changeWifi(command);
        }
        function changeStandardReportingInterval( command) {
            return api.changeStandardReportingInterval( command);
        }

        function changeTemperature( command) {
            return api.changeTemperature(command);
        }        

        function refreshConfig(clientId,device) {
            return api.refreshConfig({clientId: clientId, deviceId: device });
        }

        function getOperationState(clientId,device) {
            return api.getOperationState({clientId: clientId, deviceId: device });
        }

        function cancelOperationState(clientId,id) {
            return api.cancelOperationState({clientId: clientId, operationStateId:id });
        }
    }

})();