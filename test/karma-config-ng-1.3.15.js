var VERSION = '1.3.15';

var files = require('./files.js')(VERSION);

module.exports = function ( karma ) {
  karma.set({
    basePath: './../',
    files: files
  });
};
