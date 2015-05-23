/*! angular-base64-upload - v0.1.0
* https://github.com/adonespitogo/angular-base64-upload
* Copyright (c) Adones Pitogo <pitogo.adones@gmail.com> 2015;
* Licensed MIT */
(function (window) {

  'use strict';

  var angular = window['angular'];

  angular.module('naif.base64', [])
  .directive('baseSixtyFourInput', [
    function () {

      var EVENT_NAMES = ['onabort', 'onerror', 'onloadstart', 'onloadend', 'onprogress', 'onload'];
      var isolate = {};

      for (var i = EVENT_NAMES.length - 1; i >= 0; i--) {
        var h = EVENT_NAMES[i];
        isolate[h] = '=';
      }

      return {
        restrict: 'A',
        require: 'ngModel',
        scope: isolate,
        link: function (scope, elem, attrs, ngModel) {

          var rawFiles = [];
          var fileObjects = [];
          var fileObject = {};
          var readFileIndex = 0;
          var reader = new window.FileReader();

          function _readerOnEvent (handler_function) {
            return function (e) {
              handler_function(e, reader, rawFiles, fileObjects, rawFiles[readFileIndex]);
            };
          }

          function _attachEventHandlers () {

            for (var i = EVENT_NAMES.length - 1; i >= 0; i--) {
              var e = EVENT_NAMES[i];
              if (typeof scope[e] === 'function' && e !== 'onload') { // don't attach handler to onload yet
                reader[e] = _readerOnEvent(scope[e]);
              }
            }

            reader.onload = _readerOnLoad;
          }

          _attachEventHandlers();

          function _setViewValue () {
            scope.$apply(function(){
              var newVal = attrs.multiple ? fileObjects : (fileObjects[0] || []);
              ngModel.$setViewValue(angular.copy(newVal));
            });
          }

          function _readerOnLoad (e) {

            if (typeof scope['onload'] === 'function') {
              scope.onload(e, reader, rawFiles, fileObjects, rawFiles[readFileIndex]);
            }

            var base64 = _arrayBufferToBase64(e.target.result);
            fileObject.base64 = base64;
            fileObjects.push(fileObject);

            readFileIndex ++;
            // read the next file if there is
            if (readFileIndex < rawFiles.length) {
              _readFile();
            }

            _setViewValue();

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

            // reset validation states
            _setValidity('maxsize', true);
            _setValidity('minsize', true);
            _setValidity('maxnum', true);
            _setValidity('minnum', true);
            _setValidity('required', false);

            _validate();
            _readFile();

          });

          // VALIDATIONS =========================================================

          function _setValidity (key, val) {
            scope.$apply(function () {
              ngModel.$setValidity(key, val);
            });
          }

          ngModel.$validators.required = function (model, view) {
            var val = model || view || [];
            if (val.hasOwnProperty('length')) {
              return val.length > 0;
            }
            return val ? true : false;
          };

          function _validate () {

            // check max/min number
            if (attrs.maxnum && attrs.multiple) {
              if (rawFiles.length > parseInt(attrs.maxnum)) {
                _setValidity('maxnum', false);
              }
            }

            if (attrs.minnum && attrs.multiple) {
              if (rawFiles.length < parseInt(attrs.minnum)) {
                _setValidity('minnum', false);
              }
            }

            // check each file for file size
            for (var i = rawFiles.length - 1; i >= 0; i--) {
              var file = rawFiles[i];

              if (attrs.maxsize) {
                if (file.size > parseFloat(attrs.maxsize) * 1000) {
                  _setValidity('maxsize', false);
                }
              }

              if (attrs.minsize) {
                if (file.size < parseFloat(attrs.minsize) * 1000) {
                  _setValidity('minsize', false);
                }
              }

            }

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

