angular-base64-upload
=====================

Angular directive for uploading base64-encoded files that you can pass along with the resource model. This directive is based from one of the answers in this [SO question](http://stackoverflow.com/questions/20521366/rails-4-angularjs-paperclip-how-to-upload-file).

Note: This directive only supports single file selection.

Usage
-------

Include `angular.js` and `angular-base64-upload.js` in your application. Create a form and add `<input type='file' ng-model='yourModel' base-sixty-four-input>`.

Note: `yourModel` will hold the 3 values from the directive namely `filetype`, `filename` and `base64`.

Sample value:
```json
{
  fileType: 'text/plain',
  fileName: 'textfile.txt',
  base64: '/asdjfo4sa]f57as]fd42sdf354asdf2as35fd4'
}
```

You will have to decode the base64 file in your backend on your own.
Sample ruby code for decoding the base64-encoded file using paperclip:
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

Example
--------------------------
See the demo folder.

## License

Released under the terms of MIT License.
