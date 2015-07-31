Change Log
--------

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
