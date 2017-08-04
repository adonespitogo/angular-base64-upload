Change Log
--------

v0.1.23
 - added `allow-same-file` attribute option, which fixes #103 and #108

v0.1.22
 - Clear model when selecting empty files. See [PR#75](https://github.com/adonespitogo/angular-base64-upload/pull/75)
 - Allow selecting the same file (issue [#66](https://github.com/adonespitogo/angular-base64-upload/issues/66))

v0.1.21
 - Migrate to `Gulp` build
 - Clear validation errors after clearing input with empty value - [see PR#90](https://github.com/adonespitogo/angular-base64-upload/pull/90)

v0.1.20
 - Added do-not-parse-if-oversize flag to prevent images above maximum size to be converted to base64.

v0.1.19
 - Refactored unit tests - separated into multiple files for easier navigation.
 - Set view value only once

v0.1.18
 - Export module name for use with CommonJS syntax [#70](https://github.com/adonespitogo/angular-base64-upload/pull/70)
 - add test against tampering with form state [#71](https://github.com/adonespitogo/angular-base64-upload/pull/71)

v0.1.17
 - Manually run parsers to be consistent to all angular versions.

v0.1.16
 - Implement clear input mechanism, fixes [#53](https://github.com/adonespitogo/angular-base64-upload/issues/53)
 - Reimplemented `required` validation, overriding `ngModel.$isEmpty()` method :D

v0.1.15
 - Implement `on-after-validate` event
 - Removed `ngModel.$setViewValue(null)` that was used to activate `required` state of the input when it is multiple and model is predefined with value (e.g. `$scope.files = []`). It caused the [form to be initially dirty](https://github.com/adonespitogo/angular-base64-upload/issues/62). For multiple file selection with `required` validation, use `minnum="1"` instead of `required`, or just don't predefine the value of your model.

v0.1.14
 - Implement accept validation

v0.1.13
 - Fix test for $pristine state

v0.1.12
 - Fix ngModel setPristine call when $setViewValue(null) in init

v0.1.11
 - Update package description

v0.1.10
 - Update bower and npm keywords for better search visibility

v0.1.9
 - Rename preprocessor to parser
 - Custom parser can return a promise
 - Removed `base64Converter` service. There are better base64 libraries already available for base64 conversion

v0.1.8
 - To update premature npm publish. Will deprecate `v0.1.7`

v0.1.7
 - Support preprocessor handlers
 - Added `base64Converter` service

v0.1.6
 - Fix for [browserify](http://browserify.org)

v0.1.5
 - Fixed `maxsize` and `minsize` validator for single file selection

v0.1.4
 - Fix bower.json

v0.1.3
 - Refactor test config files
 - Test gainst number of angular versions, and fix errors for angular v1.2.10
 - Removed custom `required` validator. Angular's default `require` validator works well

v0.1.2
 - Move all validators to `ngModel.$parsers`, it's more angular way
 - Added unit tests

v0.1.1
 - Remove the use of singleton file reader instance. Each file is read by respective file reader.
 - FileReader event handlers receive new set of arguments `(Event, FileReader, File, FileList, FileObjects, FileObject)`.
 - Added `on-change` event.
 - Added sourcemap.


V0.1.0
 - Support for multiple file selection
 - Support for file reader event handlers
 - Added validations
 - Removed `base-sixty-four-image` and `base-sixty-four-image-placeholder` directives
