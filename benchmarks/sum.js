/**
 * @fileOverview Cost to sum values in map of size `n`.
 */
var Benchmark = require('benchmark');

var ht = require('hashtrie');
var hamt = require('hamt');
var hamt_plus = require('hamt_plus');
var p = require('persistent-hash-trie');
var mori = require('mori');
var immutable = require('immutable');

var words = require('./words').words;
var api = require('./shared');

var nativeObjectSum = function(keys) {
    var h = api.nativeObjectFrom(keys);
    return function() {
        var sum = 0;
        for (var k in h) {
            if (h.hasOwnProperty(k)) {
                sum += h[k];
            }
        }
    };
};

var nativeMapSum = function(keys) {
    var h = api.nativeMapFrom(keys);
    return function() {
        var sum = 0;
        h.forEach(function(val, key) {
            sum += val;
        });
    };
};

var hashtrieSum = function(keys) {
    var add = function(p, x) {
        return p + x;
    };

    var h = api.hashtrieFrom(keys);
    return function() {
        ht.fold(add, 0, h);
    };
};

var hamtSum = function(keys) {
    var add = function(p, x) {
        return p + x;
    };

    var h = api.hamtFrom(keys);
    return function() {
        hamt.fold(add, 0, h);
    };
};

var hamtPlusSum = function(keys) {
    var add = function(p, x) {
        return p + x;
    };

    var h = api.hamtPlusFrom(keys);
    return function() {
        hamt_plus.fold(add, 0, h);
    };
};

var pHashtrieSum = function(keys) {
    var add = function(p, c) {
        return p + c;
    };

    var h = api.pHashtrieFrom(keys);
    return function() {
        p.reduce(h, add, 0);
    };
};

var moriSum = function(keys) {
    var add = function(p, _, c) {
        return p + c;
    };

    var h = api.moriFrom(keys);
    return function() {
        mori.reduceKV(add, 0, h);
    };
};

var immutableSum = function(keys) {
    var add = function(p, c) {
        return p + c;
    };

    var h = api.immutableFrom(keys);
    return function() {
        h.reduce(add, 0);
    };
};


module.exports = function(sizes) {
    return sizes.reduce(function(b, size) {
        var keys = words(size, 10);
        return b
            .add('nativeObject(' + size + ')',
                nativeObjectSum(keys))

        .add('nativeMap(' + size + ')',
            nativeMapSum(keys))

        .add('hashtrie(' + size + ')',
            hashtrieSum(keys))

        .add('hamt(' + size + ')',
            hamtSum(keys))

        .add('hamt+(' + size + ')',
            hamtPlusSum(keys))

        .add('persistent-hash-trie(' + size + ')',
            pHashtrieSum(keys))

        .add('mori hash_map(' + size + ')',
            moriSum(keys))

        .add('immutable(' + size + ')',
            immutableSum(keys));

    }, new Benchmark.Suite('Sum'));
};
