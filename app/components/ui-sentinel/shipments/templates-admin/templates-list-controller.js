(function() {
    'use strict';

    angular
        .module('ui-sentinel.shipments.templatesAdmin')
        .controller('TemplatesListController', TemplatesListController);

    TemplatesListController.$inject = ['$rootScope', '$state', '$scope', 'SentinelUiSession', 'FeedbackService', 'ShipmentTemplatesDataLoaderService', 'ShipmentTemplatesService', 'PolygonGeofencesService', 'RadialGeofencesService'];
    function TemplatesListController($rootScope, $state, $scope, SentinelUiSession, FeedbackService, ShipmentTemplatesDataLoaderService, ShipmentTemplatesService,  PolygonGeofencesService, RadialGeofencesService) {

        var vm = {
            templates: null,
            availableGeofences: [],
            feedback: FeedbackService,
            filterText: null,
            searchText: null,
            isSearchMode: false,
            isSearchDone: false,
            filter: filter,
            formattedStops: formattedStops,
            hasPermission: {

            },
            actions: {
                doSearch: doSearch,
                clearSearch: clearSearch,
                goToTemplate: goToTemplate,
                printSentryFriendlyName:printSentryFriendlyName,
                printSentinelFriendlyName:printSentinelFriendlyName 
            },
            propertyName: 'name',
            reverse: false,
            sortBy: sortBy,
        };
        activate();
        return vm;

        function activate() {
            $rootScope.$on('CLIENT_FOCUS_CHANGED', function (event, args) {
                if ($state.current.name === 'shipmenttemplates.list') {
                    ShipmentTemplatesDataLoaderService.load();
                    loadGeofences();
                }
            });

            $rootScope.$on('$stateChangeSuccess', function (event, args) {
                if ($state.current.name === 'shipmenttemplates.list') {
                    ShipmentTemplatesDataLoaderService.load();
                    loadGeofences();
                }
            });

            $scope.$watch(
                function() {
                    return ShipmentTemplatesDataLoaderService.templates;
                },
                function (value) {
                    onTemplatesChange();
                }, true
            );
            $scope.$watch(
                function() {
                    return vm.availableGeofences;
                },
                function (value) {
                    onTemplatesChange();
                }, true
            );
            $scope.$watch(
                function() {
                    return ShipmentTemplatesDataLoaderService.isSearchRequired;
                },
                function (value) {
                    vm.isSearchMode = ShipmentTemplatesDataLoaderService.isSearchRequired;
                    vm.isSearchDone = !ShipmentTemplatesDataLoaderService.isSearchRequired;
                }, true
            );


            setPermissions();

            loadGeofences();
            ShipmentTemplatesDataLoaderService.load();

            vm.isSearchMode = ShipmentTemplatesDataLoaderService.isSearchRequired;
            vm.isSearchDone = !ShipmentTemplatesDataLoaderService.isSearchRequired;
        }

        function clearSearch() {
            $('#btn-clear-search').blur();
            vm.filterText = null;
            vm.searchText = null;
            vm.isSearchDone = false;
            ShipmentTemplatesDataLoaderService.clear();
        }

        function printSentryFriendlyName(template){
            if(template.friendlyname!=null && template.friendlyname.length>0)
                return template.friendlyname + " [" + template.deviceTagId + "]";
            return template.deviceTagId;
        }

        function printSentinelFriendlyName(sentinel){
            if(sentinel.friendlyName!=null && sentinel.friendlyName.length>0)
                return sentinel.friendlyName + " [" + sentinel.deviceId + "]";
            return sentinel.deviceId;
        }

        function doSearch() {
            $('#btn-do-search').blur();
            vm.filterText = null;
            if (!vm.searchText || vm.searchText === '') {
                vm.isSearchDone = false;
                return true;
            }
            vm.isSearchDone = true;
            ShipmentTemplatesDataLoaderService.search(vm.searchText, 500);
        }

        function filter(template) {
            if (!vm.filterText || vm.filterText === '')
                return true;

            var text = vm.filterText.toLowerCase();

            var isNameMatch = template.name.toLowerCase().indexOf(text) > -1;
            if (isNameMatch)
                return true;

            var isStopMatch = false;
            _.forEach(template.formattedStops, function(stop) {
               if ((stop.name && stop.name.toLowerCase().indexOf(text) > -1) || (stop.address && stop.address.toLowerCase().indexOf(text) > -1)) {
                   isStopMatch = true;
                   return false;
               }
            });

            return isStopMatch;

        }

        function goToTemplate(template) {
            var returnState = $state.current.name;
            var returnStateParams = $state.params;
            $state.go('shipmenttemplate.admin', { templateId: template.id, referrer: returnState, referrerParams: returnStateParams } );
        }

        function toFormattedStop(templateStop) {

            var stop = {
                type: templateStop.stopType,
                address: null,
                isGeofence: false
            };

            if (templateStop.geofenceId) {
                var geofence = _.find(vm.availableGeofences, { geofenceId: templateStop.geofenceId });
                if (geofence) {
                    stop.isGeofence = true;
                    stop.address = geofence.name + ' (geofence)' ;
                }
            }
            else {
                stop.address = templateStop.address;
            }

            return stop;
        }

        function formattedStops(template) {
            var stops = [];

            _.forEach(template.stops, function(templateStop) {
                if (templateStop.stopType.toLowerCase() === 'origin') {
                    stops.push(toFormattedStop(templateStop));
                }
            });

            _.forEach(template.stops, function(templateStop) {
                if (templateStop.stopType.toLowerCase() === 'stop') {
                    stops.push(toFormattedStop(templateStop));
                }
            });

            _.forEach(template.stops, function(templateStop) {
                if (templateStop.stopType.toLowerCase() === 'destination') {
                    stops.push(toFormattedStop(templateStop));
                }
            });

            return stops;
        }

        function loadGeofences() {
            vm.availableGeofences = [];
            var polygonPromise = PolygonGeofencesService.getGeofences(SentinelUiSession.focus).$promise;
            polygonPromise.then(
                function (result) {
                    vm.availableGeofences = vm.availableGeofences.concat(result);
                },
                function (error) {
                    vm.feedback.addError(error.data.message);
                }
            );
            var radialPromise = RadialGeofencesService.getGeofences(SentinelUiSession.focus).$promise;
            radialPromise.then(
                function (result) {
                    vm.availableGeofences = vm.availableGeofences.concat(result);
                },
                function (error) {
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function onTemplatesChange() {

            var templates = ShipmentTemplatesDataLoaderService.templates;

            _.forEach(templates, function(template) {
                template.formattedStops = formattedStops(template);
            });
            vm.templates = templates;
        }

        function setPermissions() {

        }

        function sortBy(propertyName) {
            console.log(propertyName);
            vm.reverse = (vm.propertyName === propertyName) ? !vm.reverse : false;
            vm.propertyName = propertyName; 
        }
    }
})();

