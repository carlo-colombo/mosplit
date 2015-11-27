import * as views from '../../lib/views'
import _ from 'lodash'
import should from 'should'
import mocha from 'mocha'

function evalMap(map, entry){
    var emitted = []
    function emit(id,doc){
        emitted.push(arguments)
    }

    eval(`(${map.toString()})(entry)`)

    return emitted
}

describe("views", ()=>{
    describe("double_entry", ()=>{
        it("should emit 2 entry for a bill with a single splitter", ()=>{
            var res = evalMap(views.double_entry,{
                type: 'bill',
                splitters : ['b'],
                payer: 'a',
                amount: 10,
                trip: 'trip'
            })


            res.should.be.lengthOf(2)
            res.should.containDeep([[['trip', 'a'], -10],
                                    [['trip', 'b'],  10]])

            res
                .map(_.property('1'))
                .reduce( (acc,val)=>acc+val  ,0)
                .should.be.eql(0)
        })

        it('should emit n+1 entry for a bill with n splitter', ()=>{
            var emitted = evalMap(views.double_entry,{
                type: 'bill',
                splitters : ['b','c','d'],
                payer: 'a',
                amount: 9,
                trip: 'trip'
            })

            emitted.should.be.lengthOf(4)
            emitted.should.containDeep([[['trip', 'a'],-9],
                                        [['trip', 'b'], 3],
                                        [['trip', 'c'], 3],
                                        [['trip', 'd'], 3]]);

            emitted
                .map(_.property('1'))
                .reduce( (acc,val)=>acc+val  ,0)
                .should.be.eql(0)
        })

        it('should return 2 entry for a payment', ()=>{
            var emitted = evalMap(views.double_entry,{
                type: 'payment',
                source: 'a',
                target: 'b',
                amount: 5,
                trip: 'trip'
            })

            emitted.should.be.lengthOf(2)
            emitted.should.containDeep([[['trip', 'a'], -5],
                                        [['trip', 'b'],  5]])

            emitted
                .map(_.property('1'))
                .reduce( (acc,val)=>acc+val  ,0)
                .should.be.eql(0)
        })

        it('should ignore a bill if has property deleted', ()=>{
            var emitted = evalMap(views.double_entry, {
                deleted: true,
                amount: 10,
                splitters: ['a'],
                payer: 'b',
                type: 'bill'
            })

            emitted.should.have.lengthOf(0)
        })

        it('should ignore a payment if has property deleted', ()=>{
            var emitted = evalMap(views.double_entry, {
                deleted: true,
                amount: 10,
                source: 'a',
                target: 'b',
                type: 'payment'
            })

            emitted.should.have.lengthOf(0)
        })
    })
})
