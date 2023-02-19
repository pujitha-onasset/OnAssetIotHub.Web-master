(function () {
    'use strict';

    angular
        .module('ui-common')
        .directive('fileViewer', FileViewerDirective);

    function FileViewerDirective() {
        var idModal= Math.random().toString(36).substr(2, 9);
        console.log("modal",idModal);
        return {
            restrict: 'AE',
            scope: {
                url: '@',
                id: '@'
            },
            template: '<a ng-if="isImage" href="{{url}}" data-lightbox="images-{{id}}" ><img src="{{url}}"></img></a>   '+
            '<a ng-if="isPdf" ng-click="createModal()"><img src="./img/PDF_file_icon.png"></img></a>'+
            '<a ng-if="isDocument" ng-click="createModal()"><img src="./img/office_icon.png"></img></a>'+
            '<a ng-if="isOther" href="{{url}}" ><img src="./img/unknow-icon.png"></img></a>'+
            '<div id="doc_modal"></div>',
            controller: function ($scope) {               
                $scope.isImage=false;
                $scope.isPdf=false;
                $scope.isDocument=false;
                $scope.isOther=false;
              
                if (!$scope.url) return;
                var urlLower=$scope.url.toLowerCase();
               
                if (urlLower.match(/\.(jpeg|jpg|gif|png)$/) != null) {
                   $scope.isImage=true;
                }else if (urlLower.match(/\.(pdf)$/) != null){
                   $scope.isPdf=true;
                }else if (urlLower.match(/\.(doc|docx|xls|xlsx)$/) != null) {
                   $scope.isDocument=true;
                }else{
                    $scope.isOther=true;
                }
                console.log($scope.url);
                $scope.createModal = function(){
                    var url = "https://docs.google.com/gview?url="+$scope.url+"&embedded=true";
                    var html =  '<div id="modalWindow" class="modal" style="display:none;width:100%" role="dialog">';
                    html += '<div  class="modal-dialog " style="width:90%" tabindex="-1" role="dialog" >';
                    html += '<div class="modal-content" style="height:600px;">';
                    html += '<div class="modal-body" style="height:500px;">';
                    html += '    <iframe style="width:100%;height:100%;" class="doc" src="'+url+'"></iframe>';
                    html += '</div>';
                    html += '<div class="modal-footer">';
                    html += '   <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>';
                    html += '</div></div></div></div>';
                    $("#doc_modal").html(html);
                    $("#modalWindow").modal();

                };

            }
        };
    }

})();