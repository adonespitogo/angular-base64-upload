angular-base64-upload
=====================

![Alt text](https://travis-ci.org/adonespitogo/angular-base64-upload.svg?branch=master "Travis-CI build status")

Converts files from file input into base64 encoded objects.
This directive is based from one of the answers in this [SO question](http://stackoverflow.com/questions/20521366/rails-4-angularjs-paperclip-how-to-upload-file). Tested on Angular versions `v1.2.0` through `v1.3.15`.


```html
  <input type="file" ng-model="myfile" base-sixty-four-input>
```

`$scope.myfile` :
```json
  {
    "filesize": 54836 (bytes),
    "filetype": "image/jpeg",
    "filename": "profile.jpg",
    "base64":   "/9j/4AAQSkZJRgABAgAAAQABAAD//gAEKgD/4gIctcwIQA..."
  }
```

Installation
-------------
 - Bower -  `bower install angular-base64-upload`
 - NPM - `npm install angular-base64-upload`

Example
--------------------------
See [plunker](http://embed.plnkr.co/MTzfQASN8ZVeocAq7VcM/preview) or the [./demo](https://github.com/adonespitogo/angular-base64-upload/tree/master/demo) folder.

Usage
-------

Include `angular.js` and `angular-base64-upload.js` in your application and add `naif.base64` as dependency to your main module.

```
angular.module('myApp', ['naif.base64']);
```

```html
<form>
  <input type='file' ng-model='yourModel' base-sixty-four-input>
</form>
```

Multiple File Selection
--------------
Just add `multiple` attribute to the input element. `yourModel` will be an array of base64 file objects.
```html
  <form>
    <input type="file" ng-model="yourModel" multiple>
  </form>
```
Validations
------------
 - `maxsize` = Maximum file size in kilobytes (KB) (applied to all files when multi-select is enabled)
 - `minsize` = Minimum file size in kilobytes (KB) (applied to all files when multi-select is enabled)
 - `maxnum` = Maximum number of items to select (applicable only for multi-select)
 - `minnum` = Minimum number of items to select (applicable only for multi-select)
 - `accept` = [Input file accept attribute](http://www.w3schools.com/tags/att_input_accept.asp). `file_extension|audio/*|video/*|image/*|media_type` comma separated
 - `required` = required

```html
<form name="form">
  <input type="file" ng-model="files" name="files" multiple accept="image/*, .zip" maxsize="5000" required base-sixty-four-input>
  <span ng-show="form.files.$error.maxsize">Files must not exceed 5000 KB</span>
</form>
```

Pre-processing files
-------------------
You can pre-process files before the data gets added into the model.

Use case: You want images to be auto-resized after selecting files.

```
app.controller('ctrl', function ($scope, base64Converter) {

  $scope.resizeImage = function ( file, buffer ) {

    // file is a File object
    // buffer is result of reading the file by file reader

    var base64 = base64Converter.getBase64String(buffer); // get base64 string

    var newFile = someResizeFunction(base64);

    newFile = {
      filename: file.name,
      filetype: newFile.type,
      filesize: newFile.size,
      base64: newFile.base64,
    };

    return newFile; // append to model
  };

});

<input type="file" base-sixty-four-input ng-model="images" preprocessor="resizeImage" multiple>

```

Events
---------

<b>FileReader Events</b> - You can listen to all [FileReader events](https://developer.mozilla.org/en-US/docs/Web/API/FileReader#Event_handlers) by adding attributes to the input element using the format `event_name="handler"`. Ex: `onerror="errorHandlerFunc"`.
 - List of file reader event names:
   - `onabort`
   - `onerror`
   - `onload`
   - `onloadstart`
   - `onloadend`
   - `onprogress`
 - Params
   - `EventObject` - File reader event object depending on the event type. This can be an `abort`, `error`, `load`, `loadstart`, `loadend`, or `progress` event object.
   - `FileReader` - A [File Reader](https://developer.mozilla.org/en-US/docs/Web/API/FileReader) instance used to read the file. Each file is read by respective file reader instance.
   - `File` - Current file being read by the file reader.
   - `FileList` - Array of selected files.
   - `FileObjects` - Array of base64 file objects that are done reading.
   - `Object` - Result of reading the file. In case of reading error, `object.base64` might be undefined.

<b>on-change</b> - Unfortunately, Angular's `ng-change` directive doesn't work so well with input type file. This is the alternative way of binding to input's `onchange` event.

`<input on-change="onChangeHandlerFunc">`

 - Params:
   - Event - Event object.
   - FileList - Array of selected files.

Example event handler implementation:
   ```
   $scope.errorHandler = function (event, reader, fileList, fileObjs, file) {
     console.log("An error occurred while reading file: "+file.name);
     reader.abort();
   };

   <form>
    <input type="file" base-sixty-four-input ng-model="myfile" onerror="errorHandler">
   <form>
   ```

Converstions
-------------
`base64Converter` service has 2 methods for converting file to base64 and base64 to a Blob.
 - `base64Converter.getBase64String(buffer)` - Returns base64 string from a buffer.
 - `base64Converter.base64ToBlob(base64, file_type)` - Converts base64 string to a `Blob`. Returns Blob object.
 - `base64Converter.getBase64Object(file)` - Convert file to base64 object. Returns a promise object.

Server-Side
---------------

You will have to decode the base64 file in your backend on your own.
Sample PHP code for decoding base64 file in
[demo folder](https://github.com/adonespitogo/angular-base64-upload/tree/master/demo).
Start it by cd-ing to this directory and running:

    php -S 0.0.0.0:8000

Then point your browser to [http://localhost:8000]().

Below is a ruby code for decoding the base64-encoded file to be passed to paperclip:
```ruby
def create
  @resource.attachment = decode_base64
  # save resource and render response ...
end

def decode_base64
  # decode base64 string
  Rails.logger.info 'decoding base64 file'
  decoded_data = Base64.decode64(params[:your_model][:base64])
  # create 'file' understandable by Paperclip
  data = StringIO.new(decoded_data)
  data.class_eval do
    attr_accessor :content_type, :original_filename
  end

  # set file properties
  data.content_type = params[:your_model][:filetype]
  data.original_filename = params[:your_model][:filename]

  # return data to be used as the attachment file (paperclip)
  data
end
```

Contribution
------------
 - Using [Grunt](http://gruntjs.com) as build tool
 - `grunt build` to build the project
 - `grunt test` to run unit tests
 - Uses [jasmine 1.3](http://jasmine.github.io/1.3/introduction.html) in writing unit test specs

Change Log
--------

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


Author
-------
[Adones Pitogo](http://adonespitogo.com)

Contributors
------------
 - [@agibson-fl](https://github.com/agibson-fl)
 - [@drola](https://github.com/drola)
 - [@jamesharrington](https://github.com/jamesharrington)
 - [@gbrennon](https://github.com/gbrennon)
 - [@boxfrommars](https://github.com/boxfrommars)
 - [@kermit666](https://github.com/kermit666)
 - [@marksyzm](https://github.com/marksyzm)

## License

Released under the terms of MIT License.
