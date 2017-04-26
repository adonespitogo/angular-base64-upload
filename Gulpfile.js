'use strict'

const gulp = require('gulp')
const uglify = require('gulp-uglify')
const jshint = require('gulp-jshint')
const insert = require('gulp-insert')
const rename = require('gulp-rename')
const sourcemaps = require('gulp-sourcemaps')
const del = require('del')
const gutil = require('gulp-util')
const TestRunner = require('./test/config/test_runner')
const banner = require('./banner')
const src = 'src/**/*.js'
const dist = './dist'

gulp.task('clean', done => {
  del([dist + '/**/*']).then(paths => {
    console.log('Deleted files and folders:\n', paths.join('\n'))
    done()
  })
})

gulp.task('jshint', () => {
  return gulp.src(src)
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
})

gulp.task('test', ['jshint'], done => {
  new TestRunner(done)
})

gulp.task('debug', ['clean'], () => {
  return gulp.src(src)
    .pipe(insert.prepend(banner))
    .pipe(gulp.dest(dist))
})

gulp.task('uglify', ['clean'], () => {
  return gulp.src(src)
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(insert.prepend(banner))
    .pipe(rename(path => {
      path.basename += '.min'
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(dist))
})

gulp.task('build', ['clean', 'jshint', 'debug', 'uglify'])

gulp.task('default', ['build'])
