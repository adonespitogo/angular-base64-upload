
var ANGULAR_VERSIONS = ['1.2.0', '1.2.1', '1.2.10', '1.2.25', '1.2.28', '1.3.7', '1.3.15'];

var fileLoader = require('./_loadFiles.js');

module.exports = function (grunt) {

  var testCounter = 0;

  function _test () {

    var VERSION = ANGULAR_VERSIONS[testCounter];

    var files = fileLoader(ANGULAR_VERSIONS[testCounter]);
    grunt.config('karma.options.files', files);

    console.log('\n\n\n\t\t\tRUNNING TEST AGAINST ANGULAR V-'+VERSION);

    grunt.task.run('karma:unit')
    .then(function () {
      testCounter ++;
      if (ANGULAR_VERSIONS[testCounter]) {
        _test();
      }
    }, function () {
      testCounter ++;
      if (ANGULAR_VERSIONS[testCounter]) {
        _test();
      }
    });

  }

  grunt.registerTask('pre-test', ['jshint:angular-base64-upload', 'jshint:tests']);
  grunt.task.run('pre-test').then(_test);

};