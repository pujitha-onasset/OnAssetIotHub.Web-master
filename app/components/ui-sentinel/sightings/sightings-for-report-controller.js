(function() {
    'use strict';

    angular
        .module('ui-sentinel.sightings')
        .controller('SightingsForReportController', SightingsForReportController);

    /////////////

    SightingsForReportController.$inject = ['$rootScope', '$scope', '$state', 'SentinelUiSession', 'SightingsAdminApiService', 'SentryAdminApiService', 'SightingsAccountApiService', 'SentryAccountApiService'];
    function SightingsForReportController($rootScope, $scope, $state, SentinelUiSession, SightingsAdminApiService, SentryAdminApiService, SightingsAccountApiService, SentryAccountApiService) {
        var googleMapDivId = 'sightingsMap';


        var vm = {
            list: null,
            report: null,
            reportsList: null,
            map: null,
            marker: null,
            page: 1,
            totalPages: 1,
            totalItems: 0,
            pageArray: null,
            itemsPerPage: 500,
            error: false,
            load: load,
            next: next,
            previous: previous,
            gotoPage: gotoPage,
            gotoSightingsByDevice: gotoSightingsByDevice,
            nextReport: null,
            previousReport: null,
            gotoSightingsForReport: gotoSightingsForReport,
        };

        var genericErrorMessage = "Unexpected error ocurred while getting the sightings for report";
        activate();
        return vm;

        function activate() {
            // $scope.$watchCollection(
            //     function() {
            //         return vm.report;
            //     },
            //     function(report) {
            //         //return report;
            //     }
            // );
            $rootScope.loading = true;
           
            vm.report = null;
            console.log("activate report",vm.report);
            //vm.reportsList = $state.params.reportsList;
            if (!vm.report) {
                vm.error = false;
                var reportPromise = 
                    SentryAdminApiService.getReport(SentinelUiSession.focus, $state.params.reportId).$promise ;
                reportPromise.then(
                    function (report) {
                        vm.report = report;
                        setDefaults();
                        load();
                    },
                    function (error) {
                        vm.error = true;
                        vm.errorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericErrorMessage;
                        console.log(error);
                    }
                );
                
                
                return;
            } else {
                setDefaults();
                load();
            }
        }

        function setDefaults() {
            vm.report.reportId = (typeof $state.params.reportId == 'undefined' || $state.params.reportId === null) ? vm.report.sentryStatusId : $state.params.reportId;
            vm.report.latitude = (typeof vm.report.latitude == 'undefined' || vm.report.latitude === null) ? 0 : vm.report.latitude;
            vm.report.longitude = (typeof vm.report.longitude == 'undefined' || vm.report.longitude === null) ? 0 : vm.report.longitude;
        }

        function load() {
            vm.list = null;
            vm.page = 1;

            if (!vm.report) {
                return;
            }

            vm.report.isShockExceeded = (vm.report.shockX!=null&&vm.report.shockY!=null&&vm.report.shockZ!=null);
            if(vm.report.isShockExceeded){
                vm.report.shockMagnitude = Math.sqrt(Math.pow(vm.report.shockX, 2)+Math.pow(vm.report.shockY, 2)+Math.pow(vm.report.shockZ, 2)).toFixed(1);
            }

            if (!vm.reportsList) {

                var from =  moment().subtract(7, 'day');
                var to = moment().add(1, 'day');
                if( $state.params.from ){
                    from = moment( $state.params.from );
                    to = moment( $state.params.to );
                }

                var listPromiseAux = 
                        SentryAdminApiService.listSentry500SentinelReportsByDevice(SentinelUiSession.focus,  vm.report.imei, from, to, vm.page).$promise;

                listPromiseAux.then(
                    function(result) {
                        console.log("Reports",result);
                        vm.reportsList = result;
                        var index = _.findIndex(vm.reportsList, function(r) {
                            return r.sentryStatusId === vm.report.reportId;
                        });

                        vm.selectedIndex = index;
                        vm.nextReport = index === 0 ? null : vm.reportsList[index - 1];
                        vm.previousReport = index === vm.reportsList.length - 1 ? null : vm.reportsList[index + 1];
                        console.log("INDEX " + vm.selectedIndex);
                        console.log("prev " + vm.previousReport.sentryStatusId);
                    },
                    function (error) {
                        console.log(error);
                    }
                );

                
            }

            initMap();

            var countPromise = 
                SightingsAdminApiService.countSightingsForReport(SentinelUiSession.focus, vm.report.imei, vm.report.reportId).$promise ;
            var listPromise =
                SightingsAdminApiService.listSightingsForReport(SentinelUiSession.focus, vm.report.imei, vm.report.reportId, vm.page).$promise ;

            if (!countPromise || !listPromise) {
                return;
            }

            countPromise.then(
                function(result) {
                    vm.totalPages = result.pageCount;
                    vm.totalItems = result.itemCount;
                    
                    var pageArray = [];
                    for (var i = 1; i <= vm.totalPages; i++) {
                        pageArray.push(i);
                    }
                    vm.pageArray = pageArray;
                },
                function (error) {
                    console.log(error);
                    vm.errorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericErrorMessage;
                }
            );

            listPromise.then(
                function(result) {
                    vm.list = result;
                },
                function (error) {
                    console.log(error);
                    vm.errorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericErrorMessage;
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function initMap() {
            if (!vm.report || vm.report.locationMethod === 'none') {
                return;
            }

            vm.map = new google.maps.Map(document.getElementById(googleMapDivId), {
                zoom: 8,
                minZoom: 2,
                center: {
                    lat: vm.report.latitude,
                    lng: vm.report.longitude
                },
                mapTypeId: google.maps.MapTypeId.HYBRID,
                mapTypeControl: true,
                mapTypeControlOptions: {
                    mapTypeIds: [google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.TERRAIN]
                }
            });

            vm.marker = new google.maps.Marker({
                id: vm.report.reportGuid,
                position: {
                    lat: vm.report.latitude,
                    lng: vm.report.longitude
                },
                map: vm.map
            });
        }
        function next() {
            if (vm.page !== vm.totalPages) {
                gotoPage(vm.page + 1);
            }
        }

        function previous() {
            if (vm.page !== 1) {
                gotoPage(vm.page - 1);
            }
        }

        function gotoPage(page) {
            if (page < 1 || page > vm.totalPages) {
                return;
            }
            vm.list = null;
            vm.page = page;

            var listPromise =
                SightingsAdminApiService.listSightingsForReport(SentinelUiSession.focus, vm.report.imei, vm.report.reportId, vm.page).$promise;
            listPromise.then(
                function(result) {
                    vm.list = result;
                },
                function (error) {
                    console.log(error);
                    vm.errorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericErrorMessage;
                }
            );
        }

        function gotoSightingsByDevice(report) {
            var from = moment(report.timeOfReceipt).subtract(1, 'days').toISOString();
            var to = moment(report.timeOfReceipt).add(60, 'minutes').toISOString();
            $state.go('sightings.by-device', { imei: report.imei, to: to, from: from});
        }

        function gotoSightingsForReport(report) {
            $state.go('sightings.for-report', { reportId: report.sentryStatusId, reportsList: vm.reportsList });
        }

    }

})();