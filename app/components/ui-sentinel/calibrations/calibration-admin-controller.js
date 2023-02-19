(function() {
    'use strict';

    angular
        .module('ui-sentinel.calibrations')
        .controller('CalibrationAdminController', CalibrationAdminController);

    CalibrationAdminController.$inject = ['$q', '$rootScope', '$scope', '$state', '$stateParams', 'AssetService', 'SentinelAdminApiService','SentinelAccountApiService','CalibrationService', 'SentinelUiSession', 'localStorageService','CalibrationsDataService', 'FeedbackService'];
    function CalibrationAdminController($q, $rootScope, $scope, $state, $stateParams, AssetService, SentinelAdminApiService, SentinelAccountApiService, CalibrationService, SentinelUiSession, localStorageService, CalibrationsDataService, FeedbackService) {
       
        var vm = {
            calibration: null,
            asset: null,
            locationLimit: 5,
            locations: [],
            techDataSheetsToUpload: [],
            techDataSheetsStored: [],
            lastCalibrationFilesToUpload: [],
            lastCalibrationFilesStored: [],
            primarySupplierName: {
                value: null,
                isPristine: true,
                errors: {
                    isBlank: true
                },
                hasError: function() {
                    return false;
                },
                validate: function() {
                    this.isPristine = false;
                    this.errors.isBlank = !this.value;
                }
            },
            primarySupplierAdress: {
                value: null,
                isPristine: true,
                errors: {
                    isBlank: true,
                    isInvalid: true,
                },
                hasError: function() {
                    return !this.errors.isBlank && this.errors.isInvalid;
                },
                validate: validatePrimarySupplierAdress
            },
            lastCalibrationDate: {
                date: moment().format('L'),
                value: moment().toDate(),
                isPristine: true,
                hasError: function () {
                    return this.errors.isBlank || this.errors.isNotADate;
                },
                errors: {
                    isBlank: true,
                    isNotADate: false,
                },
                validate: validateLastCalibrationDate
            },
            nextDueDate: {
                date: moment().format('L'),
                value: moment().toDate(),
                isPristine: true,
                hasError: function () {
                    return this.errors.isBlank || this.errors.isBeforeNow || this.errors.isNotADate;
                },
                errors: {
                    isBlank: true,
                    isBeforeNow: false,
                    isNotADate: false,
                },
                validate: validateNextDueDate
            },
            productLine: {
                value: null,
                isPristine: true,
                errors: {
                    isBlank: true
                },
                hasError: function() {
                    return false;
                },
                validate: function() {
                    this.isPristine = false;
                    this.errors.isBlank = !this.value;
                }
            },
            manufacturerOfOrigin: {
                value: null,
                isPristine: true,
                errors: {
                    isBlank: true
                },
                hasError: function() {
                    return false;
                },
                validate: function() {
                    this.isPristine = false;
                    this.errors.isBlank = !this.value;
                }
            },
            specialInstructions: {
                value: null
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
                getLocations: getLocations,
                selectLocation:selectLocation,
                close: close,
                calculateSize: calculateSize,
                removeFile: removeFile,
                beginRemove: beginRemove,
                cancelRemove: cancelRemove,
                remove: remove,
                reset: reset,
                submit: submit,
            }
        };
        activate();
        return vm;

        function validateLastCalibrationDate() {
            vm.lastCalibrationDate.errors.isBlank = false;
            vm.lastCalibrationDate.errors.isNotADate = false;
            vm.lastCalibrationDate.isPristine = false;

            vm.lastCalibrationDate.errors.isBlank = typeof vm.lastCalibrationDate.date === 'undefined' || vm.lastCalibrationDate.date === "" || vm.lastCalibrationDate.date === null;
            if (vm.lastCalibrationDate.errors.isBlank) {
                return;
            }

            var beginDateTimeMoment = moment(vm.lastCalibrationDate.date);

            vm.lastCalibrationDate.value = beginDateTimeMoment.toDate();
        }

        function validateNextDueDate() {
            vm.nextDueDate.errors.isBlank = false;
            vm.nextDueDate.errors.isNotADate = false;
            vm.nextDueDate.errors.isBeforeNow = false;
            vm.nextDueDate.isPristine = false;

            vm.nextDueDate.errors.isBlank = typeof vm.nextDueDate.date === 'undefined' || vm.nextDueDate.date === "" || vm.nextDueDate.date === null;
            if (vm.nextDueDate.errors.isBlank) {
                return;
            }

            var beginDateTimeMoment = moment(vm.nextDueDate.date);

            vm.nextDueDate.value = beginDateTimeMoment.toDate();
        }

        function getLocations() {
            console.log("getLocations");
           

            vm.locations = [];
            var geoCoder = new google.maps.Geocoder();
            geoCoder.geocode({ 'address': vm.primarySupplierAdress.value}, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                   console.log("results",results); 
                    if (results.length === 1) {
                        selectLocation(results[0]);
                    }
                    else {
                        vm.locations = results;
                    }
                }

                $scope.$apply();
            });
        }

        function selectLocation(location) {
            console.log("select location",location);
           
            vm.primarySupplierAdress.value = location.formatted_address;
          
        }

        function validatePrimarySupplierAdress() {
            var deferred = $q.defer();
            vm.primarySupplierAdress.errors.isBlank = false;
            vm.primarySupplierAdress.isPristine = false;

            vm.primarySupplierAdress.errors.isBlank = typeof vm.primarySupplierAdress.value === 'undefined' || vm.primarySupplierAdress.value === null  || vm.primarySupplierAdress.value === "";

            if (vm.primarySupplierAdress.errors.isBlank) {
                vm.primarySupplierAdress.errors.isInvalid = false;
                deferred.resolve();
                return deferred.promise;
            }

            var geoCoder = new google.maps.Geocoder();

            geoCoder.geocode({ 'address': vm.primarySupplierAdress.value}, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK && results.length > 0) {
                    vm.primarySupplierAdress.errors.isInvalid = false;
                    deferred.resolve(results);
                } else {
                    vm.primarySupplierAdress.errors.isInvalid = true;
                    deferred.reject("Couldn't find that address! Google Maps says: " + status);
                }

                $scope.$apply();
            });

            return deferred.promise;
        }

        ////////////////////////////////////////////

        function activate() {
            vm.feedback.clear();
            $('#lastCalibrationDate').datepicker();
            $('#nextDueDate').datepicker();
            setPermissions();

            $rootScope.$on("calibrationUploadLastCalibrationFileListener", function(event, data){
                console.log("calibrationUploadLastCalibrationFileListener",data);
                vm.lastCalibrationFilesToUpload = data;
            });

            $rootScope.$on("calibrationUploadTechDataSheetListener", function(event, data){
                console.log("calibrationUploadTechDataSheetListener",data);
                vm.techDataSheetsToUpload = data;
            });

            $rootScope.$on("calibrationUploadLastCalibrationFileListener", function(event, data){
                console.log("calibrationUploadLastCalibrationFileListener",data);
                vm.lastCalibrationFilesToUpload = data;
            });

            if ($stateParams.calibrationId) { //edit mode
                load();
            } else if ($stateParams.sentinelId) { //mode new
                var calibrationPromise = CalibrationService.getCalibrations($stateParams.sentinelId).$promise;

                calibrationPromise.then(
                    function(result) {
                        console.log(result);
                        $rootScope.loading = false;
                    },
                    function (error) {
                    }
                );

                vm.asset = typeof $stateParams.asset !== 'undefined' ? $stateParams.asset : null;
                vm.mode.isNew = true;
                reset();                
            }
        }

         function calculateSize(filesize){
            return ((filesize/(1024*1024)) > 1)? (filesize/(1024*1024)) + ' MB' : (filesize/        1024)+' KB';
        }

        function removeFile(file, index, type){
             $rootScope.loading = true;
            var promise = CalibrationService.removeDataFile(file.name).$promise;

            promise.then(
                function(result) {
                    console.log("removed",result);
                    $rootScope.loading = false;
                    if (type == "last-calibration") {
                        vm.lastCalibrationFilesStored.splice(index,1);
                    } else {
                        vm.techDataSheetsStored.splice(index,1);
                    }
                },
                function(error) {
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                   $rootScope.loading = false;
            });
            
        }
        
        function beginRemove() {
            vm.mode.isRemoving = true;
        }

        function cancelRemove() {
            vm.mode.isRemoving = false;
        }

        
        function close() {
            vm.calibration = null;
            $state.go($stateParams.referrer, $stateParams.referrerParams);            
        }

        function load() {
            $rootScope.loading = true;
            //console.log("load",$stateParams.calibrationId);
            var promise = CalibrationService.getCalibration($stateParams.calibrationId).$promise;
            promise.then(
                function(result) {
                    vm.calibration = result;
                    vm.calibration.assetCalibrationId = $stateParams.calibrationId;

                    var assetpromise = AssetService.getAsset(SentinelUiSession.focus, vm.calibration.deviceId).$promise;
                    assetpromise.then(
                        function(result) {
                            vm.asset = result;
                            reset();
                        },
                        function (error) {
                            if (error.status !== 404) {
                                vm.feedback.addError(error);
                            }
                        }
                    );
                },
                function (error) {
                    if (error.status !== 404) {
                        vm.feedback.addError(error);
                    }
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function remove() {
            vm.feedback.clear();
            $rootScope.loading = true;
            var promise = CalibrationService.removeCalibration(vm.calibration.assetCalibrationId).$promise;
            promise.then(
                function(result) {
                    vm.mode.isRemoving = false;
                    CalibrationsDataService.load();
                    vm.feedback.addSuccess('Calibration ' + vm.calibration.assetCalibrationId + ' has been removed');
                    $rootScope.loading = false;
                    $state.go('assets.list');
                },
                function (error) {
                    $rootScope.loading = false;
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function reset() {
            vm.mode.isChangingLocation = vm.mode.isNew;
            
            if (!vm.mode.isNew) {
                vm.primarySupplierName.value = vm.calibration.primarySupplierName;
                vm.primarySupplierAdress.value = vm.calibration.primarySupplierAdress;

                vm.lastCalibrationDate.value = moment(vm.calibration.lastCalibrationDate).toDate();
                vm.lastCalibrationDate.date = moment(vm.calibration.lastCalibrationDate).format('L');
               
                vm.nextDueDate.value = moment(vm.calibration.nextDueDate).toDate();
                vm.nextDueDate.date =  moment(vm.calibration.nextDueDate).format('L');
               
                vm.productLine.value = vm.calibration.productLine;
                vm.manufacturerOfOrigin.value = vm.calibration.manufacturerOfOrigin;
                vm.specialInstructions.value = vm.calibration.specialInstructions;
                $rootScope.loading = true;
                var lastCalibrationFilesPromise = CalibrationService.getLastCalibrationFiles(vm.calibration.assetCalibrationId).$promise;
                lastCalibrationFilesPromise.then(
                    function(result) {
                        $rootScope.loading = false;
                        vm.lastCalibrationFilesStored = result;
                        console.log("lastCalibrationFilesStored",result);
                    },
                    function (error) {
                        $rootScope.loading = false;
                        if (error.status !== 404) {
                            vm.feedback.addError(error);
                        }
                    }
                );

                var techDataFilesPromise = CalibrationService.getTechDataFiles(vm.calibration.assetCalibrationId).$promise;
                techDataFilesPromise.then(
                    function(result) {
                        vm.techDataSheetsStored = result;
                       console.log("techDataSheetsStored",result);
                    },
                    function (error) {
                        if (error.status !== 404) {
                            vm.feedback.addError(error);
                        }
                    }
                );

            } else {
                vm.primarySupplierName.value = null;
                vm.primarySupplierAdress.value = null;
                vm.lastCalibrationDate.value = null;
                vm.nextDueDate.value = null;
                vm.productLine.value = null;
                vm.manufacturerOfOrigin.value = typeof $stateParams.asset !== 'undefined' && typeof $stateParams.asset.manufacturer !== 'undefined' ? $stateParams.asset.manufacturer : null;
                vm.specialInstructions.value = null;

                vm.lastCalibrationFilesToUpload.splice(0,vm.lastCalibrationFilesToUpload.length);
                vm.techDataSheetsToUpload.splice(0,vm.techDataSheetsToUpload.length);

                vm.lastCalibrationFilesStored = [];
                vm.techDataSheetsStored = [];
            }

            vm.primarySupplierName.isPristine = true;
            vm.primarySupplierName.errors.isBlank = true;

            vm.primarySupplierAdress.isPristine = true;
            vm.primarySupplierAdress.errors.isBlank = true;
            vm.primarySupplierAdress.errors.isInvalid = true;

            vm.lastCalibrationDate.isPristine = true;
            vm.lastCalibrationDate.errors.isBlank = true;
            vm.lastCalibrationDate.errors.isNotADate = false;
                    
            vm.nextDueDate.isPristine = true;
            vm.nextDueDate.errors.isBlank = true;
            vm.nextDueDate.errors.isBeforeNow = false;
            vm.nextDueDate.errors.isNotADate = false;

            vm.productLine.isPristine = true;
            vm.productLine.errors.isBlank = true;

            vm.manufacturerOfOrigin.isPristine = true;
            vm.manufacturerOfOrigin.errors.isBlank = true;
        

        }

        function setPermissions() {
            vm.hasPermission.toSave =
                SentinelUiSession.user.isSystemAdmin ||
                SentinelUiSession.user.isAccountAdmin ||
                SentinelUiSession.user.isAccountEditor;
        }


        function submit() {
            vm.feedback.clear();
            vm.primarySupplierName.validate();
            vm.lastCalibrationDate.validate();
            vm.nextDueDate.validate();
            vm.productLine.validate();
            vm.manufacturerOfOrigin.validate();

            vm.primarySupplierAdress.validate().then(function(result) {
                if (vm.primarySupplierName.hasError() || vm.primarySupplierAdress.hasError() || vm.lastCalibrationDate.hasError() || vm.nextDueDate.hasError() || vm.productLine.hasError() || vm.manufacturerOfOrigin.hasError()) {
                    return;
                }

                var deviceId = vm.calibration !== null && typeof vm.calibration.deviceId !== 'undefined' ? vm.calibration.deviceId : null;

                if (deviceId === null && typeof $stateParams.sentinelId !== 'undefined') {
                    deviceId = $stateParams.sentinelId;
                }

                var completedFlag = vm.calibration !== null && typeof vm.calibration.completedFlag !== 'undefined' ? vm.calibration.completedFlag : false;

                var calibration = {
                    deviceId: deviceId,
                    accountId: SentinelUiSession.focus.id,
                    primarySupplierName: vm.primarySupplierName.value,
                    primarySupplierAdress: vm.primarySupplierAdress.value,
                    lastCalibrationDate: vm.lastCalibrationDate.value,
                    nextDueDate: vm.nextDueDate.value,
                    productLine: vm.productLine.value,
                    manufacturerOfOrigin: vm.manufacturerOfOrigin.value,
                    specialInstructions: vm.specialInstructions.value,
                    completedFlag: completedFlag,
                    isDeleted: false,
                };

                var promiseCalibration = null;
                if (!vm.mode.isNew) {
                    calibration.assetCalibrationId = vm.calibration.assetCalibrationId;
                    calibration.sentinelAssignmentId = vm.calibration.sentinelAssignmentId;

                    promiseCalibration = CalibrationService.updateCalibration(calibration).$promise;
                } else {
                    promiseCalibration = CalibrationService.saveCalibration(calibration).$promise;
                }

                promiseCalibration.then(
                    function (result) {
                        vm.calibration = result;
                        var message = 'Calibration has been ' + (vm.mode.isNew ? 'created' : 'updated') + ' for asset ' + vm.asset.assetName;

                        //CalibrationsDataService.load();
                        if (vm.techDataSheetsToUpload.length > 0 || vm.lastCalibrationFilesToUpload.length > 0) {

                            var promises = [];

                            vm.techDataSheetsToUpload.forEach(function(file, index, arrayObj){
                                promises.push(CalibrationService.addTechDataFile(vm.calibration.assetCalibrationId, file.type, file.name, file).$promise);
                            });

                            vm.lastCalibrationFilesToUpload.forEach(function(file, index, arrayObj){
                                promises.push(CalibrationService.addLastCalibrationFile(vm.calibration.assetCalibrationId, file.type, file.name, file).$promise);
                            });

                            $rootScope.loading = true;

                            Promise.all(promises)
                                .then(function(){
                                    $rootScope.loading = false;
                                    vm.techDataSheetsToUpload.splice(0,vm.techDataSheetsToUpload.length);
                                    vm.lastCalibrationFilesToUpload.splice(0,vm.lastCalibrationFilesToUpload.length);

                                    if (vm.mode.isNew) {
                                        $state.go('calibration.admin', { calibrationId: vm.calibration.assetCalibrationId });
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
                                $state.go('calibration.admin', { calibrationId: vm.calibration.assetCalibrationId });
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

                        vm.feedback.addError(error.data.message);
                    }
                );
            }, function(error) {
                console.log(error);
            });
        }
    }
})();
