/*! angular-base64-upload - v0.1.13
* https://github.com/adonespitogo/angular-base64-upload
* Copyright (c) Adones Pitogo <pitogo.adones@gmail.com> [September 28, 2015]
* Licensed MIT */
(function (window, undefined) {

  'use strict';

  /* istanbul ignore next */
  window._arrayBufferToBase64 = function ( buffer ) { //http://stackoverflow.com/questions/9267899/arraybuffer-to-base64-encoded-string
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
  };


  var mod = window.angular.module('naif.base64', []);

  mod.directive('baseSixtyFourInput', [
    '$window',
    '$q',
    function ($window, $q) {

      var isolateScope = {
        onChange: '&',
        parser: '&'
      };

      var FILE_READER_EVENTS = ['onabort', 'onerror', 'onloadstart', 'onloadend', 'onprogress', 'onload'];
      for (var i = FILE_READER_EVENTS.length - 1; i >= 0; i--) {
        var e = FILE_READER_EVENTS[i];
        isolateScope[e] = '&';
      }

      return {
        restrict: 'A',
        require: '?ngModel',
        scope: isolateScope,
        link: function (scope, elem, attrs, ngModel) {

          /* istanbul ignore if */
          if (!ngModel) {
            return;
          }

          // need set falsy to activate required state when user predefines value for model
          ngModel.$setViewValue(null);
          ngModel.$setPristine();

          var rawFiles = [];
          var fileObjects = [];

          function _attachHandlerForEvent (eventName, handler, fReader, file, fileObject) {
            fReader[eventName] =  function (e) {
              handler()(e, fReader, file, rawFiles, fileObjects, fileObject);
            };
          }

          function _readerOnLoad (fReader, file, fileObject) {

            return function (e) {

              var buffer = e.target.result;
              var promise;

              fileObject.base64 = $window._arrayBufferToBase64(buffer);

              if (attrs.parser) {
                promise = $q.when(scope.parser()(file, fileObject));
              }
              else {
                promise = $q.when(fileObject);
              }

              promise.then(function (fileObj) {
                fileObjects.push(fileObj);
                _setViewValue();
              });

              if (attrs.onload) {
                scope.onload()(e, fReader,  file, rawFiles, fileObjects, fileObject);
              }

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
              var newVal = attrs.multiple ? fileObjects : fileObjects[0];
              ngModel.$setViewValue(newVal);
              if (angular.isFunction(ngModel.$validate)) {
                ngModel.$validate();
              }

              var v = angular.version.full.split('.');

              // manually run parsers for angular versions >= 1.3.4 since they are not triggered automatically on ngModel.$setViewValue
              if (v[0] === '1' && v[1] === '3' && parseInt(v[2]) >= 4) {
                var val = ngModel.$viewValue;
                _maxsize(val);
                _minsize(val);
                _maxnum(val);
                _minnum(val);
              }
          }

          function _readFiles () {

            for (var i = rawFiles.length - 1; i >= 0; i--) {

              var reader = new $window.FileReader();
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

            if(!e.target.files.length) {
              return;
            }

            fileObjects = [];
            fileObjects = angular.copy(fileObjects);
            rawFiles = e.target.files; // use event target so we can mock the files from test
            _readFiles();
            _onChange(e);

          });

          // VALIDATIONS =========================================================

          function _maxnum (val) {
            if (attrs.maxnum && attrs.multiple && val) {
              var valid = val.length <= parseInt(attrs.maxnum);
              ngModel.$setValidity('maxnum', valid);
            }
            return val;
          }

          function _minnum (val) {
            if (attrs.minnum && attrs.multiple && val) {
              var valid = val.length >= parseInt(attrs.minnum);
              ngModel.$setValidity('minnum', valid);
            }
            return val;
          }

          function _maxsize (val) {
            var valid = true;

            if (attrs.maxsize && val) {
              var max = parseFloat(attrs.maxsize) * 1000;

              if (attrs.multiple) {
                for (var i = 0; i < val.length; i++) {
                  var file = val[i];
                  if (file.filesize > max) {
                    valid = false;
                    break;
                  }
                }
              }
              else {
                valid = val.filesize <= max;
              }
              ngModel.$setValidity('maxsize', valid);
            }

            return val;
          }

          function _minsize (val) {
            var valid = true;
            var min = parseFloat(attrs.minsize) * 1000;

            if (attrs.minsize && val) {
              if (attrs.multiple) {
                for (var i = 0; i < val.length; i++) {
                  var file = val[i];
                  if (file.filesize < min) {
                    valid = false;
                    break;
                  }
                }
              }
              else {
                valid = val.filesize >= min;
              }
              ngModel.$setValidity('minsize', valid);
            }

            return val;
          }

          ngModel.$parsers.push(_maxnum);
          ngModel.$parsers.push(_minnum);
          ngModel.$parsers.push(_maxsize);
          ngModel.$parsers.push(_minsize);

        }
      };

  }]);

})(window);

