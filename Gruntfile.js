/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner:
      '/*! <%= pkg.title || pkg.name %> - <%= pkg.version %>\n' +
      '* <%= pkg.homepage %>\n' +
      '* Copyright (c) <%= pkg.author %> [<%= grunt.template.today("mmmm dd, yyyy") %>]\n' +
      '* Licensed <%= pkg.license %> */\n',
    config: {
      dist:'./dist',
      src: './src',
      demo: './demo',
      js: [
        '<%= config.src %>/**/*.js'
      ]
    },
    copy: {
      distToDemo: {
        expand: true,
        src: '**/angular-base64-upload.js*',
        cwd: '<%= config.dist %>/',
        dest: '<%= config.demo %>/'
      }
    },
    clean: [
      '<%= config.dist %>',
      '<%= config.demo %>/<%= pkg.name %>.min.js',
      '<%= config.demo %>/<%= pkg.name %>.min.js.map'
    ],

    // Task configuration.
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      dist: {
        src: ['<%= config.js %>'],
        dest: '<%= config.dist %>/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>',
        sourceMap: true
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: '<%= config.dist %>/<%= pkg.name %>.min.js'
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        browser: true,
        globals: {
          angular: true
        }
      },
      gruntfile: {
        options: {
          undef: false
        },
        src: 'Gruntfile.js'
      },
      'angular-base64-upload': {
        src: 'src/angular-base64-upload.js'
      },
      tests: {
        options: {
          undef: false,
          unused: false
        },
        src: ['test/**/*.js']
      }
    },
    karma: {
      options: {
        configFile: './test/config/karma.conf.js'
      },
      unit: {
      }
    },
    watch: {
      src: {
        files: ['<%= config.src %>/<%= pkg.name %>.js'],
        tasks: ['build']
      }
    }
  });

  // load plugins
  require('load-grunt-tasks')(grunt);

  grunt.registerTask('default', ['build']);
  grunt.registerTask('build', ['clean', 'jshint', 'concat', 'uglify', 'copy']);

  grunt.registerTask('test', function () {
    var TestRunner = require('./test/config/grunt_test_runner.js');
    var runner = new TestRunner(grunt);
    runner.run();
  });

};
