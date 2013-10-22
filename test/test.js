var pattern = require('../index'),
    Pattern = pattern.Pattern,
    PatternGroup = pattern.PatternGroup;


// Test Patterns --------------------------------------------------------------
// ----------------------------------------------------------------------------
var files = [
    'style/main.less',
    'index.jade',
    'js/classes/B.js',
    'partials/form.jade',
    'lib/bootstrap/bootstrap.css',
    'js/classes/C.js',
    'lib/bootstrap/bootstrap.js',
    'js/classes/A.js',
    'lib/bootstrap/bootstrap.min.js',
    'js/app.js',
    'js/util.js',
    'style/fix.less',
    'js/config.js',
    'style/view.less'
];


// Static Methods -------------------------------------------------------------
// ----------------------------------------------------------------------------
exports.statics = {

    toPattern: function(test) {

        test.throws(function() {
            Pattern.toPattern();

        }, TypeError, 'Empty pattern expression.');

        test.ok(Pattern.toPattern({}) instanceof Pattern);
        test.ok(Pattern.toPattern([]) instanceof PatternGroup);
        test.ok(Pattern.toPattern(/abc/, '*') instanceof Pattern);
        test.ok(Pattern.toPattern(/abc/) instanceof Pattern);
        test.ok(Pattern.toPattern('*') instanceof Pattern);
        test.done();

    },

    toExp: function(test) {

        test.ok(Pattern.toExp(/abc/) instanceof RegExp);
        test.ok(Pattern.toExp('abc') instanceof RegExp);
        test.ok(Pattern.toExp('*') instanceof RegExp);
        test.ok(Pattern.toExp(function() {}) instanceof Function);

        test.throws(function() {
            Pattern.toExp(null);

        }, TypeError, 'Invalid pattern expression: null');

        test.throws(function() {
            Pattern.toExp();

        }, TypeError, 'Invalid pattern expression: undefined');

        test.throws(function() {
            Pattern.toExp(1);

        }, TypeError, 'Invalid pattern expression: 1');

        test.done();

    }

};


// Instance Methods -----------------------------------------------------------
// ----------------------------------------------------------------------------
exports.methods = {

    ctor: function(test) {

        test.throws(function() {
            Pattern();

        }, TypeError, 'Empty pattern expression.');

        test.ok(Pattern(/abc/) instanceof Pattern);
        test.ok(Pattern('*') instanceof Pattern);
        test.ok(Pattern(['*']) instanceof PatternGroup);
        test.ok(Pattern(/abc/, '*', ['*']) instanceof Pattern);

        test.done();

    },

    last: function(test) {
        test.done();
    },

    merge: function(test) {

        var p = Pattern('*');

        test.throws(function() {
            p.merge();

        }, TypeError, 'Invalid pattern expression: undefined');

        test.done();
    },

    not: function(test) {
        test.done();
    }

};


// Pattern Types --------------------------------------------------------------
// ----------------------------------------------------------------------------
exports.patterns = {

    fromString: function(test) {

        test.deepEqual(Pattern('*.jade').matches(files), [
            'index.jade'
        ]);

        test.deepEqual(Pattern('js/*.js').matches(files), [
            'js/app.js',
            'js/util.js',
            'js/config.js'
        ]);

        test.deepEqual(Pattern('lib/**/*.js').matches(files), [
            'lib/bootstrap/bootstrap.js',
            'lib/bootstrap/bootstrap.min.js'
        ]);

        test.deepEqual(Pattern('style/*.less').matches(files), [
            'style/main.less',
            'style/fix.less',
            'style/view.less'
        ]);

        test.deepEqual(Pattern('js/classes/*').matches(files), [
            'js/classes/B.js',
            'js/classes/C.js',
            'js/classes/A.js'
        ]);

        test.deepEqual(Pattern('**/*.js').matches(files), [
            'js/classes/B.js',
            'js/classes/C.js',
            'lib/bootstrap/bootstrap.js',
            'js/classes/A.js',
            'lib/bootstrap/bootstrap.min.js',
            'js/app.js',
            'js/util.js',
            'js/config.js'
        ]);

        test.done();

    },

    fromRegularExpression: function(test) {

        test.deepEqual(Pattern(/.*\.jade/).matches(files), [
            'index.jade',
            'partials/form.jade'
        ]);

        test.deepEqual(Pattern(/js\/.*\.js/).matches(files), [
            'js/classes/B.js',
            'js/classes/C.js',
            'js/classes/A.js',
            'js/app.js',
            'js/util.js',
            'js/config.js'
        ]);

        test.deepEqual(Pattern(/lib\/.*\/.*\.js/).matches(files), [
            'lib/bootstrap/bootstrap.js',
            'lib/bootstrap/bootstrap.min.js'
        ]);

        test.deepEqual(Pattern(/.*\.js/).matches(files), [
            'js/classes/B.js',
            'js/classes/C.js',
            'lib/bootstrap/bootstrap.js',
            'js/classes/A.js',
            'lib/bootstrap/bootstrap.min.js',
            'js/app.js',
            'js/util.js',
            'js/config.js'
        ]);

        test.done();

    },

    fromFunction: function(test) {

        function m(file) {
            return file.indexOf('classes') !== -1;
        }

        test.deepEqual(Pattern(m).matches(files), [
            'js/classes/B.js',
            'js/classes/C.js',
            'js/classes/A.js'
        ]);

        test.done();

    },

    fromObject: function(test) {

        var obj = {
            string: 'js/*.js',
            regex: /.*\.less$/
        };

        test.deepEqual(Pattern(obj).matches(files), [
            'style/main.less',
            'js/app.js',
            'js/util.js',
            'style/fix.less',
            'js/config.js',
            'style/view.less'
        ]);

        test.done();

    },

    fromArray: function(test) {

        var list = [
            /lib\/.*\.js/,
            'js/classes/*.js',
            /\.js$/
        ];

        test.deepEqual(Pattern(list).matches(files), [
            'lib/bootstrap/bootstrap.js',
            'lib/bootstrap/bootstrap.min.js',
            'js/classes/B.js',
            'js/classes/C.js',
            'js/classes/A.js',
            'js/app.js',
            'js/util.js',
            'js/config.js'
        ]);

        test.done();

    },

    last: function(test) {

        test.deepEqual(Pattern(/\.js$/).last('js/util.js', 'js/config.js', 'js/app.js').matches(files), [
            'js/classes/B.js',
            'js/classes/C.js',
            'lib/bootstrap/bootstrap.js',
            'js/classes/A.js',
            'lib/bootstrap/bootstrap.min.js',
            'js/util.js',
            'js/config.js',
            'js/app.js'
        ]);

        test.done();

    },

    first: function(test) {

        test.deepEqual(Pattern(/\.js$/).first('js/util.js', 'js/config.js', 'js/app.js').matches(files), [
            'js/util.js',
            'js/config.js',
            'js/app.js',
            'js/classes/B.js',
            'js/classes/C.js',
            'lib/bootstrap/bootstrap.js',
            'js/classes/A.js',
            'lib/bootstrap/bootstrap.min.js'
        ]);

        test.done();

    },

    not: function(test) {

        test.deepEqual(Pattern(/\.js$/).not('js/util.js', 'js/config.js', 'js/app.js').matches(files), [
            'js/classes/B.js',
            'js/classes/C.js',
            'lib/bootstrap/bootstrap.js',
            'js/classes/A.js',
            'lib/bootstrap/bootstrap.min.js'
        ]);

        test.done();

    },

    all: function(test) {

        test.deepEqual(Pattern('*').matches(files), [
            'style/main.less',
            'index.jade',
            'js/classes/B.js',
            'partials/form.jade',
            'lib/bootstrap/bootstrap.css',
            'js/classes/C.js',
            'lib/bootstrap/bootstrap.js',
            'js/classes/A.js',
            'lib/bootstrap/bootstrap.min.js',
            'js/app.js',
            'js/util.js',
            'style/fix.less',
            'js/config.js',
            'style/view.less'
        ]);

        test.done();

    },

    multiMatch: function(test) {

        var p = Pattern(/js\/[^\/]*\.js$/, /js\/.*\.js$/);
        test.deepEqual(p.matches(files), [
            'js/classes/B.js',
            'js/classes/C.js',
            'js/classes/A.js',
            'js/app.js',
            'js/util.js',
            'js/config.js'
        ]);

        p = Pattern('js/**/*.js', 'js/*.js');
        test.deepEqual(p.matches(files), [
            'js/classes/B.js',
            'js/classes/C.js',
            'js/classes/A.js',
            'js/app.js',
            'js/util.js',
            'js/config.js'
        ]);

        test.done();

    },

    combination: function(test) {

        var p = Pattern(/js\/.*\.js$/).
                first('js/config.js').
                last('js/classes/**/*.js', 'js/util.js', 'js/app.js');

        test.deepEqual(p.matches(files), [
            'js/config.js',
            'js/classes/B.js',
            'js/classes/C.js',
            'js/classes/A.js',
            'js/util.js',
            'js/app.js'
        ]);

        test.done();

    }

};

