/*! angular-base64-upload - v0.1.0
* https://github.com/adonespitogo/angular-base64-upload
* Copyright (c) Adones Pitogo <pitogo.adones@gmail.com> 2015;
* Licensed MIT */
(function (window) {

  'use strict';

  var angular = window['angular'];

  angular.module('naif.base64', [])
  .directive('baseSixtyFourInput', [
    '$rootScope',
    function ($rootScope) {

      return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ngModel) {

          var rawFiles = [];
          var fileObjects = [];
          var fileObject = {};
          var readFileIndex = 0;

          function _setViewValue () {
            scope.$apply(function(){
              var newVal = attrs.multiple ? fileObjects : (fileObjects[0] || []);
              ngModel.$setViewValue(angular.copy(newVal));
            });
          }

          function _readerOnLoad (e) {

            var base64 = _arrayBufferToBase64(e.target.result);
            fileObject.base64 = base64;
            fileObjects.push(fileObject);

            readFileIndex ++;
            // read the next file if there is
            if (readFileIndex < rawFiles.length) {
              _readFile();
            }

            // all files are read
            else {
              _setViewValue();
            }

          }

          function _readerOnEvent (handler_name) {
            return function (e) {
              $rootScope.$broadcast('base64:event:'+handler_name, e, rawFiles, fileObjects, rawFiles[readFileIndex]);
            };
          }

          var reader = new window.FileReader();
          reader.onabort = _readerOnEvent('onabort');
          reader.onerror = _readerOnEvent('onerror');
          reader.onloadstart = _readerOnEvent('onloadstart');
          reader.onloadend = _readerOnEvent('onloadend');
          reader.onprogress = _readerOnEvent('onprogress');
          reader.onload = _readerOnLoad;

          function _startReadingFiles() {
            _readFile();
          }

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

            _setValidity('maxsize', true);
            _setValidity('minsize', true);
            _setValidity('maxnum', true);
            _setValidity('minnum', true);
            _setValidity('required', false);

            _validate();

          });

          // VALIDATIONS =========================================================

          ngModel.$validators.required = function (model, view) {
            var val = model || view || [];
            if (val.hasOwnProperty('length')) {
              return val.length > 0;
            }
            return val ? true : false;
          };

          ngModel.$validators.maxnum = function () {
            if (attrs.maxnum) {
              if (rawFiles.length > parseInt(attrs.maxnum)) {
                return false;
              }
            }
            return true;
          };

          ngModel.$validators.minnum = function () {
            if (attrs.minnum) {
              if (rawFiles.length < parseInt(attrs.minnum)) {
                return false;
              }
            }
            return true;
          };

          function _setValidity (key, val) {
            scope.$apply(function () {
              ngModel.$setValidity(key, val);
            });
          }

          function _validate () {

            // check each file
            for (var i = rawFiles.length - 1; i >= 0; i--) {
              var file = rawFiles[i];

              if (attrs.maxsize) {
                if (file.size > parseFloat(attrs.maxsize) * 1000) {
                  _setValidity('maxsize', false);
                  return;
                }
              }

              if (attrs.minsize) {
                if (file.size < parseFloat(attrs.minsize) * 1000) {
                  _setValidity('minsize', false);
                  return;
                }
              }

            }

            _startReadingFiles();

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

