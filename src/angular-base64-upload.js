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
    'base64Converter',
    function ($window, base64Converter) {

      var isolateScope = {
        onChange: '&',
        preprocessor: '&'
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

              if (attrs.preprocessor) {
                fileObject = scope.preprocessor()(file, buffer);
              }
              else {
                fileObject.base64 = base64Converter.getBase64String(buffer);
              }

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
              var newVal = attrs.multiple ? fileObjects : (fileObjects[0]);
              ngModel.$setViewValue(angular.copy(newVal));
            });
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
            rawFiles = e.target.files; // use event target so we can mock the files from test
            _readFiles();

            _onChange(e);

          });

          // VALIDATIONS =========================================================

          function _maxnum (val) {
            if (attrs.maxnum && attrs.multiple) {
              var valid = val.length <= parseInt(attrs.maxnum);
              ngModel.$setValidity('maxnum', valid);
            }
            return val;
          }

          function _minnum (val) {
            if (attrs.minnum && attrs.multiple) {
              var valid = val.length >= parseInt(attrs.minnum);
              ngModel.$setValidity('minnum', valid);
            }
            return val;
          }

          function _maxsize (val) {
            var valid = true;

            if (attrs.maxsize) {
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

            if (attrs.minsize) {
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

  mod.service('base64Converter', [
    '$window',
    '$q',
    '$rootScope',
    function ($window, $q, $rootScope) {

      this.getBase64String = function (buffer) {
        return $window._arrayBufferToBase64(buffer);
      };

      // http://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata
      /* istanbul ignore next */
      this.base64ToBlob = function (base64, filetype) {

        var dataURI = "data:"+filetype+";base64,"+base64;

        // convert base64/URLEncoded data component to raw binary data held in a string
        var byteString;
        byteString = $window.atob(dataURI.split(',')[1]);

        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

        // write the bytes of the string to a typed array
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ia], {type:mimeString});
      };

      this.getBase64Object = function (file) {

        var self = this;
        var deferred = $q.defer();
        var fileObject = {
          filename: file.name,
          filetype: file.type,
          filesize: file.size,
          base64: null
        };

        var reader = new $window.FileReader();
        reader.onload = function (e) {
          fileObject.base64 = self.getBase64String(e.target.result);
          $rootScope.$apply(function () {
            deferred.resolve(fileObject);
          });
        };

        reader.readAsArrayBuffer(file);

        return deferred.promise;

      };

    }
  ]);

})(this);

