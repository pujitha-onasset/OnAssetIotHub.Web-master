(function () {
    'use strict';

    angular
        .module('ui-common')
        .directive("fileUpload",function($rootScope,$http,$compile){
			return {
				restrict : 'AE',
				scope : {
					//url : "@",
					//method : "@",
					accept: '@',
					uploadEventName: "@"
				},
				template : 	'<input class="fileUpload" type="file" multiple accept="{{accept}}" capture>'+
							'<div class="dropzone">'+
								'<p class="msg">Click or Drag and Drop files to upload</p>'+
						   '</div>'+
						   '<div class="preview clearfix-multi-upload-file">'+
						   		'<div class="previewData clearfix-multi-upload-file" ng-repeat="data in previewData track by $index">'+
						   			'<div class="previewDetails">'+
						   				'<div class="detail"><b>Name : </b>{{data.name}}</div>'+
						   				'<div class="detail"><b>Type : </b>{{data.type}}</div>'+
						   				'<div class="detail"><b>Size : </b> {{data.size}}</div>'+
						   			'</div>'+
						   			'<div class="previewControls">'+
						   				//'<span ng-click="upload(data)" class="circle upload">'+
						   				//	'<i class="fa fa-check"></i>'+
						   				//'</span>'+
						   				'<button class="btn btn-default" ng-click="remove(data)" >' + 
						   				'<i class="fa fa-close"></i>' + 
						   				'</button>' +
						   			'</div>'+
						   		'</div>'+	
						   '</div>',
				link : function(scope,elem,attrs){
					var formData = new FormData();
					scope.previewData = [];	

					function previewFile(file) {
						var reader = new FileReader();
						var obj = new FormData().append('file',file);

						reader.onload=function(data) {
							var src = data.target.result;
							var size = ((file.size/(1024*1024)) > 1) ? (file.size/(1024*1024)) + ' mB' : (file.size/1024) +' kB';

							scope.$apply(function(){
								var data = {
									'name': file.name,
									'size': size,
									'type': file.type,
									'src' : src,
									'data': obj
								};

								scope.previewData.push(data);

								$rootScope.$emit(scope.uploadEventName, scope.previewData);
							});								
							//console.log(scope.previewData);
        				};
        				reader.readAsDataURL(file);
					}

					function fileChecker(value) {
						var accepted = [".csv", ".dat", ".doc", ".docx", ".key", ".keychain", ".log", ".msg", ".odt", ".pages", ".pdf", ".pps", ".ppt", ".pptx", ".rtf", ".sdf", ".tar", ".txt", ".xml", ".xlr", ".xls", ".xlsx", ".wpd", ".wps"];

						for (var i = 0; i < accepted.length; i++) {
							if (value.indexOf(accepted[i]) !== -1) {
								return true;
							}
						}

						return false;
					}

					function uploadFile(e,type) {
						e.preventDefault();

						var files = "";

						if(type == "formControl") {
							files = e.target.files;
						} else if(type === "drop") {
							files = e.originalEvent.dataTransfer.files;
						}

						for(var i=0;i<files.length;i++) {
							var file = files[i];

							if (fileChecker(file.name)) {
								previewFile(file);								
							} else {
								alert(file.name + " is not supported");
							}
						}
					}

					elem.find('.fileUpload').bind('change',function(e){
						uploadFile(e,'formControl');
					});

					elem.find('.dropzone').bind("click",function(e){
						$compile(elem.find('.fileUpload'))(scope).trigger('click');
					});

					elem.find('.dropzone').bind("dragover",function(e){
						e.preventDefault();
					});

					elem.find('.dropzone').bind("drop",function(e){
						uploadFile(e,'drop');																		
					});
					/*scope.upload=function(obj){
						$http({method:scope.method,url:scope.url,data: obj.data,
							headers: {'Content-Type': undefined},transformRequest: angular.identity
						}).success(function(data){

						});
					};*/

					scope.remove=function(data){
						var index= scope.previewData.indexOf(data);
						scope.previewData.splice(index,1);
						scope.$emit(scope.uploadEventName, scope.previewData);
					};
				}
            };
        }).directive("imgUpload",function($rootScope,$http,$compile){
			return {
				restrict : 'AE',
				scope : {
					//url : "@",
					//method : "@",
					accept: '@',
					uploadEventName: "@"
				},
				template : 	'<input class="fileUpload" type="file" multiple accept="{{accept}}" capture>'+
							'<div class="dropzone">'+
								'<p class="msg">Click or Drag and Drop files to upload</p>'+
						   '</div>'+
						   '<div class="preview clearfix-multi-upload-file">'+
						   		'<div class="previewData clearfix-multi-upload-file" ng-repeat="data in previewData track by $index">'+
						   			'<img src={{data.src}}></img>'+
						   			'<div class="previewDetails">'+
						   				'<div class="detail"><b>Name : </b>{{data.name}}</div>'+
						   				'<div class="detail"><b>Type : </b>{{data.type}}</div>'+
						   				'<div class="detail"><b>Size : </b> {{data.size}}</div>'+
						   			'</div>'+
						   			'<div class="previewControls">'+
						   				//'<span ng-click="upload(data)" class="circle upload">'+
						   				//	'<i class="fa fa-check"></i>'+
						   				//'</span>'+
						   				'<button class="btn btn-default" ng-click="remove(data)" >' + 
						   				'<i class="fa fa-close"></i>' + 
						   				'</button>' +
						   			'</div>'+
						   		'</div>'+	
						   '</div>',
				link : function(scope,elem,attrs){
					var formData = new FormData();
					scope.previewData = [];	

					function previewFile(file){
						var reader = new FileReader();
						var obj = new FormData().append('file',file);			
						reader.onload=function(data){
							var src = data.target.result;
							var size = ((file.size/(1024*1024)) > 1)? (file.size/(1024*1024)) + ' mB' : (file.size/		1024)+' kB';
							scope.$apply(function(){
								var data = {'name':file.name,'size':size,'type':file.type,
														'src':src,'data':obj};
								scope.previewData.push(data);
								$rootScope.$emit(scope.uploadEventName, scope.previewData);
							});								
							//console.log(scope.previewData);
        				};
        				reader.readAsDataURL(file);
					}

					function uploadFile(e,type){
						e.preventDefault();			
						var files = "";
						if(type == "formControl"){
							files = e.target.files;
						} else if(type === "drop"){
							files = e.originalEvent.dataTransfer.files;
						}			
						for(var i=0;i<files.length;i++){
							var file = files[i];
							if(file.type.indexOf("image") !== -1){
								previewFile(file);								
							} else {
								alert(file.name + " is not supported");
							}
						}
					}	
					elem.find('.fileUpload').bind('change',function(e){
						uploadFile(e,'formControl');
					});

					elem.find('.dropzone').bind("click",function(e){
						$compile(elem.find('.fileUpload'))(scope).trigger('click');
					});

					elem.find('.dropzone').bind("dragover",function(e){
						e.preventDefault();
					});

					elem.find('.dropzone').bind("drop",function(e){
						uploadFile(e,'drop');																		
					});
					/*scope.upload=function(obj){
						$http({method:scope.method,url:scope.url,data: obj.data,
							headers: {'Content-Type': undefined},transformRequest: angular.identity
						}).success(function(data){

						});
					};*/

					scope.remove=function(data){
						var index= scope.previewData.indexOf(data);
						scope.previewData.splice(index,1);
						scope.$emit(scope.uploadEventName, scope.previewData);
					};
				}
            };
        });
    
})();