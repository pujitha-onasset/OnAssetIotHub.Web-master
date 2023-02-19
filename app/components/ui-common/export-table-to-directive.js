(function () {
    'use strict';

    angular
        .module('ui-common')
        .directive("exportTableTo",function($rootScope,$http,$compile){
			return {
				restrict : 'AE',
				scope : {
					tableIdToExport: '@',
					fileName: "@",
					exclude: "@",
					buttonName: "@"
				},
				template: '<div class="btn-group" role="group">' +
            		'<button type="button" id="btn-export-to" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"' + 
                    'title="Export to">Export to&nbsp;&nbsp;<span class="caret"></span><span class="sr-only">Toggle Dropdown</span>' +
            		'</button>'+
		            '<ul class="dropdown-menu">'+
		                '<li><a role="button" ng-click="exportToCSV()">CSV</a></li>' +
		                '<li><a role="button" ng-click="exportToExcel()">Excel</a></li>' +
		            '</ul>'+
		        '</div>',
				link : function(scope,elem,attrs){
					
					scope.exportToExcel = function(){
						console.log("exportFile");
			            $("#"+scope.tableIdToExport).table2excel({
			                exclude: scope.exclude ? scope.exclude : ".noExport",
			                name: scope.fileName ?  scope.fileName : "file",
			                fileext: ".xls",
			                filename: scope.fileName ?  scope.fileName  : "file"
			            });
					};

					scope.exportToCSV = function(){
						console.log("exportToCSV");
						$('#'+scope.tableIdToExport).table2CSV({
						  separator : ',',
						  exclude: scope.exclude ? scope.exclude : ".noExport",
						  delivery:'download',
						  filename: scope.fileName ?  scope.fileName  : "file"
						});
					};

					
				}
            };
        });
    
})();