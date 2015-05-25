
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

var fileLoader = require('./file_loader.js');

function TestRunner (grunt) {

  var self = this;

  self._grunt = grunt;
  self.version_index = 0;

  self.run = function () {
    grunt = self._grunt;
    grunt.registerTask('pre-test', ['jshint:angular-base64-upload', 'jshint:tests']);
    grunt.task.run('pre-test').then(self.runTest);

  };

  self.runTest = function () {

    var VERSION = ANGULAR_VERSIONS[self.version_index];
    var files = fileLoader(ANGULAR_VERSIONS[self.version_index]);

    grunt.config('karma.options.files', files);
    grunt.config('karma.options.coverageReporter.subdir', function (browser) {
      return browser+'/angular-v'+VERSION;
    });

    console.log('\n\n\n\t\tRUNNING TEST AGAINST ANGULAR v'+VERSION);

    grunt.task.run('karma:unit')
    .then(function () {
      self.version_index ++;
      if (ANGULAR_VERSIONS[self.version_index]) {
        self.runTest();
      }
    });

  };


};

module.exports = TestRunner;