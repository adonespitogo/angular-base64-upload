(function (window) {

  'use strict';

  var mod = window.angular.module('naif.base64', []);

  mod.directive('baseSixtyFourInput', [
    function () {

      var EVENT_NAMES = ['onabort', 'onerror', 'onloadstart', 'onloadend', 'onprogress', 'onload'];
      var VALIDATORS = ['maxsize', 'minsize', 'maxnum', 'minnum', 'required'];
      var DEFAULT_VALIDITY_STATE = {
        maxsize: true,
        minsize: true,
        maxnum: true,
        minnum: true,
        required: false
      };
      var isolateScope = {};

      for (var i = EVENT_NAMES.length - 1; i >= 0; i--) {
        var e = EVENT_NAMES[i];
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
          var validityState = DEFAULT_VALIDITY_STATE;

          function _attachHandlerForEvent (handler, fReader, file, fileObject) {
            return function (e) {
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

            for (var i = EVENT_NAMES.length - 1; i >= 0; i--) {
              var e = EVENT_NAMES[i];
              if (attrs[e] && e !== 'onload') { // don't attach handler to onload yet
                fReader[e] = _attachHandlerForEvent(scope[e], fReader, file, fileObject);
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

          elem.on('change', function() {
            if(!elem[0].files.length) {
              return;
            }

            rawFiles = elem[0].files;
            fileObjects = [];

            // reset validation states
            _setValidity(DEFAULT_VALIDITY_STATE);

            _validate();
            _readFiles();

          });

          // VALIDATIONS =========================================================

          function _setValidity (validity) {
            scope.$apply(function () {
              for (var i = VALIDATORS.length - 1; i >= 0; i--) {
                var validator = VALIDATORS[i];
                validityState[validator] = validity[validator] || validityState[validator] || DEFAULT_VALIDITY_STATE[validator];
                ngModel.$setValidity(validator, validityState[validator]);
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

            // check max/min number
            if (attrs.maxnum && attrs.multiple) {
              if (rawFiles.length > parseInt(attrs.maxnum)) {
                _setValidity({'maxnum': false});
              }
            }

            if (attrs.minnum && attrs.multiple) {
              if (rawFiles.length < parseInt(attrs.minnum)) {
                _setValidity({'minnum': false});
              }
            }

            // check each file for file size
            for (var i = rawFiles.length - 1; i >= 0; i--) {
              var file = rawFiles[i];

              if (attrs.maxsize) {
                if (file.size > parseFloat(attrs.maxsize) * 1000) {
                  _setValidity({'maxsize': false});
                }
              }

              if (attrs.minsize) {
                if (file.size < parseFloat(attrs.minsize) * 1000) {
                  _setValidity({'minsize': false});
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

