'use strict'

const Server = require('karma').Server

function _make_version_range(version, start, end) {
  var versions = [];
  for (var i = start; i <= end; i++) {
    versions.push(version + '.' + i);
  }
  return versions;
}

var v12 = _make_version_range('1.2', 0, 28);
var v13 = _make_version_range('1.3', 0, 15);
var ANGULAR_VERSIONS = v12.concat(v13);
var fileLoader = require('./file_loader.js');

class TestRunner {
  constructor(done) {
    this.isDone = false
    this.done = done
    this.version_index = 0
    this.run()
  }

  run() {
    let ng_version = ANGULAR_VERSIONS[this.version_index]
    let files = fileLoader(ng_version)
    let reporters = this.version_index === 0 ? ['story', 'coverage'] : ['story']

    console.log('\n\n\n\t\tRUNNING TEST AGAINST ANGULAR v' + ng_version)

    new Server({
      configFile: __dirname + '/karma.conf.js',
      files,
      reporters
    }, exitCode => {
      if (this.version_index === ANGULAR_VERSIONS.length - 1) {
        if (!this.isDone) {
          this.done()
          this.isDone = true
          process.exit(exitCode)
        }
      } else {
        this.version_index += 1
        this.run()
      }
    }).start();
  }

}

module.exports = TestRunner;
