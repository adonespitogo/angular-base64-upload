'use strict'

const gulp = require('gulp')
const uglify = require('gulp-uglify')
const jslint = require('gulp-jslint')
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

gulp.task('jslint', () => {
  return gulp.src(src)
    .pipe(jslint({
      for: true
    }))
    .on('error', function swallowError(err) {
      gutil.log(err);
      gutil.beep();
      this.emit('end');
    })
    .pipe(jslint.reporter('default'))
})

gulp.task('test', done => {
  new TestRunner(done)
})

gulp.task('debug', () => {
  return gulp.src(src)
    .pipe(insert.prepend(banner))
    .pipe(gulp.dest(dist))
})

gulp.task('uglify', () => {
  return gulp.src(src)
    .pipe(insert.prepend(banner))
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(rename(path => {
      path.basename += '.min'
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(dist))
})

gulp.task('build', ['clean', 'debug', 'uglify'])

gulp.task('default', ['build'])
