/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner:
      '/*! <%= pkg.title || pkg.name %> - <%= pkg.version %>\n' +
      '* <%= pkg.homepage %>\n' +
      '* Copyright (c) <%= pkg.author %> <%= grunt.template.today("yyyy") %>;\n' +
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
        src: '**',
        cwd: '<%= config.dist %>/',
        dest: '<%= config.demo %>/'
      }
    },
    clean: [
      '<%= config.dist %>',
      '<%= config.demo %>/<%= pkg.name %>.js',
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
        src: 'Gruntfile.js'
      },
      'angular-base64-upload': {
        src: 'src/angular-base64-upload.js'
      },
      tests: {
        options: {
          curly: true,
          eqeqeq: true,
          immed: true,
          latedef: true,
          newcap: true,
          noarg: true,
          sub: true,
          undef: false,
          unused: false,
          boss: true,
          eqnull: true,
          browser: true,
          globals: {
            angular: true
          }
        },
        src: 'test/**/*.js'
      }
    },
    karma: {
      'v1.2.0': {
        configFile: 'test/karma-config-ng-1.2.0.js',
        background: false,
        singleRun: true
      },
      'v1.2.1': {
        configFile: 'test/karma-config-ng-1.2.1.js',
        background: false,
        singleRun: true
      },
      'v1.2.25': {
        configFile: 'test/karma-config-ng-1.2.25.js',
        background: false,
        singleRun: true
      },
      'v1.2.28': {
        configFile: 'test/karma-config-ng-1.2.28.js',
        background: false,
        singleRun: true
      },
      'v1.3.15': {
        configFile: 'test/karma-config-ng-1.3.15.js',
        background: false,
        singleRun: true
      }
    },
    watch: {
      src: {
        files: ['<%= config.src %>/<%= pkg.name %>.js'],
        tasks: ['build']
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('build', ['clean', 'jshint', 'concat', 'uglify', 'copy']);
  grunt.registerTask('test', ['jshint:angular-base64-upload', 'jshint:tests', 'karma']);
  grunt.registerTask('default', ['build']);

};
