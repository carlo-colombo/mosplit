'use strict';

var _validation = require('../lib/validation');

var _validation2 = _interopRequireDefault(_validation);

var _should = require('should');

var _should2 = _interopRequireDefault(_should);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _mocha = require('mocha');

var _mocha2 = _interopRequireDefault(_mocha);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('validation', function () {
    describe('payment', function () {
        it('should accept valid payment', function () {
            var res = (0, _validation2.default)({
                source: 'a',
                target: 'b',
                amount: 10,
                trip: 'tripName'
            }, 'payment');

            res.valid.should.be.ok;
        });

        it('should validate payment', function () {
            var res = (0, _validation2.default)({}, 'payment');
            var err = res.errors;
            res.valid.should.be.false;
            _lodash2.default.each(['trip', 'source', 'target', 'amount'], function (prop) {
                _should2.default.exist(_lodash2.default.findWhere(err, {
                    params: [prop],
                    code: 'OBJECT_MISSING_REQUIRED_PROPERTY'
                }));
            });
        });

        it('should reject non numeric amount', function () {
            var res = (0, _validation2.default)({
                source: 'a',
                target: 'b',
                amount: 'asd',
                trip: 'tripname'
            }, 'payment');

            res.valid.should.be.false;
            var err = res.errors;
            err.should.have.a.lengthOf(1);
            _should2.default.exist(_lodash2.default.findWhere(err, {
                code: 'INVALID_TYPE',
                path: '#/amount'
            }));
        });
    });
});