import validate from '../../lib/validation'
import should from 'should'
import _ from 'lodash'
import mocha from 'mocha'

describe('validation', function() {
    describe('payment', function() {
        it('should accept valid payment', function() {
            var res = validate({
                source: 'a',
                target: 'b',
                amount: 10,
                trip: 'tripName'
            }, 'payment')

            res.valid.should.be.ok
        })

        it('should validate payment', function() {
            var res = validate({}, 'payment')
            var err = res.errors
            res.valid.should.be.false
            _.each(['trip', 'source', 'target', 'amount'], function(prop) {
                should.exist(_.findWhere(err, {
                    params: [prop],
                    code: 'OBJECT_MISSING_REQUIRED_PROPERTY'
                }))
            })
        })

        it('should reject non numeric amount', function() {
            var res = validate({
                source: 'a',
                target: 'b',
                amount: 'asd',
                trip: 'tripname'
            }, 'payment')

            res.valid.should.be.false
            var err = res.errors
            err.should.have.a.lengthOf(1)
            should.exist(_.findWhere(err, {
                code: 'INVALID_TYPE',
                path: '#/amount'
            }))
        })
    })
})
