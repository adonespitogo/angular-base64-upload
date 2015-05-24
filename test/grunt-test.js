
var ANGULAR_VERSIONS = [
  '1.2.0',
  '1.2.5',
  '1.2.10',
  '1.2.15',
  '1.2.20',
  '1.2.25',
  '1.2.28',
  '1.3.0',
  '1.3.5',
  '1.3.10',
  '1.3.15'
];

var fileLoader = require('./_loadFiles.js');

module.exports = function (grunt) {

  var version_index = 0;

  function _test () {

    var VERSION = ANGULAR_VERSIONS[version_index];

    var files = fileLoader(ANGULAR_VERSIONS[version_index]);
    grunt.config('karma.options.files', files);
    grunt.config('karma.options.coverageReporter.subdir', function (browser) {
      return browser+'/angular-v'+VERSION;
    });

    console.log('\n\n\n\t\tRUNNING TEST AGAINST ANGULAR V-'+VERSION);

    grunt.task.run('karma:unit')
    .then(function () {
      version_index ++;
      if (ANGULAR_VERSIONS[version_index]) {
        _test();
      }
    });

  }

  grunt.registerTask('pre-test', ['jshint:angular-base64-upload', 'jshint:tests']);
  grunt.task.run('pre-test').then(_test);

};