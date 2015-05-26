
function _make_version_range (version, start, end) {
  var versions = [];
  for (var i = start; i <= end; i ++) {
    versions.push(version + '.' + i);
  }
  return versions;
}

var v12 = _make_version_range('1.2', 0, 28);
var v13 = _make_version_range('1.3', 0, 15);
var ANGULAR_VERSIONS = v12.concat(v13);
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
    var files = fileLoader(VERSION);

    grunt.config('karma.options.files', files);
    grunt.config('karma.options.reporters', self.version_index === 0? ['story', 'coverage'] : ['story']);

    console.log('\n\n\n\t\tRUNNING TEST AGAINST ANGULAR v'+VERSION);

    grunt.task.run('karma:unit')
    .then(function () {
      self.version_index ++;
      if (ANGULAR_VERSIONS[self.version_index]) {
        self.runTest();
      }
    });

  };

}

module.exports = TestRunner;