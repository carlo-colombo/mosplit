'use strict';

var _views = require('../../lib/views');

var views = _interopRequireWildcard(_views);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _should = require('should');

var _should2 = _interopRequireDefault(_should);

var _mocha = require('mocha');

var _mocha2 = _interopRequireDefault(_mocha);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function evalMap(map, entry) {
    var emitted = [];
    function emit(id, doc) {
        emitted.push(arguments);
    }

    eval('(' + map.toString() + ')(entry)');

    return emitted;
}

describe("views", function () {
    describe("double_entry", function () {
        it("should emit 2 entry for a bill with a single splitter", function () {
            var res = evalMap(views.double_entry, {
                type: 'bill',
                splitters: ['b'],
                payer: 'a',
                amount: 10,
                trip: 'trip'
            });

            res.should.be.lengthOf(2);
            res.should.containDeep([[['trip', 'a'], -10], [['trip', 'b'], 10]]);

            res.map(_lodash2.default.property('1')).reduce(function (acc, val) {
                return acc + val;
            }, 0).should.be.eql(0);
        });

        it('should emit n+1 entry for a bill with n splitter', function () {
            var emitted = evalMap(views.double_entry, {
                type: 'bill',
                splitters: ['b', 'c', 'd'],
                payer: 'a',
                amount: 9,
                trip: 'trip'
            });

            emitted.should.be.lengthOf(4);
            emitted.should.containDeep([[['trip', 'a'], -9], [['trip', 'b'], 3], [['trip', 'c'], 3], [['trip', 'd'], 3]]);

            emitted.map(_lodash2.default.property('1')).reduce(function (acc, val) {
                return acc + val;
            }, 0).should.be.eql(0);
        });

        it('should return 2 entry for a payment', function () {
            var emitted = evalMap(views.double_entry, {
                type: 'payment',
                source: 'a',
                target: 'b',
                amount: 5,
                trip: 'trip'
            });

            emitted.should.be.lengthOf(2);
            emitted.should.containDeep([[['trip', 'a'], -5], [['trip', 'b'], 5]]);

            emitted.map(_lodash2.default.property('1')).reduce(function (acc, val) {
                return acc + val;
            }, 0).should.be.eql(0);
        });

        it('should ignore a bill if has property deleted', function () {
            var emitted = evalMap(views.double_entry, {
                deleted: true,
                amount: 10,
                splitters: ['a'],
                payer: 'b',
                type: 'bill'
            });

            emitted.should.have.lengthOf(0);
        });

        it('should ignore a payment if has property deleted', function () {
            var emitted = evalMap(views.double_entry, {
                deleted: true,
                amount: 10,
                source: 'a',
                target: 'b',
                type: 'payment'
            });

            emitted.should.have.lengthOf(0);
        });
    });
});