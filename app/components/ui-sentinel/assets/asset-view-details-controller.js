(function() {
    'use strict';

    angular
        .module('ui-sentinel.assets')
        .controller('AssetDetailController', AssetDetailController);

    AssetDetailController.$inject = ['$rootScope', '$scope', '$state', '$stateParams', 'SentinelUiSession', 'localStorageService', 'ZoneService','AssetService','FeedbackService', 'MapsConstants'];
    function AssetDetailController($rootScope, $scope, $state, $stateParams, SentinelUiSession, localStorageService, ZoneService, AssetService,FeedbackService, MapsConstants) {
       
        var vm = {
            map: null,
            mapType: MapsConstants.mapTypes.hybrid,
            mapTypes: MapsConstants.mapTypes,
            mapZooms: MapsConstants.zooms,
            mapShapeStyles: MapsConstants.shapes,
            zone:null,
            asset:null,
            imagesStored: [],
            feedback: FeedbackService,
            actions: {
                gotoAddAsset: gotoAddAsset,
                gotoEditAsset: gotoEditAsset,
                load: load
            }
        };
        activate();
        return vm;

        ////////////////////////////////////////////

        function activate() {
            
            load();
        }

        function gotoAddAsset(){
        	$state.go('asset.new');
        }

        function gotoEditAsset(asset){
        	$state.go('asset.admin',{sentinelId: asset.sentinelId});
        }


        function initMap() {

        	 vm.map = new google.maps.Map(document.getElementById("assetMap"), {
                zoom: vm.mapZooms.geofenceDefault.zoomLevel,
                center: vm.mapZooms.geofenceDefault.center,
                mapTypeId: vm.mapType.type,
                mapTypeControl: true,
                mapTypeControlOptions: {
                    mapTypeIds: [google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.TERRAIN]
                }
            });

            vm.map.controls[google.maps.ControlPosition.TOP_CENTER].push(document.getElementById('centerTrackingZoomLabel'));
            vm.map.controls[google.maps.ControlPosition.TOP_CENTER].push(document.getElementById('locationTrackingZoom'));

            setTimeout(function(){
                    var point = {lat: vm.asset.latitude,lng: vm.asset.longitude};
                    var marker = new google.maps.Marker({
                            id: 1,
                            position: point,
                            map: vm.map
                        });
                    panToAsset(point);

            },500);
        }

        function panToAsset(point) {
            if (point) {
                var markerBounds = new google.maps.LatLngBounds();
                markerBounds.extend(point);
                vm.map.fitBounds(markerBounds);
            }
            
        }


        function load() {
        	$rootScope.loading = true;
                var promise = ZoneService.getZoneAssetsById(SentinelUiSession.focus,$stateParams.zoneId).$promise;
                promise.then(
                    function(result) {
                        $rootScope.loading = false;
                        console.log("result",result);
                        vm.zone = result;        
                        vm.asset = _.find(result.assets,function(asset){
                            return asset.sentinelId === $stateParams.sentinelId;
                        });         
                        if(vm.asset){
                            vm.asset.latitude = result.latitude;
                            vm.asset.longitude = result.longitude;
                        }
                        loadImages();
                        initMap();
                    },
                    function (error) {
                        $rootScope.loading = false;
                        if (error.status !== 404) {
                            vm.feedback.addError(error);
                        }
                    }
                );
        }

         function loadImages(){
             var imagesPromise = AssetService.getImages(vm.asset.sentinelId).$promise;
                imagesPromise.then(
                    function(result) {
                        vm.imagesStored = result;
                       console.log("imagesStored",result);
                    },
                    function (error) {
                        if (error.status !== 404) {
                            vm.feedback.addError(error);
                        }
                    }
                );
        }


}
})();
