(function() {
    'use strict';

    angular
        .module('ui-rls.branches')
        .controller('BranchAdminController', BranchAdminController);

    BranchAdminController.$inject = ['$rootScope', '$scope', '$state', '$stateParams', 'RlsUiSession', 'localStorageService','BranchesDataService', 'BranchService','FeedbackService','PolygonGeofencesService', 'RadialGeofencesService','CountryService','StateService', 'MapsConstants'];
    function BranchAdminController($rootScope, $scope, $state, $stateParams, RlsUiSession, localStorageService,BranchesDataService,BranchService, FeedbackService,PolygonGeofencesService, RadialGeofencesService,CountryService,StateService, MapsConstants) {
       
        var vm = {
            geofences:[],
            geofencesCopy:[],
            countries:[],
            geofence:{
                value:null,
                filterText: null,
                isChanging: false,
                option: null,
                geofence: null,
                geofences: null,
                geofenceLimit: 5,
                filter: geofenceFilter
            },
            locationsGeofence:{
                value:[],
                filterText: null,
                isChanging: false,
                option: null,
                geofence: null,
                geofences: null,
                geofenceLimit: 5,
                filter: geofenceFilterLocations
            },
            locationsPlace:{
                value:[],
            },
            branch: null,
            responsivenessArray:[1,2,3,4],
            branchLimit: 5,
            branchName: {
                value: null,
                isPristine: true,
                errors: {
                    isBlank: true,
                    isDuplicate: true
                },
                hasError: function() {
                    return this.errors.isBlank || this.errors.isDuplicate;
                },
                validate: function() {
                    this.isPristine = false;
                    this.errors.isDuplicate = false;
                    this.errors.isBlank = !this.value;
                }
            },
            branchDescription: {
                value: null
            },
            branchResponsiveness: {
                value: 1
            },
            mode: {
                isNew: false,
                isSaving: false,
                isRemoving: false,
                isChangingBranch: false
            },
            hasPermission: {
                toSave: false
            },
            feedback: FeedbackService,
            actions: {
                close: close,
                beginRemove: beginRemove,
                cancelRemove: cancelRemove,
                addPlace:addPlace,
                removePlace:removePlace,
                getStates:getStates,
                remove: remove,
                reset: reset,
                submit: submit,
                selectGeofence: selectGeofence,
                selectGeofenceLocation: selectGeofenceLocation,
                removeGeofence:removeGeofence,
                goToGeofence: goToGeofence
            }
        };
        activate();
        return vm;

        ////////////////////////////////////////////

        function activate() {
            setPermissions();
            $rootScope.$on('CLIENT_FOCUS_CHANGED', function (event, args) {
                if ($state.current.name === 'branch.admin' || $state.current.name === 'branch.new') {
                    BranchesDataService.load();
                    $state.go('branchs.list');
                }
            });

            if ($stateParams.branchId) {
                load();
            }
            else {
                vm.mode.isNew = true;
                reset();                
            }
            loadGeofences();
            loadCountries();
        }

        function beginRemove() {
            vm.mode.isRemoving = true;
        }

        function cancelRemove() {
            vm.mode.isRemoving = false;
        }

        
       
       function close() {
            vm.branch = null;
            $state.go($stateParams.referrer, $stateParams.referrerParams);            
        }



      

        function load() {
            var promise = BranchService.getBranch(RlsUiSession.focus,$stateParams.branchId).$promise;
            promise.then(
                function(result) {
                    vm.branch = result;
                    reset();
                },
                function (error) {
                    if (error.status !== 404) {
                        vm.feedback.addError(error);
                    }
                }
            );

           
        }



        function remove() {
            vm.feedback.clear();

            var promise = BranchService.removeBranch(RlsUiSession.focus,vm.branch).$promise;
            promise.then(
                function(result) {
                    vm.mode.isRemoving = false;
                    BranchesDataService.load();
                    $state.go('branches.list');
                },
                function (error) {
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function reset() {
            vm.mode.isChangingBranch = vm.mode.isNew;

            
            if (!vm.mode.isNew) {
                $state.current.data.subTitle = vm.branch.name;
                vm.branchName.value = vm.branch.name;
                vm.branchDescription.value = vm.branch.description;
                vm.branchResponsiveness.value = vm.branch.responsiveness;      
                vm.geofence.value= vm.geofences.find(function(g) {
                    return g.id == vm.branch.branchGeofenceId;
                });
                vm.locationsPlace.value=[]; 
                _.each(vm.branch.branchLocations,(loc)=>{
                    if(loc.country){                        
                        var promiseState = StateService.getListStates(loc.country).$promise;
                        promiseState.then(
                            function(result) {
                                var option={country:loc.country,state:"",states:[]};  
                                if(loc.state)
                                    option.state = loc.state;
                                option.states = result;
                                vm.locationsPlace.value.push(option);
                            },
                            function (error) {
                                if (error.status !== 404) {
                                    vm.feedback.addError(error);
                                }
                            }
                        );
                    }
                });   
                    
                   
            }
            else {
                vm.branchName.value = null;
                vm.branchDescription.value = null;
                vm.branchResponsiveness.value = 1;
            }

            vm.branchName.isPristine = true;
            vm.branchName.errors.isBlank = true;
            vm.branchName.errors.isDuplicate = false;
            
      
        }

       
       

       
        function setPermissions() {
            vm.hasPermission.toSave =
                RlsUiSession.user.isSystemAdmin ||
                RlsUiSession.user.isAccountAdmin ||
                RlsUiSession.user.isAccountEditor;
        }

        function handleIdle() {
            vm.center = {
                lat: Math.round(vm.map.getCenter().lat() * 1000000) / 1000000,
                lng: Math.round(vm.map.getCenter().lng() * 1000000) / 1000000
            };
            vm.zoomLevel = vm.map.getZoom();
        }



        function submit() {
            vm.feedback.clear();

            vm.branchName.validate();
        
            if (vm.branchName.hasError() ) {
                return;
            }

            var set={"mapCenter":vm.center,"mapZoom":vm.zoomLevel};
            var branch = {
                name: vm.branchName.value,
                branchGeofenceId: vm.geofence.value?vm.geofence.value.id:null,
                accountId: RlsUiSession.focus.id,
                description: vm.branchDescription.value,
                responsiveness: vm.branchResponsiveness.value,
                branchLocations: [],
                settings: JSON.stringify(set)
            };
            for (var i = 0; i < vm.locationsGeofence.value.length; i++) {
                vm.locationsGeofence.value[i];
                branch.branchLocations.push({
                    "geofenceId": vm.locationsGeofence.value[i].id,
                    "country":null,
                    "state":null
                });
            }

            for (var i = 0; i < vm.locationsPlace.value.length; i++) {
               var loc = vm.locationsPlace.value[i];
               if(loc.country){
                  if(loc.state){
                    branch.branchLocations.push({
                        "geofenceId": null,
                        "country":loc.country,
                        "state":loc.state
                    });
                  }else{
                    branch.branchLocations.push({
                        "geofenceId": null,
                        "country":loc.country,
                        "state":null
                    });
                  }
               }
            }
            if (!vm.mode.isNew) {
                branch.id = vm.branch.id;
            }

            var promise = vm.mode.isNew ?
                BranchService.saveBranch(RlsUiSession.focus, branch).$promise :
                BranchService.updateBranch(RlsUiSession.focus,branch).$promise;

            promise.then(
                function (result) {
                    vm.branch = result;
                    var message = vm.branch.name + ' has been ' + (vm.mode.isNew ? 'created' : 'updated');

                    BranchesDataService.load();
                    if (vm.mode.isNew) {
                        $state.go('branch.admin', { branchId: result.id});
                        vm.feedback.addSuccess(message);
                        return;
                    }
                    reset();

                    vm.feedback.addSuccess(message);
                },
                function (error) {
                    if (error.status === -1) {
                        vm.feedback.addError('Unable to connect to server.  Please try again later.');
                        return;
                    }

                    if (error.status === 400 && error.data.message.indexOf('already exists') > -1) {
                        vm.geofenceName.errors.isDuplicate = true;
                        return;
                    }

                    if (error.status === 400 && error.data.message.indexOf('Invalid polygon') > -1) {
                        vm.shapeText.errors.isNotValidPolygon = true;
                        return;
                    }

                    if (error.status === 400 && error.data.modelState && error.data.modelState['geofence.ShapeText']) {
                        vm.shapeText.errors.isNotValidPolygon = true;
                        return;
                    }

                    vm.feedback.addError(error.data.message);
                }
            );
        }

     
         function loadGeofences() {
            $rootScope.loading = true;
            vm.geofences = [];
            vm.geofenceLocations=[];
            var radialPromise = RadialGeofencesService.getGeofences(RlsUiSession.focus).$promise;
            radialPromise.then(
                function(result) {
                    vm.geofences = vm.geofences.concat(result);
                    if(vm.branch && vm.branch.branchGeofenceId){
                        var found = result.find(function(g) {
                          return g.id == vm.branch.branchGeofenceId;
                        });
                        if(found){
                           vm.geofence.value = found;
                        }
                    }
                    
                    if(vm.branch && vm.branch.branchLocations){
                        for (var i = 0; i <  result.length; i++) {
                            var geo = result[i];
                            var found = vm.branch.branchLocations.find(function(g) {
                              return geo.id == g.geofenceId;
                            });
                            if(found){
                               vm.locationsGeofence.value.push(geo);
                            }else{
                               vm.geofencesCopy.push(geo); 
                            }
                        }
                        
                    }else{
                        vm.geofencesCopy = vm.geofencesCopy.concat(result); 
                    }                  
                },
                function(error) {
                    console.log(error);
                    vm.feedback.addError(error.data.message);
                }
            );

            var polygonPromise = PolygonGeofencesService.getGeofences(RlsUiSession.focus).$promise;
            polygonPromise.then(
                function(result) {
                    vm.geofences = vm.geofences.concat(result);
                    if(vm.branch && vm.branch.branchGeofenceId){
                        var found = result.find(function(g) {
                          return g.id == vm.branch.branchGeofenceId;
                        });
                        if(found){
                           vm.geofence.value = found;
                        }
                    }

                    if(vm.branch && vm.branch.branchLocations){
                        for (var i = 0; i <  result.length; i++) {
                            var geo = result[i];
                            var found = vm.branch.branchLocations.find(function(g) {
                              return geo.id == g.geofenceId;
                            });
                            if(found){
                               vm.locationsGeofence.value.push(geo);
                            }else{
                               vm.geofencesCopy.push(geo); 
                            }
                        }
                        
                    }else{
                        vm.geofencesCopy = vm.geofencesCopy.concat(result); 
                    }  
                },
                function(error) {
                    console.log(error);
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function loadCountries(){
            var promiseCountry = CountryService.getCountries().$promise;
            promiseCountry.then(
                function(result) {
                    result.sort((c1, c2) => (c1.countryName > c2.countryName) ? 1 : -1);
                    vm.countries = result;
                },
                function (error) {
                    if (error.status !== 404) {
                        vm.feedback.addError(error);
                    }
                }
            );
        }

        function geofenceFilter(geofence) {
            if (!vm.geofence.filterText) {
                return true;
            }

            var searchText = vm.geofence.filterText.toLowerCase();

            return  geofence.name.toLowerCase().indexOf(searchText) > -1 ||
                geofence.address.toLowerCase().indexOf(searchText) > -1 ||
                (geofence.comments !== null && geofence.comments.toLowerCase().indexOf(searchText) > -1);
        }

        function geofenceFilterLocations(geofence) {
            if (!vm.locationsGeofence.filterText) {
                return true;
            }

            var searchText = vm.locationsGeofence.filterText.toLowerCase();

            return  geofence.name.toLowerCase().indexOf(searchText) > -1 ||
                geofence.address.toLowerCase().indexOf(searchText) > -1 ||
                (geofence.comments !== null && geofence.comments.toLowerCase().indexOf(searchText) > -1);
        }

        function selectGeofence(geofence) {
            vm.geofence.value = geofence;
        }

        function selectGeofenceLocation(geofence) {
            var index = vm.geofencesCopy.map(x => {
              return x.id;
            }).indexOf(geofence.id);
            
            vm.geofencesCopy.splice(index, 1);
         
            vm.locationsGeofence.value.push(geofence);
            
            
        }

        function removeGeofence(geofence) {
            var index = vm.locationsGeofence.value.map(x => {
              return x.id;
            }).indexOf(geofence.id);
           
            vm.locationsGeofence.value.splice(index, 1);
          
            vm.geofencesCopy.push(geofence);
        }

        function goToGeofence(geofence) {
            var returnState = $state.current.name;
            var returnStateParams = $state.params;
            $state.go(geofence.type === 'radius' ? 'geofence.radial' : 'geofence.polygon', { geofenceId: geofence.geofenceId, referrer: returnState, referrerParams: returnStateParams } );
        }

        function addPlace(){
            vm.locationsPlace.value.push({country:"",state:"",states:[]});
        }

        function removePlace(index){
            vm.locationsPlace.value.splice(index, 1);
        }

        function getStates(loc){
            if(loc.country){
                var promiseState = StateService.getListStates(loc.country).$promise;
                promiseState.then(
                    function(result) {
                        result.sort((s1, s2) => (s1.stateName > s2.stateName) ? 1 : -1);
                        loc.states = result;
                    },
                    function (error) {
                        if (error.status !== 404) {
                            vm.feedback.addError(error);
                        }
                    }
                );
            }
        }
    }
})();
