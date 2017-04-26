module.exports = function (ANGULAR_VERSION) {

  ANGULAR_VERSION = ANGULAR_VERSION || '1.2.0';

  return [
      "bower_components/jquery/dist/jquery.js",
      "bower_components/lodash/lodash.js",
      "bower_components/angular-v"+ANGULAR_VERSION+"/angular.js",
      "bower_components/angular-mocks-v"+ANGULAR_VERSION+"/angular-mocks.js",
      "src/angular-base64-upload.js",
      "test/helpers/globals.js",
      "test/helpers/mocks.js",
      "test/helpers/compiler.js",
      "test/*.spec.js"
  ];
};