var VERSION = '1.2.25';

var files = require('./files.js')(VERSION);

module.exports = function ( karma ) {
  karma.set({
    basePath: './../',
    files: files
  });
};
