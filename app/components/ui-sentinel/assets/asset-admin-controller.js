(function() {
    'use strict';

    angular
        .module('ui-sentinel.assets')
        .controller('AssetAdminController', AssetAdminController);

    AssetAdminController.$inject = ['$rootScope', '$scope', '$state', '$stateParams','SentinelAdminApiService','SentinelAccountApiService','AssetService', 'SentinelUiSession', 'localStorageService','AssetsDataService', 'FeedbackService'];
    function AssetAdminController($rootScope, $scope, $state, $stateParams, SentinelAdminApiService,SentinelAccountApiService, AssetService, SentinelUiSession, localStorageService, AssetsDataService,FeedbackService) {
       
        var vm = {
            asset: null,
            availableDevices: [],
            locationLimit: 5,
            imagesToUpload: [],
            imagesStored: [],
            assetName: {
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
            assetType: {
                value: null,
                isPristine: true,
                errors: {
                    isBlank: true,
                    isDuplicate: true
                },
                hasError: function() {
                    return !this.errors.isBlank && this.errors.isDuplicate;
                },
                validate: function() {
                    this.isPristine = false;
                    this.errors.isDuplicate = false;
                    this.errors.isBlank = !this.value;
                }
            },
            assetManufacturer: {
                value: null,
                isPristine: true,
                errors: {
                    isBlank: true,
                    isDuplicate: true
                },
                hasError: function() {
                    return !this.errors.isBlank && this.errors.isDuplicate;
                },
                validate: function() {
                    this.isPristine = false;
                    this.errors.isDuplicate = false;
                    this.errors.isBlank = !this.value;
                }
            },
            assetManufacturerDate: {
                date: null,
                value: null,
                isPristine: true,
                hasError: function () {
                    if (!this.errors.isBlank) {
                        return this.errors.isBeforeNow || this.errors.isNotADate || this.errors.isTimeBlank || this.errors.isNotATime;
                    } else {
                        return false;
                    }
                },
                errors: {
                    isBlank: true,
                    isBeforeNow: false,
                    isNotADate: false,
                    isNotATime: false,
                    isTimeBlank: false
                },
                validate: validateManufacturerDate
            },
            assetDescription: {
                value: null
            },
            device: {
                value: null,
                valueText: null,
                searchText: null,
                isPristine: true,
                hasError: function () {
                    return this.value === null;
                },
                errors: {
                    isBlank: true,
                    isNotFound: false
                },
                validate: validateDevice
            },
            mode: {
                isNew: false,
                isSaving: false,
                isRemoving: false,
                isChangingLocation: false
            },
            hasPermission: {
                toSave: false
            },
            feedback: FeedbackService,
            actions: {
                close: close,
                calculateSize: calculateSize,
                removeImage: removeImage,
                beginRemove: beginRemove,
                cancelRemove: cancelRemove,
                remove: remove,
                reset: reset,
                submit: submit,
                clearDevice: clearDevice,
                changeDeviceFilter: changeDeviceFilter,
                selectDevice: selectDevice
            }
        };
        activate();
        return vm;

        function validateManufacturerDate() {
            vm.assetManufacturerDate.errors.isBlank = false;
            vm.assetManufacturerDate.errors.isTimeBlank = false;
            vm.assetManufacturerDate.errors.isNotADate = false;
            vm.assetManufacturerDate.errors.isNotATime = false;
            vm.assetManufacturerDate.errors.isBeforeNow = false;
            vm.assetManufacturerDate.isPristine = false;

            vm.assetManufacturerDate.errors.isBlank = typeof vm.assetManufacturerDate.date === 'undefined' || vm.assetManufacturerDate.date === null;
            if (vm.assetManufacturerDate.errors.isBlank) {
                return;
            }

            var beginDateTimeMoment = moment(vm.assetManufacturerDate.date);
            

            vm.assetManufacturerDate.value = beginDateTimeMoment.toDate();
        }

        ////////////////////////////////////////////

        function activate() {
            console.log("assetAdmin page");
            $('#assetManufacturerDate').datepicker({beforeShow: function() {
                  setTimeout(function(){
                    $('.ui-datepicker').css('z-index', 99999999999999);
                  }, 0);
                }
            });
            setPermissions();
            $rootScope.$on('CLIENT_FOCUS_CHANGED', function (event, args) {
                if ($state.current.name === 'asset.admin' || $state.current.name === 'asset.new') {
                    AssetsDataService.load();
                    $state.go('asset.list');
                }
            });

            $rootScope.$on("assetUploadImageListener", function(event, data){
                console.log("assetUploadImageListener",data);
                vm.imagesToUpload = data;
            });

            if ($stateParams.sentinelId) { //edit mode
                load();
            }
            else { //mode new
                vm.mode.isNew = true;
                reset();                
            }
        }

         function calculateSize(filesize){
            return ((filesize/(1024*1024)) > 1)? (filesize/(1024*1024)) + ' MB' : (filesize/        1024)+' KB';
        }

        function removeImage(image, index){
             $rootScope.loading = true;
            var promise = AssetService.removeImage(image.name).$promise;

            promise.then(
                function(result) {
                    console.log("removed",result);
                    $rootScope.loading = false;
                    vm.imagesStored.splice(index,1);
                },
                function(error) {
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                   $rootScope.loading = false;
            });
            
        }
        
        function validateDevice() {
            vm.device.isPristine = false;
            vm.device.errors.isNotFound = false;
            vm.device.errors.isBlank = vm.device.value === null;
            if (vm.device.errors.isBlank) {
                return;
            }

            /*var promise = SentryAccountApiService.getDevicesForASML(service.device.value.imei).$promise;
            promise.then(
                function(result) {
                    //we expect this
                },
                function(error) {
                    service.device.errors.isNotFound = true;
                }
            );*/
        }
        
        function clearDevice() {
            vm.device.value = null;
            vm.device.valueText = null;
            vm.device.searchText = null;
            vm.device.isPristine = true;
            changeDeviceFilter("");
        }

        function changeDeviceFilter(filter){

            if(filter === "" || filter === null)
                filter = "1";

            console.log("changeDeviceFilter",filter);

            $rootScope.loading = true;
            var promise = SentinelAccountApiService.getSentinelsForASML(SentinelUiSession.focus,filter).$promise;

            promise.then(
                function(result) {
                    console.log("Sentys",result);
                    vm.availableDevices = result;
                    //onReportsChange();
                },
                function(error) {
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                   $rootScope.loading = false;
            });
            
        }

        function selectDevice(device) {
            vm.device.isPristine = false;
            vm.device.value = device;
            vm.device.valueText = device.deviceId;
        }
        
        function beginRemove() {
            vm.mode.isRemoving = true;
        }

        function cancelRemove() {
            vm.mode.isRemoving = false;
        }

        
        function close() {
            vm.asset = null;
            $state.go($stateParams.referrer, $stateParams.referrerParams);            
        }

        function load() {
            console.log("load",$stateParams.sentinelId);
            var promise = AssetService.getAsset(SentinelUiSession.focus,$stateParams.sentinelId).$promise;
            promise.then(
                function(result) {
                    vm.asset = result;
                    vm.asset.sentinelId = $stateParams.sentinelId;
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
            console.log("vm.asset",vm.asset);
            var promise = AssetService.removeAsset(SentinelUiSession.focus,vm.asset).$promise;
            promise.then(
                function(result) {
                    vm.mode.isRemoving = false;
                    AssetsDataService.load();
                    $state.go('assets.list');
                },
                function (error) {
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function reset() {
            vm.mode.isChangingLocation = vm.mode.isNew;

            
            if (!vm.mode.isNew) {
                $state.current.data.subTitle = vm.asset.name;
                vm.assetName.value = vm.asset.assetName;
                vm.assetType.value = vm.asset.assetType;
                vm.sentinelId = vm.asset.sentinelId;
                vm.assetManufacturer.value = vm.asset.manufacturer;
                vm.assetManufacturerDate.date = moment(vm.asset.manufacturerDate).format('L');
                vm.assetManufacturerDate.value = moment(vm.asset.manufacturerDate).toDate();
                vm.assetDescription.value = vm.asset.assetNotes;
                vm.actions.selectDevice({deviceId:vm.asset.sentinelId });

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
            else {
                vm.assetName.value = null;
                vm.assetDescription.value = null;
                vm.assetType.value = null;
                vm.assetManufacturer.value = null;
                vm.assetManufacturerDate.date = moment(new Date()).format('L');
                vm.assetManufacturerDate.value = moment(new Date()).toDate();
                vm.device.value = null;
                vm.device.valueText=null;
                vm.device.searchText=null;
                vm.device.type="Sentry";
                vm.device.isPristine=true;
                vm.imagesToUpload.splice(0,vm.imagesToUpload.length);
                vm.imagesStored=[];
                vm.availableDevices=[];
                changeDeviceFilter("");
            }

            vm.assetName.isPristine = true;
            vm.assetName.errors.isBlank = true;
            vm.assetName.errors.isDuplicate = false;

            vm.assetType.isPristine = true;
            vm.assetType.errors.isBlank = true;
            vm.assetType.errors.isDuplicate = false;

            vm.assetManufacturer.isPristine = true;
            vm.assetManufacturer.errors.isBlank = true;
            vm.assetManufacturer.errors.isDuplicate = false;

            vm.assetManufacturerDate.isPristine = true;
            vm.assetManufacturerDate.errors.isBlank = true;
            vm.assetManufacturerDate.errors.isDuplicate = false;
        

        }

        function setPermissions() {
            vm.hasPermission.toSave =
                SentinelUiSession.user.isSystemAdmin ||
                SentinelUiSession.user.isAccountAdmin ||
                SentinelUiSession.user.isAccountEditor;
        }


        function submit() {
            vm.feedback.clear();

            vm.assetName.validate();
            vm.assetType.validate();
            vm.assetManufacturer.validate();
            vm.assetManufacturerDate.validate();
            vm.device.validate();

            console.log("assetManufacturerDate hasError",vm.assetManufacturerDate.hasError());

            if (vm.assetName.hasError() || vm.assetType.hasError() || vm.assetManufacturer.hasError() || vm.assetManufacturerDate.hasError()) {
                return;
            }

            var asset = {
                assetName: vm.assetName.value,
                manufacturer: vm.assetManufacturer.value,
                manufacturerDate: vm.assetManufacturerDate.value,
                assetType: vm.assetType.value,
                assetNotes: vm.assetDescription.value,
            };
            if (!vm.mode.isNew) {
                asset.sentinelId = vm.device.value.deviceId;
            }
           
            var promise = vm.mode.isNew ? AssetService.saveAsset(SentinelUiSession.focus, vm.device.value.deviceId, asset).$promise : 
                    AssetService.updateAsset(SentinelUiSession.focus, vm.device.value.deviceId, asset).$promise;

            promise.then(
                function (result) {
                    vm.asset = asset;
                    var message = vm.asset.assetName + ' has been ' + (vm.mode.isNew ? 'created' : 'updated');

                    AssetsDataService.load();
                     if(vm.imagesToUpload.length>0){

                        var promises = [];

                        vm.imagesToUpload.forEach(function(image, index, arrayObj){
                            promises.push(AssetService.addImage(SentinelUiSession.focus,vm.device.value.deviceId,image.type, image).$promise);
                        });

                        $rootScope.loading = true;

                        Promise.all(promises)
                            .then(function(){
                                $rootScope.loading = false;
                                vm.imagesToUpload.splice(0,vm.imagesToUpload.length);

                                    if (vm.mode.isNew) {
                                        $state.go('asset.admin', { sentinelId: vm.device.value.deviceId});
                                        vm.feedback.addSuccess(message);
                                        return;
                                    }

                                 reset();
                                vm.feedback.addSuccess(message);
                            })
                            .catch(function(e){
                                // handle errors here
                                $rootScope.loading = false;
                                console.log(e);
                            });            



                     } else {
                         if (vm.mode.isNew) {
                                $state.go('asset.admin', { sentinelId: vm.asset.sentinelId});
                                vm.feedback.addSuccess(message);
                                return;
                            }
                            reset();

                            vm.feedback.addSuccess(message);
                     }
                   
                },
                function (error) {
                    console.log(error);
                    if (error.status === -1) {
                        vm.feedback.addError('Unable to connect to server.  Please try again later.');
                        return;
                    }

                    if (error.status === 400 && error.data.message.indexOf('already exists') > -1) {
                        vm.assetName.errors.isDuplicate = true;
                        return;
                    }

                    vm.feedback.addError(error.data.message);
                }
            );
        }
    }
})();