# gulp-angular-gettext-annotate

## About

Gulp plugin for adding [angular-gettext](http://angular-gettext.rocketeer.be/)
[annotations](http://angular-gettext.rocketeer.be/dev-guide/annotate/) to
templates. Following annotations are currently supported:

* `translate` directive - it searches for all nodes in DOM tree that contain
text only children or inline tags like `<strong>` and annotates them,
* `translate` filter in attributes - checks for strings in `placeholder`, `title`
and `alt` attributes.

After running a plugin you should `diff` to check if the process went well and
to add `translate-plural`s and more advanced annotations or to add
`translate-comment`s.