var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('scripts', function () {
  gulp.src(['www/src/core/*.js', 'www/src/*.js'])   // order matters
          .pipe(sourcemaps.init())
          .pipe(concat('pixi-carousel.min.js'))
          .pipe(uglify())
          .pipe(sourcemaps.write('./'))
          .pipe(gulp.dest('dist'));
});

gulp.task('styles', function () {
});

gulp.task('watch', function () {
  gulp.watch('src/**/*.js', ['scripts']);
});

gulp.task('default', ['scripts', 'styles']);


// gulp scripts


