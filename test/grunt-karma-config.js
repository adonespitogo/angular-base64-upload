
var ANGULAR_VERSIONS = ['1.2.0', '1.2.1', '1.2.25', '1.2.28', '1.3.15'];

var gruntKarmaConfig = {};

for (var i = 0; i < ANGULAR_VERSIONS.length; i++) {
  var VERSION = ANGULAR_VERSIONS[i];
  gruntKarmaConfig['AngularJS-v'+VERSION] = {
    configFile: 'test/karma-config-ng-'+VERSION+'.js',
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
  };
}

module.exports = gruntKarmaConfig;