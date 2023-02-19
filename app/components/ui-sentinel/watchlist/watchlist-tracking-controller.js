(function() {
    'use strict';

    angular
        .module('ui-sentinel.watchlist')
        .controller('WatchlistTrackingController', WatchlistTrackingController);

    WatchlistTrackingController.$inject = ['$rootScope', '$scope','$filter', '$state', '$stateParams', 'SentinelUiSession', 'localStorageService', 'WatchlistsService', 'WatchlistTrackingFilterService','WatchlistTrackingReportsService','FeedbackService', 'MapsConstants'];
    function WatchlistTrackingController($rootScope, $scope,$filter, $state, $stateParams, SentinelUiSession, localStorageService, WatchlistsService,WatchlistTrackingFilterService,WatchlistTrackingReportsService, FeedbackService, MapsConstants) {
        var googleMapDivId = 'watchlistTrackingMap';
        var markerZIndices = {
            'ok-network': 10,
            'ok-gps': 11,
            'info-network': 12,
            'info-gps': 13,
            'warning-network': 14,
            'warning-gps': 15,
            'selected': 16
        };
        var vm = {
            map: null,
            mapType: MapsConstants.mapTypes.hybrid,
            mapTypes: MapsConstants.mapTypes,
            mapZooms: MapsConstants.zooms,
            mapShapeStyles: MapsConstants.shapes,
            watchlists: [],
            sentinels:[],
            reportMarkers: [],
            sightings:[],
            feedback: FeedbackService,
            reportsService:WatchlistTrackingReportsService,
            filterService: WatchlistTrackingFilterService,
            filterOption: {value:'',text:'All'},
            filterOptions: [{value:'',text:'All'},
            {value:'DONE',text:'Done'},
            {value:'PENDING',text:'Pending'},
            {value:'PARTIAL',text:'Partial'},
            {value:'USERCOMPLETED',text:'User stop'}],
            selectedIndex: null,
            nextWatchlist: null,
            previousWatchlist: null,
            from: null,
            to: null,
            filter: {
                searchText: null,
                filterW: filterWatchlist,
                filterS: filterSentinel
            },
            sentinelSelected:null,
            watchlistSelected:null,
            previousSentinel:null,
            nextSentinel:null,
            onReportsChange: onReportsChange,
            onSelectedReportChange: onSelectedReportChange,
            onFilterChange: onFilterChange,
            actions: {
                gotoAddWatchlist: gotoAddWatchlist,
                gotoEditWatchlist: gotoEditWatchlist,
                load: load,
                reload: reload,
                selectWatchlist:selectWatchlist,
                selectSentinel: selectSentinel,
                selectReport: selectReport,
                closeSentinel: closeSentinel,
                closeWatchlist: closeWatchlist,
                closeReportDetails: closeReportDetails
            }
        };
        activate();
        return vm;

        ////////////////////////////////////////////

        function activate() {
            
            load();
        }

        function gotoAddWatchlist(sentinel){
            $state.go('watchlist.list',{ sentinelId: sentinel.mac });
        }

        function gotoEditWatchlist(watchlist){

            $state.go('watchlist.admin',{ watchlistId: watchlist.id });
        }

        function selectWatchlist(watchlist){

            vm.watchlistSelected = watchlist;

            var index = _.findIndex(vm.watchlists, function(l) {
                return l.id === watchlist.id;
            });

            console.log("index",index);

            vm.selectedIndex = index;
            vm.nextWatchlist = index === 0 ? null : findNextVisibleWatchlist(index);
            vm.previousWatchlist = index === vm.watchlists.length - 1 ? null : findPrevVisibleWatchList(index);

            //vm.reportsService.fromDate= new Date(watchlist.startDate);
           // vm.reportsService.toDate= new Date(watchlist.endDate);
            vm.reportsService.load(watchlist, watchlist.startDate, watchlist.endDate);           

            $scope.$watchCollection(
                function() {
                    return vm.reportsService.reports;
                },
                function (reports) {
                    onReportsChange(reports);
                }
            );
            $scope.$watch(
                function() {
                    return vm.reportsService.selected;
                },
                function (report) {
                    onSelectedReportChange(report);
                }, true
            );
            $scope.$watch(
                function() {
                    return vm.filterService;
                },
                function () {
                    onFilterChange();
                }, true
            );
            
        }

        function onFilterChange() {
            _.forEach(vm.reportMarkers, function(marker) {
                marker.setVisible(vm.filterService.filter(marker.report));
            });

            if (vm.selectedReportMarker && !vm.filterService.filter(vm.selectedReportMarker.report)) {
                selectReport(null);
            }
        }

        function selectSentinel(sentinel){
            vm.sentinelSelected=sentinel;
            vm.reportsService.sentinel=sentinel;
            clearMarkers();
            panToReports([vm.sentinelSelected]);

            var index = _.findIndex(vm.sentinels, function(s) {
                return s.mac === sentinel.mac;
            });

            vm.nextSentinel = index === 0 ? null : findNextVisibleSentinel(index);
            vm.previousSentinel = index === vm.sentinels.length - 1 ? null : findPrevVisibleSentinel(index);
           
            $rootScope.loading = true;
            var promise = WatchlistsService.getWatchlist(SentinelUiSession.focus,sentinel.mac).$promise;
            promise.then(
                function(result) {
                    $rootScope.loading = false;
                    vm.watchlists = result;                   
                    console.log("result",result);
                    vm.watchlists = vm.watchlists.sort(function(a, b) {
                        a = new Date(a.startDate);
                        b = new Date(b.startDate);
                        return a>b ? -1 : a<b ? 1 : 0;
                    });
                    
                },
                function (error) {
                    $rootScope.loading = false;
                    if (error.status !== 404) {
                        vm.feedback.addError(error);
                    }
                }
            );
            
        }

        function closeSentinel(){
            vm.watchlists = [];
            vm.reportsService.reports=[];
            vm.sentinelSelected=null;
            vm.reportsService.sentinel=null;
            clearMarkers();
            reload();
        }

        function findNextVisibleSentinel(selectedIndex) {
            for(var i = selectedIndex - 1; i >= 0; i--) {
                if (vm.filter.filterS(vm.sentinels[i])) {
                    return vm.sentinels[i];
                }
            }
            return null;
        }

        function findPrevVisibleSentinel(selectedIndex) {
            for(var i = selectedIndex + 1; i <= vm.sentinels.length - 1; i++) {
                if (vm.filter.filterS(vm.sentinels[i])) {
                    return vm.sentinels[i];
                }
            }
            return null;
        }

        function findNextVisibleWatchlist(selectedIndex) {
            for(var i = selectedIndex - 1; i >= 0; i--) {
                if (vm.filter.filterW(vm.watchlists[i])) {
                    return vm.watchlists[i];
                }
            }
            return null;
        }

        function findPrevVisibleWatchList(selectedIndex) {
            for(var i = selectedIndex + 1; i <= vm.watchlists.length - 1; i++) {
                if (vm.filter.filterW(vm.watchlists[i])) {
                    return vm.watchlists[i];
                }
            }
            return null;
        }

       function findNextVisible(selectedIndex) {
            for(var i = selectedIndex - 1; i >= 0; i--) {
                if (vm.filterService.filter(vm.reportsService.reports[i])) {
                    return vm.reportsService.reports[i];
                }
            }
            return null;
        }

        function findPrevVisible(selectedIndex) {
            for(var i = selectedIndex + 1; i <= vm.reportsService.reports.length - 1; i++) {
                if (vm.filterService.filter(vm.reportsService.reports[i])) {
                    return vm.reportsService.reports[i];
                }
            }
            return null;
        }

        function closeWatchlist(){
            vm.watchlistSelected = null;
            vm.reportsService.reports=[];
            clearMarkers();
            panToReports([vm.sentinelSelected]);
        }

        function filterWatchlist(watchlist) {
            var isTextMatch = true;
            if (vm.filterOption.value) {
                isTextMatch = (watchlist.status==vm.filterOption.value);
                
            }

            return isTextMatch;
        }

         function filterSentinel(watchlist) {
            var isTextMatch = true;
            if (vm.filter.searchText) {
                isTextMatch = (
                    watchlist.mac.toLowerCase().indexOf(vm.filter.searchText.toLowerCase()) > -1 ||
                    (watchlist.friendlyName !== null && watchlist.friendlyName.toLowerCase().indexOf(vm.filter.searchText.toLowerCase()) > -1)
                );
                var marker = null;
                if(isTextMatch){
                    marker = _.find(vm.reportMarkers,function(m){return m.id === watchlist.mac;}); 
                    if(marker)
                      marker.marker.setMap(vm.map);                          
                } else {
                    marker = _.find(vm.reportMarkers,function(m){return m.id === watchlist.mac;}); 
                    if(marker && marker.marker){
                        marker.marker.setMap(null);
                        
                    }    
                }
            }


            return isTextMatch;
        }

        function initMap(sentinels) {

            var mapCenter = localStorageService.get('mapCenter');
            var mapCenterLat = localStorageService.get('mapCenterLat');
            var mapCenterLng = localStorageService.get('mapCenterLng');
            var mapZoom = localStorageService.get('mapZoomWatchlistTracking');

            vm.map = new google.maps.Map(document.getElementById(googleMapDivId), {
                zoom: mapZoom || MapsConstants.zooms.world.zoomLevel,
                minZoom: 2,
                center: mapCenter || MapsConstants.zooms.world.center,
                mapTypeId: vm.mapType.type,
                mapTypeControl: true,
                mapTypeControlOptions: {
                    mapTypeIds: [google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.TERRAIN]
                }
            });

        
            vm.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(document.getElementById('legendTool'));
            vm.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(document.getElementById('mapPropTool'));
            onWindowResize();

            google.maps.event.addListener(vm.map, 'idle', handleIdle);
            google.maps.event.addListener(vm.map, 'click', onMapClick);
            google.maps.event.addDomListener(window, 'resize', onWindowResize);
            
           
        }

        function handleIdle() {
            vm.center = {
                lat: Math.round(vm.map.getCenter().lat() * 1000000) / 1000000,
                lng: Math.round(vm.map.getCenter().lng() * 1000000) / 1000000
            };
            vm.zoomLevel = vm.map.getZoom();

            localStorageService.set('mapCenter', vm.center);
            localStorageService.set('mapZoomWatchlistTracking', vm.zoomLevel);
            $scope.$apply();
        }

        function onMapClick() {
            if (vm.reportsService.selected) {
                vm.reportsService.selected = null;
                $scope.$apply();
            }
        }


         function onWindowResize() {
            if ($state.current.name !== 'watchlist.tracking') {
                return;
            }
            
            var center = vm.map.getCenter();

            var newHeight = window.innerHeight * 0.60;
            var mapDiv = document.getElementById(googleMapDivId);
            mapDiv.style.height = Math.round(newHeight) + 'px';

            var mapItemListDiv = document.getElementById('map-items-list');
            mapItemListDiv.style.height = (Math.round(newHeight) + 172) + 'px';

            google.maps.event.trigger(vm.map, 'resize');
            vm.map.setCenter(center);
        }



        function onReportsChange(reports) {
            clearMarkers();

            var bounds = new google.maps.LatLngBounds();

            _.forEach(reports, function(report) {
                if (report.latitude !== null && report.longitude !== null && (report.latitude !== 0 || report.longitude !== 0)) {
                    var strLocationMethod = $filter('locationMethod')(report.locationMethod, report.latitude, report.longitude);
                    var zIndexName = report.severity.toLowerCase() + '-' + strLocationMethod.toLowerCase();
                    var marker = angular.extend(
                        new google.maps.Marker({
                            id: report.reportGuid,
                            icon: MapsConstants.icons.deviceReports.normal.default,
                            zIndex: markerZIndices[zIndexName],
                            position: {
                                lat: report.latitude,
                                lng: report.longitude
                            },
                            map: vm.map,
                            visible: vm.filterService.filter(report)
                        }),
                        {
                            report: report
                        }
                    );
                    setReportMarkerIcon(marker);
                    addReportMarkerListeners(marker);
                    vm.reportMarkers.push({"marker":marker});

                    if (report.latitude !== 0 || report.longitude !== 0) {
                        var latlng = new google.maps.LatLng(report.latitude, report.longitude);
                        bounds.extend(latlng);
                    }
                }
            });

            if (vm.reportMarkers.length == 1) {
                // set center of map
                vm.map.setCenter(bounds.getCenter());
                vm.map.setZoom(16);
            } else if (vm.reportMarkers.length > 1) {
                // fit to bounds
                vm.map.fitBounds(bounds);
            }
        }

        function onSelectedReportChange(report) {
            if (vm.selectedReportMarker) {
                vm.selectedReportMarker.setMap(null);
                vm.selectedReportMarker = null;
                vm.selectedIndex = null;
            }

            if (!report) {
                return;
            }

            var index = _.findIndex(vm.reportsService.reports, function(r) {
                return r.sentinelLogDataId === report.sentinelLogDataId;
            });

            vm.selectedIndex = index;
            vm.nextReport = index === 0 ? null : findNextVisible(index);
            console.log(vm.nextReport);
            vm.previousReport = index === vm.reportsService.reports.length - 1 ? null : findPrevVisible(index);
            console.log(vm.previousReport);
            if (!report.latitude || !report.longitude) {
                return;
            }

            var strLocationMethod = $filter('locationMethod')(report.locationMethod, report.latitude, report.longitude);
            var iconName = '../img/' + report.severity + '-' + strLocationMethod.toLowerCase() + '-selected.png';
            if(report.beaconType=="Sentinel 100A" || report.beaconType=="Mobile SDK Anchor")
                iconName = '../img/' + report.severity + '-anchor-selected.png';
            vm.selectedReportMarker = new google.maps.Marker({
                id: 'selected',
                icon: {
                    url: iconName,
                    anchor: {x: 11, y: 11},
                    scaledSize: { height: 24, width: 24}
                },
                zIndex: markerZIndices.selected,
                position: {
                    lat: report.latitude,
                    lng: report.longitude
                },
                map: vm.map
            });
            addReportMarkerListeners(vm.selectedReportMarker);
            vm.selectedReportMarker.report = report;
        }


        function panToReports(sentinels) {
        
            setTimeout(function(){
                var markerBounds = new google.maps.LatLngBounds();
                var randomPoint;
                var id = 1;
                _.forEach(sentinels, function (s) {
                    if(!s.sentryStatus)
                        return;
                    randomPoint = new google.maps.LatLng( s.sentryStatus.latitude, s.sentryStatus.longitude);
                    var marker = new google.maps.Marker({
                        id: id++,
                        icon:{
                            url: '../img/ok-gps.png',
                            anchor: {x: 11, y: 11},
                            scaledSize: { height: 24, width: 24}
                        },
                        position: randomPoint,
                        map: vm.map
                    });
                    vm.reportMarkers.push({id: s.mac, marker: marker});

                    markerBounds.extend(randomPoint);

                    marker.addListener('click', function() {
                       
                       selectSentinel(s);
                       $scope.$apply();

                    });

                  
                });
                if( vm.reportMarkers.length)
                  vm.map.fitBounds(markerBounds);
                else
                  vm.map.setZoom(1);

                console.log("vm.reportMarkers",vm.reportMarkers);
            },500);
            
            
        }


        function load() {
            console.log("load");
            if(! $stateParams.reload){
                vm.reportsService.reports=[];
            }
            $rootScope.loading = true;
            var promise = WatchlistsService.getWatchlistLoggersByClient(SentinelUiSession.focus).$promise;
            promise.then(
                function(result) {
                    $rootScope.loading = false;
                    vm.sentinels = result;
                    initMap(result);
                    clearMarkers();
                    panToReports(result);
                    console.log("result",result);
                    var sentinel=localStorageService.get("watchlist.sentinel");
                    if(sentinel && $stateParams.reload){
                       selectSentinel(sentinel);
                       var watchlist=localStorageService.get("watchlist");
                       selectWatchlist(watchlist);
                    }
                    else{
                      vm.reportsService.reports=[];
                    }
                    localStorageService.remove("watchlist.sentinel");
                    localStorageService.remove("watchlist");
                },
                function (error) {
                    $rootScope.loading = false;
                    if (error.status !== 404) {
                        vm.feedback.addError(error);
                    }
                }
            );
        }

        
        function gotoSightingsForReport(report) {
            $state.go('sightings.for-report', { reportId: report.sentryStatusId });
        }
       
        function clearMarkers() {
            _.forEach(vm.reportMarkers, function(marker) {
               
                marker.marker.setMap(null);
            });
            vm.reportMarkers = [];
        }
     
        function reload(){
            clearMarkers();
            $rootScope.loading = true;
             var promise = null;
            if(vm.filterOption.value){
                console.log("value"+vm.filterOption.value);
                promise = WatchlistsService.getWatchlistLoggersByClient(SentinelUiSession.focus,vm.filterOption.value,vm.filterOption.value).$promise;
            }
            else{
                promise = WatchlistsService.getWatchlistLoggersByClient(SentinelUiSession.focus).$promise;
            }
            promise.then(
                function(result) {
                    $rootScope.loading = false;
                    vm.sentinels = result;
                    initMap(result);
                    panToReports(result);
                    console.log("result",result);
                },
                function (error) {
                    $rootScope.loading = false;
                    if (error.status !== 404) {
                        vm.feedback.addError(error);
                    }
                }
            );
        }
        
        function setReportMarkerIcon(marker) {
            if (!marker || !marker.report) {
                return;
            }
            var strLocationMethod = $filter('locationMethod')(marker.report.locationMethod, marker.report.latitude, marker.report.longitude);
            var iconName = '../img/' + marker.report.severity + '-' + strLocationMethod.toLowerCase() + '.png';
            if(marker.report.beaconType=="Sentinel 100A" || marker.report.beaconType=="Mobile SDK Anchor"){
                iconName = '../img/' + marker.report.severity + '-anchor.png';
            }
            var iconOptions = {
                url: iconName,
                anchor: {x: 11, y: 11},
                scaledSize: { height: 24, width: 24}
            };
            marker.setIcon(iconOptions);
        }
       
        function addReportMarkerListeners(marker) {
            google.maps.event.addListener(marker, 'click', function() {
                onReportMarkerClick(marker);
                $scope.$apply();
            });
        }

        function onReportMarkerClick(marker) {
            vm.reportsService.selected = vm.reportsService.selected === marker.report ? null : marker.report;
        }

         function selectReport(report) {
            vm.reportsService.selected = vm.reportsService.selected === report ? null : report;
            $('#btn-details-select-prev').blur();
            $('#btn-details-select-next').blur();
        }
        
        function closeReportDetails() {
            vm.reportsService.selected = null;
        }
    }
})();
