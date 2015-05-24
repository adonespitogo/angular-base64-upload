module.exports = function (ANGULAR_VERSION) {
  return [
      "bower_components/jquery/dist/jquery.js",
      "bower_components/lodash/lodash.js",
      "bower_components/angular-v"+ANGULAR_VERSION+"/angular.js",
      "bower_components/angular-mocks-v"+ANGULAR_VERSION+"/angular-mocks.js",
      "src/angular-base64-upload.js",
      "test/globals.js",
      "test/mocks.js",
      "test/helpers.js",
      "test/angular-base64-upload.spec.js"
  ];
};