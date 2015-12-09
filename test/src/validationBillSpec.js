import validate from '../../lib/validation'
import should from 'should'
import _ from 'lodash'
import mocha from 'mocha'

import {bill, payment} from '../../lib/schema'

describe('validation', ()=>{
    describe('bill', function() {
        it('should accept a valid bill', function() {
            var res = validate({
                splitters: ['a', 'b'],
                amount: 10.4,
                payer: 'a',
                trip: 'tripname'
            }, bill)

            res.valid.should.be.ok
        })

        it('should validate bill', function() {
            var res = validate({}, bill)
            res.valid.should.be.false
            _.each(['trip', 'splitters', 'payer', 'amount'], function(prop) {
                should.exist(_.findWhere(res.errors, {
                    params: [prop],
                    code: 'OBJECT_MISSING_REQUIRED_PROPERTY'
                }))
            })
        })

        it('should reject non numeric amount', function() {
            var res = validate({
                payer: 'a',
                splitters: ['b'],
                amount: 'asd',
                trip: 'tripname'
            }, bill)

            res.valid.should.be.false
            res.errors.should.have.a.lengthOf(1)

            should.exist(_.findWhere(res.errors, {
                code: 'INVALID_TYPE',
                path: '#/amount'
            }))
        })

        it('should reject a bill with no splitters', function() {
            var res = validate({
                payer: 'a',
                splitters: [],
                amount: 10.5,
                trip: 'tripname'
            }, bill)
            res.valid.should.be.false
            res.errors.should.have.a.lengthOf(1)
            should.exist(_.findWhere(res.errors,{
                code:'ARRAY_LENGTH_SHORT',
                path:'#/splitters'
            }))
        })
    })
})
