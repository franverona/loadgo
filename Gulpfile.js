const gulp = require('gulp');
const { series, parallel, watch, src, dest } = gulp;

const del = require('del');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const replaceString = require('gulp-string-replace');

const babel = require('gulp-babel');

// Version is read from package.json version attribute
const version = require('./package.json').version;

// Remove /dist folder for cleaner production build
function clean() {
  return del('dist/');
}

// Minify JS file and copy to /dist
function compile_scripts() {
  return src('src/**/*.js')
    .pipe(
      babel({
        presets: ['@babel/preset-env']
      })
    )
    .pipe(
      uglify({
        output: {
          comments: 'some'
        }
      })
    )
    .pipe(rename({ suffix: '.min' }))
    .pipe(
      replaceString(
        new RegExp(
          /\@preserve\sLoadGo\sv([0-9]+)\.?([0-9]+)(\.([0-9]+))?\s\(http:\/\/franverona.com\/loadgo\)/g
        ),
        '@preserve LoadGo v' + version + ' (https://franverona.com/loadgo)'
      )
    )
    .pipe(
      replaceString(
        new RegExp(/([0-9])+\s-\sFran Verona/g),
        new Date().getFullYear() + ' - Fran Verona'
      )
    )
    .pipe(dest('dist/'));
}

exports.default = series(clean, compile_scripts);
