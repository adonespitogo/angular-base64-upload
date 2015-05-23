/*! angular-base64-upload - v0.1.1
* https://github.com/adonespitogo/angular-base64-upload
* Copyright (c) Adones Pitogo <pitogo.adones@gmail.com> 2015;
* Licensed MIT */
(function (window) {

  'use strict';

  var mod = window.angular.module('naif.base64', []);

  mod.directive('baseSixtyFourInput', [
    function () {

      var FILE_READER_EVENTS = ['onabort', 'onerror', 'onloadstart', 'onloadend', 'onprogress', 'onload'];
      var VALIDATORS = ['maxsize', 'minsize', 'maxnum', 'minnum', 'required'];
      var DEFAULT_VALIDITY_STATE = {
        maxsize: true,
        minsize: true,
        maxnum: true,
        minnum: true,
        required: false
      };
      var isolateScope = {
        onChange: '&'
      };

      for (var i = FILE_READER_EVENTS.length - 1; i >= 0; i--) {
        var e = FILE_READER_EVENTS[i];
        isolateScope[e] = '&';
      }

      return {
        restrict: 'A',
        require: '?ngModel',
        scope: isolateScope,
        link: function (scope, elem, attrs, ngModel) {

          if (!ngModel) {
            return;
          }

          var rawFiles = [];
          var fileObjects = [];
          var validityState = angular.copy(DEFAULT_VALIDITY_STATE);

          function _attachHandlerForEvent (eventName, handler, fReader, file, fileObject) {
            fReader[eventName] =  function (e) {
              handler()(e, fReader, file, rawFiles, fileObjects, fileObject);
            };
          }

          function _readerOnLoad (fReader, file, fileObject) {

            return function (e) {

              var base64 = _arrayBufferToBase64(e.target.result);
              fileObject.base64 = base64;
              fileObjects.push(fileObject);

              if (attrs.onload) {
                scope.onload()(e, fReader,  file, rawFiles, fileObjects, fileObject);
              }

              _setViewValue();

            };

          }

          function _attachEventHandlers (fReader, file, fileObject) {

            for (var i = FILE_READER_EVENTS.length - 1; i >= 0; i--) {
              var e = FILE_READER_EVENTS[i];
              if (attrs[e] && e !== 'onload') { // don't attach handler to onload yet
                _attachHandlerForEvent(e, scope[e], fReader, file, fileObject);
              }
            }

            fReader.onload = _readerOnLoad(fReader, file, fileObject);
          }

          function _setViewValue () {
            scope.$apply(function(){
              var newVal = attrs.multiple ? fileObjects : (fileObjects[0] || null);
              ngModel.$setViewValue(angular.copy(newVal));
            });
          }

          function _readFiles () {

            for (var i = rawFiles.length - 1; i >= 0; i--) {

              var reader = new window.FileReader();
              var file = rawFiles[i];
              var fileObject = {};

              fileObject.filetype = file.type;
              fileObject.filename = file.name;
              fileObject.filesize = file.size;

              _attachEventHandlers(reader, file, fileObject);

              reader.readAsArrayBuffer(file);
            }

          }

          function _onChange (e) {
            if (attrs.onChange) {
              scope.onChange()(e, rawFiles);
            }
          }

          elem.on('change', function(e) {

            if(!elem[0].files.length) {
              return;
            }

            fileObjects = [];
            rawFiles = elem[0].files;

            _onChange(e);

            // reset validation states
            validityState = angular.copy(DEFAULT_VALIDITY_STATE);

            _validate();
            _readFiles();

          });

          // VALIDATIONS =========================================================

          function _setValidity (validity) {
            scope.$apply(function () {
              for (var i = VALIDATORS.length - 1; i >= 0; i--) {
                var validator = VALIDATORS[i];
                var valid = validity[validator] === undefined? validityState[validator] : validity[validator];
                ngModel.$setValidity(validator, valid);
                validityState[validator] = valid;
              }
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

            var validity = {};

            // check max/min number
            if (attrs.maxnum && attrs.multiple) {
              if (rawFiles.length > parseInt(attrs.maxnum)) {
                validity.maxnum = false;
              }
            }

            if (attrs.minnum && attrs.multiple) {
              if (rawFiles.length < parseInt(attrs.minnum)) {
                validity.minnum = false;
              }
            }

            // check each file for file size
            for (var i = rawFiles.length - 1; i >= 0; i--) {
              var file = rawFiles[i];

              if (attrs.maxsize) {
                if (file.size > parseFloat(attrs.maxsize) * 1000) {
                  validity.maxsize = false;
                }
              }

              if (attrs.minsize) {
                if (file.size < parseFloat(attrs.minsize) * 1000) {
                  validity.minsize = false;
                }
              }

            }

            _setValidity(validity);

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

