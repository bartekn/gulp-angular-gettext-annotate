'use strict';

var _ = require('lodash');
var cheerio = require('cheerio');
var gutil = require('gulp-util');
var through = require('through2');

var pluginName = require('./package.json').name;

module.exports = function(options) {
  options = _.extend({
    inlineTags: ['br', 'b', 'i', 'u', 'strong'],
    attributesToAnnotate: ['placeholder', 'title', 'alt']
  }, options);

  return through.obj(function(file, enc, callback) {
    if (file.isNull()) {
      this.push(file);
      callback();
      return;
    }

    if (file.isStream()) {
      this.emit('error', new gutil.PluginError(pluginName, 'Streaming not supported'));
      callback();
      return;
    }

    var $ = cheerio.load(file.contents, {decodeEntities: false});

    $('*').each(function (index, n) {
      var node = $(n);
      var annotate = false;

      if (node[0].children.length === 1) {
        // If there is only one child it can be:
        // - tag node - we do nothing, we will annotate it later (if applicable)
        // - text node - we check if it contains binding only and if it does
        //               we obviously don't annotate it, we also check if parent
        //               hasn't been annotated
        if (node[0].children[0].type === 'text') {
          var text = node[0].children[0].data.trim();
          if (!(text.substr(0, 2) === '{{' && text.indexOf('}}') === text.length - 2) &&
              typeof node.parent().attr('translate') === 'undefined') {
            annotate = true;
          }
        }
      } else if (node[0].children.length > 1) {
        // We check each child of an element. If an element contains only text
        // nodes and inline tags like <br /> or <strong> we annotate it.
        annotate = _.every(node[0].children, function(child) {
          return (child.type === 'text') ||
            (child.type === 'tag' && _.contains(options.inlineTags, child.name));
        });

        // We also have to check if all text nodes are nonempty. Ex. in code below:
        // <div>
        //     <b>Only b tag should be annotated.</b>
        // </div>
        // there are 3 children: text node ("\n"), <b> node and text node ("\n").
        // If all text nodes are whitespaces we annotate child tag node(s).
        annotate = annotate && !_.every(node[0].children, function(child) {
          return (child.type === 'tag' || (child.type === 'text' && child.data.trim() === ''));
        });
      }

      if (annotate) {
        node.attr('translate', '');
      }

      // Annotating attributes
      _.forEach(options.attributesToAnnotate, function(attr) {
        if (node.attr(attr)) {
          annotateAttribute(node, attr);
        }
      });
    });

    // Unfortunately there is no way to add empty attribute in cheerio.
    // We simply replace it.
    var html = $.html().replace(/translate=""/g, 'translate');
    file.contents = new Buffer(html);
    this.push(file);
    callback();
  });
};

function annotateAttribute(node, attr) {
  var val = node.attr(attr);
  val = "{{'"+val+"'|translate}}";
  node.attr(attr, val);
}