(function () {
    'use strict';

    angular
        .module('ui-sentinel.shipments.shipmentAdmin')
        .directive('shipmentAdminStops', ShipmentAdminStopsDirective);

    function ShipmentAdminStopsDirective() {
        var directive = {
            restrict: 'A',
            controller: ThisDirectiveController,
            controllerAs: 'shipmentAdminStops',
            templateUrl: 'ui-sentinel-shipments.shipmentAdmin/shipment-admin-stops-directive.html',
            link: link
        };
        return directive;

        function link(scope, element, attrs, controller) {
            scope.$watch(
                function(scope) {
                    return scope.shipmentAdmin.editor;
                },
                function (newValue, oldValue) {
                    controller.editor = newValue;
                }, true
            );
        }        
    }

    ThisDirectiveController.$inject = ['$rootScope','SentinelUiSession', 'FeedbackService', 'ShipmentsService'];
    function ThisDirectiveController($rootScope, SentinelUiSession, FeedbackService, ShipmentsService) {
        var vm = {
            editor: null,
            stop: null,
            feedback: FeedbackService,
            panel: {
                isCollapsed: true,
                toggle: function () {
                    this.isCollapsed = !this.isCollapsed;
                    if(!this.isCollapsed){
                        vm.editor.loadGeofences();
                    }
                }
            },
            mode: {
                isAdding: false,
                isEditing: false,
                isRemoving: false,
                isMarking: false
            },
            hasPermission: {
                toChange: false
            },
            actions: {
                beginAdd: beginAdd,
                saveAdd: saveAdd,
                endAdd: endAdd,
                beginEdit: beginEdit,
                endEdit: endEdit,
                saveEdit: saveEdit,
                beginRemove: beginRemove,
                endRemove: endRemove,
                saveRemove: saveRemove,
                beginMarkStopArrival: beginMarkStopArrival,
                endMarkStopArrival: endMarkStopArrival,
                saveMarkStopArrival: saveMarkStopArrival
            }
        };
        activate();
        return vm;

        function activate() {
            setPermissions();
        }

        function beginAdd() {
            console.log(vm.editor);
            vm.stop = vm.editor.newEditorStop('address');
            vm.mode.isAdding = true;
        }

        function beginEdit(stop, label) {
            console.log(vm.editor);
            vm.stop = vm.editor.editorStop(stop);
            vm.stop.label = label;
            vm.mode.isEditing = true;
        }

        function beginMarkStopArrival(stop) {
            vm.stop = stop;
            vm.mode.isMarking = true;
        }

        function beginRemove(stop) {
            vm.stop = stop;
            vm.mode.isRemoving = true;
        }

        function endAdd() {
            vm.mode.isAdding = false;
            vm.stop = null;
        }

        function endEdit() {
            vm.mode.isEditing = false;
            vm.stop = null;
        }

        function endMarkStopArrival() {
            vm.mode.isMarking = false;
            vm.stop = null;
        }

        function endRemove() {
            vm.mode.isRemoving = false;
            vm.stop = null;
        }

        function saveAdd() {
            vm.stop.validate();
            console.log("vm.stop",vm.stop);
            if (!vm.stop.hasError()) {
                vm.feedback.clear();
                var stopAlreadyExist = false;
                if(vm.editor.shipment.shipmentStops && vm.editor.shipment.shipmentStops.length>0){
                    console.log("others",vm.editor.shipment.shipmentStops);
                   for(var i=0;i<vm.editor.shipment.shipmentStops.length;i++){
                       var s = vm.editor.shipment.shipmentStops[i];
                       console.log("s",s);
                       if(s.shipmentStopRadialGeofence &&  vm.stop.type == "address"){
                            if(vm.stop.address.value === s.address){
                                stopAlreadyExist = true;
                                break;
                            }
                       } else if(s.shipmentStopPolygonGeofence && vm.stop.type === "geofence"){
                            if(vm.stop.geofence.name === s.nameForAddress){
                                stopAlreadyExist = true;
                                break;
                            }
                        }
                   }
               }
               console.log("stopAlreadyExist",stopAlreadyExist);
               if(stopAlreadyExist){
                    endAdd();
                   vm.feedback.addError("Stop already exists");
                   $(window).scrollTop(0,0);
                   return;
               }
                var stopToSave = vm.editor.stopToSave(vm.stop);
                var promise = ShipmentsService.addStop(vm.editor.shipment.shipmentInfo.shipmentId, stopToSave).$promise;
                $rootScope.loading = true;
                promise.then(
                    function (result) {
                        $rootScope.loading = false;
                        vm.editor.shipment.shipmentStops.push(result);
                        endAdd();
                    },
                    function (error) {
                        $rootScope.loading = false;
                        vm.feedback.addError(error.data.message);
                    }
                );

            }
        }

        function saveEdit() {
            vm.stop.validate();
            if (!vm.stop.hasError()) {
                vm.feedback.clear();
                var stopAlreadyExist = false;
                if(vm.editor.shipment.shipmentStops && vm.editor.shipment.shipmentStops.length>0){
                    console.log("others",vm.editor.shipment.shipmentStops);
                   for(var i=0;i<vm.editor.shipment.shipmentStops.length;i++){
                       var s = vm.editor.shipment.shipmentStops[i];
                       console.log("s",s);
                       if(s.destinationId == vm.stop.destinationId)
                            continue;
                       if(s.shipmentStopRadialGeofence &&  vm.stop.type == "address"){
                            if(vm.stop.address.value === s.address){
                                stopAlreadyExist = true;
                                break;
                            }
                       } else if(s.shipmentStopPolygonGeofence && vm.stop.type === "geofence"){
                            if(vm.stop.geofence.name === s.nameForAddress){
                                stopAlreadyExist = true;
                                break;
                            }
                        }
                   }
               }
               console.log("stopAlreadyExist",stopAlreadyExist);
               if(stopAlreadyExist){
                    endEdit();
                   vm.feedback.addError("Stop already exists");
                   $(window).scrollTop(0,0);
                   return;
               }
                var stopToSave = vm.editor.stopToSave(vm.stop);
                var promise = ShipmentsService.updateStop(vm.editor.shipment.shipmentInfo.shipmentId, stopToSave).$promise;
                promise.then(
                    function (result) {
                        var index = _.findIndex(vm.editor.shipment.shipmentStops, function (stop) {
                            return stop.destinationId === result.destinationId;
                        });
                        vm.editor.shipment.shipmentStops[index] = result;
                        endEdit();
                    },
                    function (error) {
                        vm.feedback.addError(error.data.message);
                    }
                );

            }
        }

        function saveRemove() {
            vm.feedback.clear();
            var promise = ShipmentsService.removeStop(vm.editor.shipment.shipmentInfo.shipmentId, vm.stop).$promise;
            promise.then(
                function (result) {
                    _.remove(vm.editor.shipment.shipmentStops, function(stop) {
                        return stop.destinationId === vm.stop.destinationId;
                    });
                    checkStopsForArrival();
                    endRemove();
                },
                function (error) {
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function saveMarkStopArrival() {
            vm.feedback.clear();
            var promise = ShipmentsService.markStopArrival(vm.editor.shipment.shipmentInfo.shipmentId, vm.stop).$promise;
            promise.then(
                function (result) {
                    vm.stop.hasArrived = true;
                    checkStopsForArrival();
                    endMarkStopArrival();
                },
                function (error) {
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function setPermissions() {
            vm.hasPermission.toChange =
                SentinelUiSession.user.isSystemAdmin || 
                SentinelUiSession.user.isAccountAdmin ||
                SentinelUiSession.user.isAccountEditor;
        }

        function checkStopsForArrival() {
            var allStopsComplete = true;
            _.forEach(vm.editor.shipment.shipmentStops, function (stop) {
                if (!stop.hasArrived) {
                    allStopsComplete = false;
                    return false;
                }
            });

            if (!allStopsComplete) {
                return;
            }

            //vm.editor.canEdit = false;
            //vm.editor.shipment.shipmentInfo.status = 'completed';
            //vm.editor.completeShipment();
        }

    }

})();