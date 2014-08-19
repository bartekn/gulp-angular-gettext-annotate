'use strict';

var _ = require('lodash');
var gulp = require('gulp');
var gettext_annotate = require('../index.js');
var glob = require('glob');
var del = require('del');
var fs = require('fs');
var expect = require('chai').expect;

del.sync('test/annotated');

describe('gulp-angular-gettext-annotate', function () {
  it('should annotate node with binding and text', function (done) {
    test('test/templates/testManyBindingsInTextNode.html', done);
  });

  it('should annotate node with inline tags and text', function (done) {
    test('test/templates/testManyInlineTags.html', done);
  });

  it('should not annotate node with binding only', function (done) {
    test('test/templates/testBindingOnlyTextNode.html', done);
  });

  it('should annotate lowest level nodes only', function (done) {
    test('test/templates/testEmptyTextNodes.html', done);
  });

  it('should annotate stellar-client templates correctly', function (done) {
    test('test/templates/stellar-*.html', done);
  });
});

function test(src, done) {
  gulp.src(src)
    .pipe(gettext_annotate())
    .pipe(gulp.dest('test/annotated'))
    .on('end', function checkDiff() {
      // Compare files
      var expectedFiles = glob.sync('test/annotated/**/*.html');
      var annotatedFiles = _.map(expectedFiles, function(filename) {
        return filename.replace('test/annotated', 'test/expected');
      });

      for (var i in expectedFiles) {
        var expected = fs.readFileSync(expectedFiles[i]).toString();
        var annotated = fs.readFileSync(annotatedFiles[i]).toString();
        expect(annotated).to.equal(expected);
      }

      // Remove annotated files
      del.sync('test/annotated');
      done();
    });
}