/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - <%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= pkg.author %> <%= grunt.template.today("yyyy") %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    config: {
      dist:'./dist',
      src: './src',
      js: [
        '<%= config.src %>/**/*.js'
      ]
    },
    clean: ['<%= config.dist %>'],

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
        banner: '<%= banner %>'
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
      }
    },
    karma: {
        unit: {
            configFile: 'karma-unit.js',
            background: false,
            singleRun: true
        }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('build', ['clean', 'jshint', 'concat', 'uglify']);
  grunt.registerTask('default', ['karma:unit']);

};
