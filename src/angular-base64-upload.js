(function(window, undefined) {

  'use strict';

  /* istanbul ignore next */
  //http://stackoverflow.com/questions/9267899/arraybuffer-to-base64-encoded-string
  window._arrayBufferToBase64 = function(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;

    for (var i = 0; i < len; i += 1) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };


  var mod = window.angular.module('naif.base64', []);

  mod.directive('baseSixtyFourInput', [
    '$window',
    '$q',
    function($window, $q) {

      var isolateScope = {
        onChange: '&',
        onAfterValidate: '&',
        parser: '&'
      };

      var FILE_READER_EVENTS = ['onabort', 'onerror', 'onloadstart', 'onloadend', 'onprogress', 'onload'];

      FILE_READER_EVENTS.forEach(function(e) {
        isolateScope[e] = '&';
      });

      return {
        restrict: 'A',
        require: 'ngModel',
        scope: isolateScope,
        link: function(scope, elem, attrs, ngModel) {

          var rawFiles = [];
          var fileObjects = [];

          /* istanbul ignore if */
          if (!ngModel) {
            return;
          }

          // VALIDATIONS =========================================================

          function _maxnum(val) {
            var valid = true;
            var toReturn = val;
            if (attrs.maxnum && attrs.multiple && val) {
              valid = val.length <= parseInt(attrs.maxnum);
              ngModel.$setValidity('maxnum', valid);
              if(!valid) {
                toReturn = [];
              }
            }

            if(attrs.maxnum && attrs.showalert && !valid) {
              alert('You cannot select more than '+parseInt(attrs.maxnum)+' files');
            }

            return toReturn;
          }

          function _minnum(val) {
            var valid = true;
            var toReturn = val;
            if (attrs.minnum && attrs.multiple && val) {
              valid = val.length >= parseInt(attrs.minnum);
              ngModel.$setValidity('minnum', valid);
              if(!valid) {
                toReturn = [];
              }
            }

            if(attrs.minnum && attrs.showalert && !valid) {
              alert('Please select atleast '+parseInt(attrs.minnum)+' files');
            }

            return toReturn;
          }

          function _maxsize(val) {
            var valid = true;
            var toReturn = val;

            if (attrs.maxsize && val) {
              var max = parseFloat(attrs.maxsize) * 1000;

              if (attrs.multiple) {
                for (var i = 0; i < val.length; i++) {
                  var file = val[i];
                  if (file.filesize > max) {
                    valid = false;
                    toReturn = [];
                    break;
                  }
                }
              } else {
                valid = val.filesize <= max;
                if(!valid) {
                  toReturn = null;
                }
              }
              ngModel.$setValidity('maxsize', valid);
            }


            if(attrs.maxsize && attrs.showalert && !valid) {
              alert('You can only select files with size upto '+parseInt(attrs.maxsize)+' KB');
            }

            return toReturn;
          }

          function _minsize(val) {
            var valid = true;
            var toReturn = val;
            var min = parseFloat(attrs.minsize) * 1000;

            if (attrs.minsize && val) {
              if (attrs.multiple) {
                for (var i = 0; i < val.length; i++) {
                  var file = val[i];
                  if (file.filesize < min) {
                    valid = false;
                    toReturn = [];
                    break;
                  }
                }
              } else {
                valid = val.filesize >= min;
                if(!valid) {
                  toReturn = null;
                }
              }
              ngModel.$setValidity('minsize', valid);
            }

            if(attrs.minsize && attrs.showalert && !valid) {
              alert('You can only select files with size greater than '+parseInt(attrs.minsize)+' KB');
            }

            return toReturn;
          }

          function _accept(val) {
            var valid = true;
            var toReturn = val;
            var regExp, exp, fileExt;
            if (attrs.accept) {
              exp = attrs.accept.trim().replace(/[,\s]+/gi, "|").replace(/\./g, "\\.").replace(/\/\*/g, "/.*");
              regExp = new RegExp(exp);
            }

            if (attrs.accept && val) {
              if (attrs.multiple) {
                for (var i = 0; i < val.length; i++) {
                  var file = val[i];
                  fileExt = "." + file.filename.split('.').pop();
                  valid = regExp.test(file.filetype) || regExp.test(fileExt);

                  if (!valid) {
                    toReturn = [];
                    break;
                  }
                }
              } else {
                fileExt = "." + val.filename.split('.').pop();
                valid = regExp.test(val.filetype) || regExp.test(fileExt);
                if(!valid) {
                  toReturn = null;
                }
              }
              ngModel.$setValidity('accept', valid);
            }

            return toReturn;
          }

          //end validations ===============

          function _setViewValue() {
            var newVal = attrs.multiple ? fileObjects : fileObjects[0];
            newVal = _maxsize(newVal);
            newVal = _minsize(newVal);
            newVal = _maxnum(newVal);
            newVal = _minnum(newVal);
            newVal = _accept(newVal);
            ngModel.$setViewValue(newVal);
          }

          function _attachHandlerForEvent(eventName, handler, fReader, file, fileObject) {
            fReader[eventName] = function(e) {
              handler()(e, fReader, file, rawFiles, fileObjects, fileObject);
            };
          }

          function _readerOnLoad(fReader, file, fileObject) {

            return function(e) {

              var buffer = e.target.result;
              var promise;

              // do not convert the image to base64 if it exceeds the maximum
              // size to prevent the browser from freezing
              var exceedsMaxSize = attrs.maxsize && file.size > attrs.maxsize * 1024;
              if (attrs.doNotParseIfOversize !== undefined && exceedsMaxSize) {
                fileObject.base64 = null;
              } else {
                fileObject.base64 = $window._arrayBufferToBase64(buffer);
              }

              if (attrs.parser) {
                promise = $q.when(scope.parser()(file, fileObject));
              } else {
                promise = $q.when(fileObject);
              }

              promise.then(function(fileObj) {
                fileObjects.push(fileObj);
                // fulfill the promise here.
                file.deferredObj.resolve();
              });

              if (attrs.onload) {
                if (scope.onload && typeof scope.onload() === "function") {
                  scope.onload()(e, fReader, file, rawFiles, fileObjects, fileObject);
                } else {
                  scope.onload(e, rawFiles);
                }
              }

            };

          }

          function _attachEventHandlers(fReader, file, fileObject) {

            for (var i = FILE_READER_EVENTS.length - 1; i >= 0; i--) {
              var e = FILE_READER_EVENTS[i];
              if (attrs[e] && e !== 'onload') { // don't attach handler to onload yet
                _attachHandlerForEvent(e, scope[e], fReader, file, fileObject);
              }
            }

            fReader.onload = _readerOnLoad(fReader, file, fileObject);
          }

          function _readFiles() {
            var promises = [];
            var i;
            for (i = rawFiles.length - 1; i >= 0; i--) {
              // append file a new promise, that waits until resolved
              rawFiles[i].deferredObj = $q.defer();
              promises.push(rawFiles[i].deferredObj.promise);
              // TODO: Make sure all promises are resolved even during file reader error, otherwise view value wont be updated
            }

            // set view value once all files are read
            $q.all(promises).then(_setViewValue);

            for (i = rawFiles.length - 1; i >= 0; i--) {
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

          function _onChange(e) {
            if (attrs.onChange) {
              if (scope.onChange && typeof scope.onChange() === "function") {
                scope.onChange()(e, rawFiles);
              } else {
                scope.onChange(e, rawFiles);
              }
            }
          }

          function _onAfterValidate(e) {
            if (attrs.onAfterValidate) {
              // wait for all promises, in rawFiles,
              //   then call onAfterValidate
              var promises = [];
              for (var i = rawFiles.length - 1; i >= 0; i--) {
                promises.push(rawFiles[i].deferredObj.promise);
              }
              $q.all(promises).then(function() {
                if (scope.onAfterValidate && typeof scope.onAfterValidate() === "function") {
                  scope.onAfterValidate()(e, fileObjects, rawFiles);
                } else {
                  scope.onAfterValidate(e, fileObjects, rawFiles);
                }
              });
            }
          }

          ngModel.$isEmpty = function(val) {
            return !val || (angular.isArray(val) ? val.length === 0 : !val.base64);
          };

          // http://stackoverflow.com/questions/1703228/how-can-i-clear-an-html-file-input-with-javascript
          scope._clearInput = function() {
            elem[0].value = '';
          };

          scope.$watch(function() {
            return ngModel.$viewValue;
          }, function(val) {
            if (ngModel.$isEmpty(val) && ngModel.$dirty) {
              scope._clearInput();
              // Remove validation errors
              ngModel.$setValidity('maxnum', true);
              ngModel.$setValidity('minnum', true);
              ngModel.$setValidity('maxsize', true);
              ngModel.$setValidity('minsize', true);
              ngModel.$setValidity('accept', true);
            }
          });

          elem.on('change', function(e) {

            fileObjects = [];
            fileObjects = angular.copy(fileObjects);

            if (e.target.files.length === 0) {
              rawFiles = [];
              _setViewValue();
            } else {
              rawFiles = e.target.files; // use event target so we can mock the files from test
              _readFiles();
              _onChange(e);
              _onAfterValidate(e);
            }

            if (attrs.allowSameFile) {
              scope._clearInput();
            }

          });

        }
      };

    }
  ]);

})(window);
