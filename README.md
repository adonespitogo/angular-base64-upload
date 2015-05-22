angular-base64-upload
=====================

![alt tag](https://raw.github.com/adonespitogo/angular-base64-upload/master/banner.png)

Angular directive for uploading base64-encoded files that you can pass along with the resource model. This directive is based from one of the answers in this [SO question](http://stackoverflow.com/questions/20521366/rails-4-angularjs-paperclip-how-to-upload-file).

Installation
-------------
 - Bower -  `bower install angular-base64-upload`
 - NPM - `npm install angular-base64-upload`

Example
--------------------------
See the [demo folder](https://github.com/adonespitogo/angular-base64-upload/tree/master/demo).

Usage
-------

Include `angular.js` and `angular-base64-upload.js` in your application and add `naif.base64` as dependency to your main module:

```
angular.module('myApp', ['naif.base64']);
```

Sigle File Selection
------------
```html
<form>
  <input type='file' ng-model='yourModel' base-sixty-four-input>
</form>
```

Sample `yourModel` value after selecting a file:
```json
{
  "filesize": 54836 (bytes),
  "filetype": "image/jpeg",
  "filename": "profile.jpg",
  "base64":   "/9j/4AAQSkZJRgABAgAAAQABAAD//gAEKgD/4gIcSUNDX1BST0ZJTEUAAQEAAAIMbGNtcwIQA..."
}
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
 - `maxsize` = Maximum file size in kilobytes (KB)
 - `minsize` = Minimum file size in kilobytes (KB)
 - `maxnum` = Maximum number of items to select (available for multiple file selection)
 - `minnum` = Minimum number of items to select (available for multiple file selection)
 - `accept` = [Input file accept attribute](http://www.w3schools.com/tags/att_input_accept.asp). `file_extension|audio/*|video/*|image/*|media_type`
 - `required` = required

```html
<form name="form">
  <input type="file" ng-model="files" name="files" base-sixty-four-input multiple accept="image/*" maxsize="5000" required>
  <span ng-show="form.files.$error.maxsize">File must be less than or equal to 5000 KB</span>
</form>
```

Events
---------
Based from the [FileReader Event Handlers](https://developer.mozilla.org/en-US/docs/Web/API/FileReader#Event_handlers). You can pass file reader event handlers by adding attributes to the input element using the format `event_name="handler"`. Ex: `onerror="errorHandlerFunc"`.
 - List of available event names:
   - `onabort`
   - `onerror`
   - `onload`
   - `onloadstart`
   - `onloadend`
   - `onprogress`
 - Params
   - `EventObject` - File reader event object depending on the event type. This can be an `abort`, `error`, `load`, `loadstart`, `loadend`, or `progress` event object.
   - `FileReader` - [File Reader](https://developer.mozilla.org/en-US/docs/Web/API/FileReader) instance used to read file blobs.
   - `FileList` - Array of selected files.
   - `FileObjects` - Array of base64 file objects that are done reading.
   - `File` - Current file being read by the file reader.

Example
   ```
   $scope.errorHandler = function (event, reader, fileList, fileObjs, file) {
     console.log("An error occurred while reading file: "+file.name);
     reader.abort();
   };

   <form>
    <input type="file" base-sixty-four-input ng-model="myfile" onerror="errorHandler">
   <form>
   ```

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

Changelog
--------
 V0.1.0
 - Support for multiple file selection
 - Support for file reader event handlers
 - Added validations
 - Removed `base-sixty-four-image` and `base-sixty-four-image-placeholder` directives

Contribution
------------
 - using GRUNT as build tool
 - `grunt build` to build the project

Author
-------
Adones Pitoto <pitogo.adones@gmail.com>

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
