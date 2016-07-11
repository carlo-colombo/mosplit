import validate from '../../lib/validation'
import should from 'should'
import {find} from 'lodash'
import mocha from 'mocha'

import {payment} from '../../lib/schema'

describe('validation', function() {
    describe('payment', function() {
        it('should accept valid payment', function() {
            var res = validate({
                source: 'a',
                target: 'b',
                amount: 10,
                trip: 'tripName'
            }, payment)

            res.valid.should.be.ok
        })

        it('should validate payment', function() {
            let res = validate({}, payment)
            let err = res.errors

            res.valid.should.be.false;

            ['trip', 'source', 'target', 'amount'].forEach(prop => {
                should.exist(find(err, {
                    params: [prop],
                    code: 'OBJECT_MISSING_REQUIRED_PROPERTY'
                }))
            })
        })

        it('should reject non numeric amount', function() {
            let res = validate({
                source: 'a',
                target: 'b',
                amount: 'asd',
                trip: 'tripname'
            }, payment),
                err = res.errors

            res.valid.should.be.false

            err.should.have.a.lengthOf(1)

            should.exist(find(err, {
                code: 'INVALID_TYPE',
                path: '#/amount'
            }))
        })
    })
})
