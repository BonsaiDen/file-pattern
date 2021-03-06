// Dependencies ---------------------------------------------------------------
var l = require('./lib/l'),
    minimatch = require('minimatch');


// Pattern --------------------------------------------------------------------
// ----------------------------------------------------------------------------
function Pattern() {

    // Invoking with `new` this WILL not be able to construct all pattern types
    // like e.g. from objects, those must to through the toPattern() function instead
    if (this instanceof Pattern) {

        this._match = [];
        this._last = [];
        this._first = [];
        this._not = [];

        l.map(l.flatten(arguments), this.merge, this);

    } else {
        return Pattern.toPattern.apply(null, arguments);
    }

}


// Pattern Groups -------------------------------------------------------------
// ----------------------------------------------------------------------------
function PatternGroup(patterns) {

    this._pattern = l.map(patterns, function(expr) {
        return Pattern.toPattern(expr);
    });

}


PatternGroup.prototype = {

    matches: function(items) {

        items = l.list(items);
        return l.flatten(this._pattern.map(function(p) {
            var matched = p.matches(items);
            items = l.without(items, matched);
            return matched;
        }));

    }

};


// Statics --------------------------------------------------------------------
Pattern.toExp = function(e) {

    if (e instanceof RegExp) {
        return e;

    } else if (typeof e === 'function') {
        return e;

    } else if (e === '*') {
        return (/^.*$/);

    } else if (e instanceof PatternGroup) {
        return e;

    } else if (typeof e === 'string') {
        return minimatch.makeRe(e);

    } else if (e === undefined || e === null || typeof e === 'number') {
        throw new TypeError('Invalid pattern expression: ' + e);

    // Handle Patterns from other contexts
    } else {
        return e;
    }

};

Pattern.toPattern = function(expr) {

    if (!expr) {
        throw new TypeError('Empty pattern expression.');

    } else if (expr instanceof Pattern) {
        return expr;

    } else if (expr.constructor === Object) {
        return new Pattern(l.values(expr));

    } else if (Array.isArray(expr)) {
        return new PatternGroup(expr);

    } else if (arguments.length > 1) {
        var p = new Pattern();
        Pattern.apply(p, arguments);
        return p;

    } else {
        return new Pattern(expr);
    }

};


// Methods --------------------------------------------------------------------
Pattern.prototype = {

    last: function() {
        l.push(this._last, l.map(arguments, Pattern.toExp));
        return this;
    },

    first: function() {
        l.push(this._first, l.map(arguments, Pattern.toExp));
        return this;
    },

    not: function() {
        l.push(this._not, l.map(arguments, Pattern.toExp));
        return this;
    },

    matches: function(items) {

        // Compiler the patterns
        var match = l.matches(this._match),
            not = l.matches(this._not),
            first = l.matches(this._first),
            last = l.matches(this._last);

        // Initial filtering of the items based on match and ignore
        items = items.filter(function(file) {
            return l.any(match, file) && !l.any(not, file);
        });

        // Partition the items based on the first and last patterns
        var parts = l.partition(items, [
            l.curry(l.any, first),
            l.curry(l.any, last)
        ]);

        // Recombine into one list and ensure to preserve order for first / last
        return l.flatten([
            this._sort(parts[0], first),
            parts[2],
            this._sort(parts[1], last)
        ]);

    },

    merge: function(expr) {

        if (!expr) {
            throw new TypeError('Invalid pattern expression: ' + expr);

        } else if (expr instanceof Pattern) {
            this._match.push.apply(this._match, expr._match);
            this._first.push.apply(this._first, expr._first);
            this._last.push.apply(this._last, expr._last);
            this._not.push.apply(this._not, expr._not);

        } else {
            this._match.push(Pattern.toExp(expr));
        }

        return this;

    },


    // Internal ---------------------------------------------------------------
    _sort: function(list, patterns) {

        var sorted = [];
        patterns.forEach(function(p) {
            sorted.push.apply(sorted, list.filter(function(file) {
                return p(file);
            }));
        });

        return sorted;

    }

};


// Exports --------------------------------------------------------------------
module.exports = {
    Pattern: Pattern,
    PatternGroup: PatternGroup
};

