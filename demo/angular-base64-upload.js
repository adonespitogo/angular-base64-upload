/*! angular-base64-upload - v0.1.17
* https://github.com/adonespitogo/angular-base64-upload
* Copyright (c) Adones Pitogo <pitogo.adones@gmail.com> [January 26, 2016]
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
        onAfterValidate: '&',
        parser: '&'
      };

      var FILE_READER_EVENTS = ['onabort', 'onerror', 'onloadstart', 'onloadend', 'onprogress', 'onload'];
      for (var i = FILE_READER_EVENTS.length - 1; i >= 0; i--) {
        var e = FILE_READER_EVENTS[i];
        isolateScope[e] = '&';
      }

      return {
        restrict: 'A',
        require: 'ngModel',
        scope: isolateScope,
        link: function (scope, elem, attrs, ngModel) {

          /* istanbul ignore if */
          if (!ngModel) {
            return;
          }

          var rawFiles = [];
          var fileObjects = [];

          elem.on('change', function(e) {

            if(!e.target.files.length) {
              return;
            }

            fileObjects = [];
            fileObjects = angular.copy(fileObjects);
            rawFiles = e.target.files; // use event target so we can mock the files from test
            _readFiles();
            _onChange(e);
            _onAfterValidate(e);
          });

          function _readFiles () {
            for (var i = rawFiles.length - 1; i >= 0; i--) {
              var reader = new $window.FileReader();
              var file = rawFiles[i];
              var fileObject = {};

              fileObject.filetype = file.type;
              fileObject.filename = file.name;
              fileObject.filesize = file.size;

              // append file a new promise, that waits until resolved
              rawFiles[i].deferredObj = $q.defer();

              _attachEventHandlers(reader, file, fileObject);

              reader.readAsArrayBuffer(file);
            }
          }

          function _onChange (e) {
            if (attrs.onChange) {
              scope.onChange()(e, rawFiles);
            }
          }

          function _onAfterValidate (e) {
            if (attrs.onAfterValidate) {
              // wait for all promises, in rawFiles,
              //   then call onAfterValidate
              var promises = [];
              for (var i = rawFiles.length - 1; i >= 0; i--) {
                promises.push(rawFiles[i].deferredObj.promise);
              }
              $q.all(promises).then(function(){
                scope.onAfterValidate()(e, fileObjects, rawFiles);
              });
            }
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
              } else {
                promise = $q.when(fileObject);
              }

              promise.then(function (fileObj) {
                fileObjects.push(fileObj);
                _setViewValue();

                // fulfill the promise here.
                file.deferredObj.resolve();
              });

              if (attrs.onload) {
                scope.onload()(e, fReader,  file, rawFiles, fileObjects, fileObject);
              }

            };

          }

          function _setViewValue () {
              var newVal = attrs.multiple ? fileObjects : fileObjects[0];
              ngModel.$setViewValue(newVal);
              _maxsize(newVal);
              _minsize(newVal);
              _maxnum(newVal);
              _minnum(newVal);
              _accept(newVal);
          }

          ngModel.$isEmpty = function (val) {
            return !val || (angular.isArray(val)? val.length === 0 : !val.base64);
          };

          // http://stackoverflow.com/questions/1703228/how-can-i-clear-an-html-file-input-with-javascript
          scope._clearInput = function () {
            elem[0].value = '';
          };

          scope.$watch(function () {
            return ngModel.$viewValue;
          }, function (val, oldVal) {
            if (ngModel.$isEmpty(oldVal)) {return;}
            if (ngModel.$isEmpty(val)) {
              scope._clearInput();
            }
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

          function _accept (val) {
            var valid = true;
            var regExp, exp, fileExt;
            if(attrs.accept){
              exp = attrs.accept.trim().replace(/[,\s]+/gi, "|").replace(/\./g, "\\.").replace(/\/\*/g, "/.*");
              regExp = new RegExp(exp);
            }

            if (attrs.accept && val) {
              if (attrs.multiple) {
                for (var i = 0; i < val.length; i++) {
                  var file = val[i];
                  fileExt = "." + file.filename.split('.').pop();
                  valid = regExp.test(file.filetype) || regExp.test(fileExt);

                  if(!valid){ break; }
                }
              } else {
                fileExt = "." + val.filename.split('.').pop();
                valid = regExp.test(val.filetype) || regExp.test(fileExt);
              }
              ngModel.$setValidity('accept', valid);
            }

            return val;
          }

        }
      };

  }]);

})(window);
