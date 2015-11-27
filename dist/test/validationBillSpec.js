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
    describe('bill', function () {
        it('should accept a valid bill', function () {
            var res = (0, _validation2.default)({
                splitters: ['a', 'b'],
                amount: 10.4,
                payer: 'a',
                trip: 'tripname'
            }, 'bill');

            res.valid.should.be.ok;
        });

        it('should validate bill', function () {
            var res = (0, _validation2.default)({}, 'bill');
            res.valid.should.be.false;
            _lodash2.default.each(['trip', 'splitters', 'payer', 'amount'], function (prop) {
                _should2.default.exist(_lodash2.default.findWhere(res.errors, {
                    params: [prop],
                    code: 'OBJECT_MISSING_REQUIRED_PROPERTY'
                }));
            });
        });

        it('should reject non numeric amount', function () {
            var res = (0, _validation2.default)({
                payer: 'a',
                splitters: ['b'],
                amount: 'asd',
                trip: 'tripname'
            }, 'bill');

            res.valid.should.be.false;
            res.errors.should.have.a.lengthOf(1);

            _should2.default.exist(_lodash2.default.findWhere(res.errors, {
                code: 'INVALID_TYPE',
                path: '#/amount'
            }));
        });

        it('should reject a bill with no splitters', function () {
            var res = (0, _validation2.default)({
                payer: 'a',
                splitters: [],
                amount: 10.5,
                trip: 'tripname'
            }, 'bill');
            res.valid.should.be.false;
            res.errors.should.have.a.lengthOf(1);
            _should2.default.exist(_lodash2.default.findWhere(res.errors, {
                code: 'ARRAY_LENGTH_SHORT',
                path: '#/splitters'
            }));
        });
    });
});