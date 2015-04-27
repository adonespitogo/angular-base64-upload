/*! angular-base64-upload - v0.0.8 - 2015-04-27
* https://github.com/adonespitogo/angular-base64-upload
* Copyright (c) Adones Pitogo <pitogo.adones@gmail.com> 2015; Licensed  */
angular.module('naif.base64', [])
.directive('baseSixtyFourInput', ['$window', function ($window) {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, elem, attrs, ngModel) {
      var fileObject = {};

      scope.readerOnload = function(e){
        var base64 = _arrayBufferToBase64(e.target.result);
        fileObject.base64 = base64;
        scope.$apply(function(){
          ngModel.$setViewValue(angular.copy(fileObject));
        });
      };

      var reader = new FileReader();
      reader.onload = scope.readerOnload;

      elem.on('change', function() {
        if(!elem[0].files.length) {
          return;
        }

        var file = elem[0].files[0];
        fileObject.filetype = file.type;
        fileObject.filename = file.name;
        fileObject.filesize = file.size;
        reader.readAsArrayBuffer(file);
      });

      //http://stackoverflow.com/questions/9267899/arraybuffer-to-base64-encoded-string
      function _arrayBufferToBase64( buffer ) {
        var binary = '';
        var bytes = new Uint8Array( buffer );
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode( bytes[ i ] );
        }
        return $window.btoa( binary );
      }
    }
  };
}])
.directive('baseSixtyFourImage', [function() {
  return {
    restrict: 'A',
    link: function(scope, elem, attrs) {
      scope.$watch(attrs.baseSixtyFourImage, function(fileObject) {
        if(fileObject && fileObject.filetype && fileObject.filetype.indexOf("image") === 0) {
          elem.attr("src", _assemble_data_uri(fileObject));
        } else {
          elem.attr("src", attrs.baseSixtyFourImagePlaceholder);
        }
      });

      function _assemble_data_uri(fileObject){
        return "data:" + fileObject.filetype + ";base64," + fileObject.base64;
      }
    }
  };
}]);
