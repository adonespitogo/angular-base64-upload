/*! angular-base64-upload - v0.0.2 - 2014-10-30
* https://github.com/adonespitogo/angular-base64-upload
* Copyright (c) Adones Pitogo <pitogo.adones@gmail.com> 2014; Licensed  */
angular.module('naif.base64', [])
.directive('baseSixtyFourInput', function () {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, elem, attrs, ngModel) {
      var fileObject = {};
      scope.readerOnload = function(e){
        var base64 = btoa(e.target.result);
        fileObject.base64 = base64;
        scope.$apply(function(){
          ngModel.$setViewValue(fileObject);
        });
      };

      var reader = new FileReader();
      reader.onload = scope.readerOnload;

      elem.on('change', function() {
        var file = elem[0].files[0];
        fileObject.filetype = file.type;
        fileObject.filename = file.name;
        fileObject.filesize = file.size;
        // converts file to binary string
        reader.readAsBinaryString(file);
      });
    }
  };
});
