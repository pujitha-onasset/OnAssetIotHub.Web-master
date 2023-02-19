(function() {
    'use strict';

    angular
        .module('ui-sentinel.devices.devicePivot')
        .controller('SentinelsPivotController', SentinelsPivotController);

    /////////////

    SentinelsPivotController.$inject = ['$rootScope','$timeout', '$scope', '$state', 'SentinelUiSession', 'DevicesReportService'];
    function SentinelsPivotController($rootScope,$timeout, $scope, $state, SentinelUiSession, DevicesReportService) {
        var properties = [
            {
                name: 'batteryPercent',
                label: 'Battery (%)'
            },
            {
                name: 'batteryVoltage',
                label: 'Battery (V)'
            },
            {
                name: 'humidity',
                label: 'Humidity (%)'
            },
            {
                name: 'light',
                label: 'Light (lux)'
            },
            {
                name: 'rssi',
                label: 'Rssi (db)'
            },
            {
                name: 'temperatureC',
                label: 'Temperature (\xB0C)'
            },
            {
                name: 'temperatureF',
                label: 'Temperature (\xB0F)'
            },            
            {
                name: 'temperatureProbeC',
                label: 'Probe (\xB0C)'
            },
            {
                name: 'temperatureProbeF',
                label: 'Probe (\xB0F)'
            }
        ];

        
        var vm = {
            pivotProperties: properties,
            reportType: "daily",
            pivotProperty: {
                name: 'rssi',
                label: 'Rssi (db)'
            },
            sentinelReports: null,
            deviceTagIds:[],
            deviceTagIdsList:[],
            filterText: null,
            filter: filter,
            load: load,
            isSeen:isSeen,
            pivotValue: pivotValue,
            changePivotProp: changePivotProp,
            setTypeReport: setTypeReport,
            next: next,
            previous:previous,
            setPage:setPage,
            itemsPerPage:500,
            sortBy:sortBy,
            localComparator:localComparator

        };
        activate();
        return vm;

        function activate() {
            load();
        }

        function isSeen(sightingId, report) {
            return _.findIndex(report.sentinelHistoryPivotList, function(o) { return o.sightingId === sightingId; }) > -1;
        }
      
        function load() {
            vm.deviceTagIds = [];
            vm.sentinelReports = null;

            if(!vm.filterText)
                vm.filterText=null;
         
           
            var pivotPromise = DevicesReportService.getDataHistoryReport(SentinelUiSession.focus,vm.reportType,"sentinel",vm.filterText).$promise;
          
            $rootScope.loading = true;
            vm.pageArray=[];
            vm.deviceTagIdsList=[];
            vm.totalPages = 0;
           

            pivotPromise.then(
                function(pivotReport) {
                    vm.deviceTagIdsList= chunkArray(pivotReport.sentinelPivotReport.sentinelList,500);
                    if(vm.deviceTagIdsList.length){
                       vm.deviceTagIds = vm.deviceTagIdsList[0];
                       vm.totalPages = vm.deviceTagIdsList.length;
                       vm.page=1;
                       vm.pageArray=[]
                       for (var i = 1; i <= vm.deviceTagIdsList.length; i++) {
                           vm.pageArray.push(i);
                       }
                      
                    }
                    vm.sentinelReports = _.orderBy(pivotReport.sentinelPivotReport.sentinelReportList, ['timeOfReport'], ['desc']);
                },
                function (error) {
                    console.log(error);
                    vm.sentinelReports = [];
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function pivotValue(sightingId, report) {
            //sighitngId
            var index =  _.findIndex( report.sentinelHistoryPivotList , function(o) { return o.sightingId === sightingId; });

            if (index === -1) return '';
            return report.sentinelHistoryPivotList[index][vm.pivotProperty.name];
        }

        function changePivotProp(name) {
            var prop = _.find(vm.pivotProperties, function(v) {
                return v.name === name;
            });
            if (prop !== undefined) {
                vm.pivotProperty = prop;
            }
        }

        function setTypeReport(type){
            vm.reportType=type;
            vm.propertyName=null;
            load();
        }

        function filter() {
            load();
        }

        function chunkArray(myArray, chunk_size){
            var index = 0;
            var arrayLength = myArray.length;
            var tempArray = [];
            
            for (index = 0; index < arrayLength; index += chunk_size) {
                var myChunk = myArray.slice(index, index+chunk_size);
                // Do something if you want with the group
                tempArray.push(myChunk);
            }

            return tempArray;
        }

        function next() {
            $rootScope.loading = true;
            $timeout(function() {
                vm.page++;
                vm.deviceTagIds = vm.deviceTagIdsList[vm.page-1]; 
                $timeout(function() {
                   $rootScope.loading = false;
                }, 100);
            }, 10);
        }

        function previous() {
            $rootScope.loading = true;
            $timeout(function() {
                vm.page--;
                vm.deviceTagIds = vm.deviceTagIdsList[vm.page-1];          
                $timeout(function() {
                   $rootScope.loading = false;
                }, 100);
            }, 10);
        }


        function setPage(page) {
             $rootScope.loading = true;
               
            
            $timeout(function() {
                vm.page=page;
                vm.deviceTagIds = vm.deviceTagIdsList[vm.page-1];
                $timeout(function() {
                    $rootScope.loading = false;
                }, 100);
            }, 10);
        }

        function sortBy(propertyName) {
            vm.reverse = (vm.propertyName === propertyName) ? !vm.reverse : false;
            vm.propertyName = propertyName;
        }

        function localComparator (v1) {
            if(!vm.propertyName){
                return 0;
            }
            // If we don't get strings, just compare by index
            if (vm.propertyName === 'deviceId') {
              
                return v1.deviceId;
             
            }
            
            if (vm.propertyName === 'deviceName') {
              
                if(v1.deviceName)
                   return v1.deviceName;
                else
                   return "";
             
            }
            
            var report = _.find(vm.sentinelReports, function(v) {
                return vm.propertyName === v.reportId;
            });
            console.log(report);

            var index =  _.findIndex( report.sentinelHistoryPivotList , function(o) { return o.sightingId === v1.deviceId; });

            if (index === -1) return -1;
            return report.sentinelHistoryPivotList[index][vm.pivotProperty.name];


           
          };

    }

})();