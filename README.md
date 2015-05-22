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

Events
---------
Based from the [FileReader API Event Handlers](https://developer.mozilla.org/en-US/docs/Web/API/FileReader#Event_handlers). Events are broadcasted to the `$rootScope` following the naming convention `base64:event:[handler_name]`.
 - Event Names
   - `base64:event:onabort`
   - `base64:event:onerror`
   - `base64:event:onloadstart`
   - `base64:event:onloadend`
   - `base64:event:onprogress`
 - Params
   - `EventObject` - Angular broadcast event object.
   - `EventObject` - File reader event object depending on the event type. This can be an `abort`, `error`, `load`, `loadstart`, `loadend`, or `progress` event object.
   - `FileList` - Array of selected files.
   - `FileObjects` - Array of base64 file objects that are done reading.
   - `File` - Current file being read by the file reader.
 - Example:
   ```
   $rootScope.$on(
     'base64:event:onerror',
     function (eventObj, fileReaderEventObj, rawFiles, fileObjs, fileObj) {
      console.log("An error occured while reading file:");
        console.log(fileObj);
     }
   );
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

Chagelog
--------
 V0.1.0
 - Support for multiple file selection.
 - Removed `base-sixty-four-image` and `base-sixty-four-image-placeholder` directives.
 - Broadcast file reader events to $rootScope.

## License

Released under the terms of MIT License.
