var JASMINE = './node_modules/karma-jasmine/lib/jasmine.js';
var ADAPTER = './node_modules/karma-jasmine/lib/adapter.js';

module.exports = function (config) {
  config.set({    basePath: './../',
    files: require('./_loadFiles')(),
    background: false,
    singleRun: true,

    preprocessors: {
        'src/angular-base64-upload.js': ['coverage']
    },
    frameworks: [ 'jasmine' ],
    logLevel:  'WARN',
    reporters: ['story', 'coverage'],

    coverageReporter: {
      type : 'html',
      dir : 'coverage/'
    },
    port: 7019,
    urlRoot: '/',
    autoWatch: false,
    browsers: ['PhantomJS']
  });
};