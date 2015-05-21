/*! angular-base64-upload - v0.0.9
* https://github.com/adonespitogo/angular-base64-upload
* Copyright (c) Adones Pitogo <pitogo.adones@gmail.com> 2015;
* Licensed MIT */
(function (window) {

  'use strict';

  var angular = window['angular'];

  angular.module('naif.base64', [])
  .directive('baseSixtyFourInput', function () {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function (scope, elem, attrs, ngModel) {

        var rawFiles;
        var fileObjects;
        var fileObject;
        var readFileIndex;


        function _readerOnLoad (e) {

          var base64 = _arrayBufferToBase64(e.target.result);
          fileObject.base64 = base64;
          fileObjects.push(fileObject);

          // read the next file if there is
          if (fileObjects.length < rawFiles.length) {
            readFileIndex ++;
            _readFile();
          }

          // all files are read
          else {
            scope.$apply(function(){
              var newVal = attrs.multiple ? fileObjects : fileObjects[0];
              ngModel.$setViewValue(angular.copy(newVal));
            });
          }

        }

        var reader = new FileReader();
        reader.onload = _readerOnLoad;

        function _readFile () {
          var file = rawFiles[readFileIndex];

          fileObject = {};

          fileObject.filetype = file.type;
          fileObject.filename = file.name;
          fileObject.filesize = file.size;
          reader.readAsArrayBuffer(file);
        }

        elem.on('change', function() {

          if(!elem[0].files.length) {
            return;
          }

          rawFiles = elem[0].files;
          fileObjects = [];
          readFileIndex = 0;

          _readFile();

        });

      }
    };

  })
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


  //http://stackoverflow.com/questions/9267899/arraybuffer-to-base64-encoded-string
  function _arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
  }


})(this);

