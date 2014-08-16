angular-base64-upload
=====================

Angular directive for uploading base64-encoded files that you can pass along with the resource model. This directive is based from one of the answers in this [SO question](http://stackoverflow.com/questions/20521366/rails-4-angularjs-paperclip-how-to-upload-file).

Note: This directive only supports single file selection.

Usage
-------

Include `angular.js` and `angular-base64-upload.js` in your application. Create a form and add `<input type='file' ng-file='yourModel' base-sixty-four-input>`.

Note: `yourModel` will hold the 3 values from the directive namely `fileType`, `fileName` and `base64`.

Sample value:
```json
{
  fileType: 'text/plain',
  fileName: 'textfile.txt',
  base64: '/asdjfo4sa]f57as]fd42sdf354asdf2as35fd4'
}
```

You will have to decode the base64 file in your backend on your own.

Example
--------------------------
See the demo folder.

## License

Released under the terms of MIT License.
