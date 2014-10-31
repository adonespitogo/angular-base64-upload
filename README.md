angular-base64-upload
=====================

![alt tag](https://raw.github.com/adonespitogo/angular-base64-upload/master/banner.png)

Angular directive for uploading base64-encoded files that you can pass along with the resource model. This directive is based from one of the answers in this [SO question](http://stackoverflow.com/questions/20521366/rails-4-angularjs-paperclip-how-to-upload-file).

<b>Note:</b> This directive only supports single file selection.

Installation
-------------
<b>Bower:</b> `bower install angular-base64-upload`

Example
--------------------------
See the [demo folder](https://github.com/adonespitogo/angular-base64-upload/tree/master/demo).

Usage
-------

Include `angular.js` and `angular-base64-upload.js` in your application and add `naif.base64` as dependency to your main module:

```
angular.module('myApp', ['naif.base64']);
```

HTML: <br>
```html
<form>
  <input type='file' ng-model='yourModel' base-sixty-four-input>
</form>
```

Sample `yourModel` value after selecting a file:
```json
{
  "filesize": 54836,
  "filetype": "image/jpeg",
  "filename": "profile.jpg",
  "base64":   "/9j/4AAQSkZJRgABAgAAAQABAAD//gAEKgD/4gIcSUNDX1BST0ZJTEUAAQEAAAIMbGNtcwIQA..."
}
```

Server-Side
---------------

You will have to decode the base64 file in your backend on your own. Sample PHP code for decoding base64 file in [demo folder](https://github.com/adonespitogo/angular-base64-upload/tree/master/demo).
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

## License

Released under the terms of MIT License.
