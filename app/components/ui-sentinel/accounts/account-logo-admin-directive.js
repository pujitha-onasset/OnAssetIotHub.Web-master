(function () {
    'use strict';

    angular
        .module('ui-sentinel.accounts')
        .directive('accountLogoAdmin', AccountLogoAdminDirective);

    function AccountLogoAdminDirective() {
        var directive = {
            restrict: 'A',
            controller: ThisDirectiveController,
            controllerAs: 'accountLogoAdmin',
            templateUrl: 'ui-sentinel-accounts/account-logo-admin-directive.html',
            link: link
        };
        return directive;

        function link(scope, element, attrs, controller) {
            scope.$watch(
                function(scope) {
                    return scope.accountListUi.account;
                },
                function (newValue, oldValue) {
                    controller.account = newValue;
                }, true
            );
        }
    }

    ThisDirectiveController.$inject = ['$scope', 'AccountApiService', 'SentinelUiSession', 'FeedbackService'];
    function ThisDirectiveController($scope, AccountApiService, SentinelUiSession, FeedbackService) {
        var vm = {
            account: null,
            feedback: FeedbackService,
            logo: null,
            logoFile: null,
            imageObj: null,
            changeImage: null,
            isImageTooBig: false,
            hasLogo: false,
            panel: {
                isCollapsed: true,
                toggle: function () {
                    this.isCollapsed = !this.isCollapsed;
                    if (!this.isCollapsed) { load(); }
                }
            },
            mode: {
                isChanging: false
            },
            hasPermission: {
                toChange: false
            },
            actions: {
                beginChange: beginChange,
                beginRemove: beginRemove,
                endChange: endChange,
                saveChange: saveChange,
                onFileChange: onFileChange,
                clear: clear,
                reset: function() {
                    load();
                },
                reload: load
            }
        };
        activate();
        return vm;

        function activate() {
            setPermissions();
        }

        function beginChange() {
            vm.isImageOk = false;
            vm.changeImage = null;
            vm.mode.isChanging = true;

            clearCanvas(document.getElementById('changeCanvas'));
            document.getElementById('changeLogoForm').reset();
        }

        function beginRemove() {
            vm.mode.isRemoving = true;
        }

        function clear() {
            vm.feedback.clear();
            if(vm.logo != null){
                var promise = AccountApiService.removeEmailLogo(vm.logo.name).$promise;
                promise.then(
                    function (result) {
                        showDefaultImage();
                        endChange();
                    },
                    function (error) {
                        vm.feedback.addError(error.data.message);
                    }
                );
            }
        }

        function clearCanvas(canvas) {
            canvas.getContext('2d').clearRect(0,0, canvas.width, canvas.height);
            canvas.width = 200;
            canvas.height = 80;
        }

        function drawImage(image, canvas) {
            canvas.width = image.naturalWidth + 20;
            canvas.height = image.naturalHeight + 20;
            canvas.getContext('2d').drawImage(image, 10, 10, image.naturalWidth, image.naturalHeight);
        }

        function endChange() {
            vm.mode.isChanging = false;
            vm.mode.isRemoving = false;
            vm.changeImage = null;
            $('#fileInput').value = "";
        }

        function load() {
            vm.feedback.clear();
            console.log("load",vm.account);
            if (vm.account === null) {
                return;
            }

            vm.hasLogo = false;
            var promise = AccountApiService.getEmailLogo(vm.account).$promise;
            promise.then(
                function (result) {
                    console.log("load result",result);
                    if (!result || !result.url) {
                        showDefaultImage();
                        return;
                    }

                    vm.logo = result;
                    var canvas = document.getElementById('logoCanvas');

                    var imageObj = new Image();
                    imageObj.src = result.url;

                    imageObj.onload = function() {
                        vm.hasLogo = true;
                        drawImage(imageObj, canvas);
                        $scope.$apply();
                    };

                },
                function (error) {
                    showDefaultImage();
                }
            );
        }

        function onFileChange() {
            var files = $('#fileInput').prop('files');
            console.log("onFileChange",files);
            if (!files) {
                return;
            }

            vm.isImageTooBig = false;

            var file = files[0];
            var reader = new FileReader();
            reader.onload = function() {
                var fileContents = reader.result;

                var canvas = document.getElementById('changeCanvas');

                var imageObj = new Image();
                imageObj.onload = function() {
                    vm.changeImage = imageObj;
                    if (imageObj.naturalWidth > 300 || imageObj.naturalHeight > 80) {
                        vm.isImageTooBig = true;
                    }
                    else {
                        vm.isImageOk = true;
                    }
                    drawImage(imageObj, canvas);
                    $scope.$apply();

                };
                imageObj.src = fileContents;
            };
            reader.readAsDataURL(file);
        }

        function saveChange() {
            vm.feedback.clear();
            var files = $('#fileInput').prop('files');
            //console.log("saveChange",vm.changeImage);
            if (!files) {
                vm.feedback.addError('Please select a logo file');
                return;
            }

            if (!vm.isImageOk || vm.isImageTooBig) {
                return;
            }
            
            var formData = new FormData();
            var file = files[0];
            formData.append(file.name, file);
            

            var promise = AccountApiService.addEmailLogo(vm.account, file.type, vm.changeImage).$promise;
            promise.then(
                function(result) {
                    vm.hasLogo = true;
                    vm.feedback.addSuccess('Logo uploaded successfully');
                    var canvas = document.getElementById('logoCanvas');
                    clearCanvas(canvas);
                    drawImage(vm.changeImage, canvas);
                    endChange();
                },
                function(error) {
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

        function showDefaultImage() {
            var imageObj = new Image();
            imageObj.onload = function() {
                vm.hasLogo = false;
                drawImage(imageObj, document.getElementById('logoCanvas'));
                $scope.$apply();
            };
            imageObj.src = window.location.origin +  '/img/DefaultEmailLogo.png';
        }
    }
})();