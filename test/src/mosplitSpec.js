import Mosplit from '../../lib/mosplit'
import PouchDB from 'pouchdb'
import mocha from 'mocha'
import should from 'should'
import validateFun from '../../lib/validation'

let  ms, entriesDB, tripsDB, dboptions;

if((typeof window != 'undefined' && window.document)){
    dboptions = {}
}else{
    dboptions = { db: require('memdown')}
}

describe('Mosplit', ()=>{
    it('should instantiate without any parameter', ()=>{
        new Mosplit().should.be.ok
    })

    beforeEach((done)=>{
        var dbSuffix = PouchDB.utils.uuid()

        Promise.all([
            new PouchDB('CashSplitter.trips'   + dbSuffix, dboptions),
            new PouchDB('CashSplitter.entries' + dbSuffix, dboptions)
        ]).then(([trips,entries])=>{
            tripsDB = trips
            entriesDB = entries

            ms = new Mosplit({
                tripsDB: trips,
                entriesDB: entries
            })
            return ms.initialize().catch((err)=>log.error(err))
        }).then(()=> done()).catch(done)
    })

    it('check globals',()=>{
        ms.should.be.ok
        entriesDB.should.be.ok
        tripsDB.should.be.ok
    })

    describe('#create',()=>{
        it('should create a trip in tripsDB with name ', ()=>{
            return ms.create({name:'testTrip',
                              splitters:['a', 'b']})
                .then(()=>{
                    return tripsDB.get('testTrip')
                })
                .then(({name, splitters}) => {
                    name.should.be.eql('testTrip')
                    splitters.should.have.lengthOf(2)
                })
        })

        it('should fail to create trip with an empty name', done =>{
            return ms.create({name:'',
                              splitters:['a']})
                .then(done, err => {
                    should.exist(err)
                    done()
                })
        })

        it('should fail to create a trip with no splitters', (done) => {
            return ms
                .create({name:'testTrip',
                         splitters:[] })
                .then(done)
                .catch(function(err) {
                    should.exist(err)
                    done()
                })
        })

        it('should remove duplicates from splitters ', ()=> {
            return ms
                .create({name:'testTrip',
                         splitters:['a', 'b', 'a']})
                .then(function() {
                    return tripsDB.get('testTrip')
                })
                .then(function({splitters}) {
                    splitters.should.have.a.lengthOf(2)
                    splitters.should.containEql('a')
                    splitters.should.containEql('b')
                })
        })

        it('should filter out empty splitters', () => {
            return ms
                .create({
                    name: 'testTrip',
                    splitters:['', 'a', ' ']
                })
                .then(() => tripsDB.get('testTrip'))
                .then(({splitters}) => {
                    splitters.should.have.a.lengthOf(1)
                    splitters.should.containEql('a')
                    splitters.should.not.containEql('')
                    splitters.should.not.containEql(' ')
                })
        })

        it('should allow multiple creation of the same view', ()=>{
            var options = {
                entriesDB : new PouchDB('CashSplitter.entries_t1' , dboptions ),
                tripsDB   : new PouchDB('CashSplitter.trips_t1'   , dboptions )
            },
                ms1 = new Mosplit(options),
                ms2 = new Mosplit(options)

            return ms1.initialize()
                .then(() => ms2.initialize())
        })

        it('should reject a trip wich name is already existing',done =>{
            ms
                .create({name:'test', splitters:['a']})
                .then(_ => ms.create({name:'test', splitters:['a']}) )
                .then(done)
                .catch(_ => done())
        })
    })

    afterEach((done)=>{
        return Promise.all([
            tripsDB.destroy(),
            entriesDB.destroy()
        ]).then(function(){
            done()
        })
    })

    describe('#addBill', function() {
        it('should accept a bill and save in the entriesDB and return the id', function() {
            return ms.addBill({
                trip: 'testTrip',
                amount: 1,
                splitters: ['a', 'b'],
                payer: 'a'
            }).then(function(id) {
                return entriesDB.get(id);
            })

        })

        it('should reject if trip is not defined', function(done) {
            return ms.addBill({
                amount: 1,
                splitters: ['a', 'b'],
                payer: 'a'
            }).then(done)
                .catch(function(err) {
                    should.exist(err)
                    done()
                })
        })

        it('should reject if payer is not defined', function(done) {
            return ms.addBill({
                trip: 'a',
                amount: 1,
                splitters: ['a', 'b']
            })
                .then(done)
                .catch(function(err) {
                    should.exist(err)
                    done()
                })
        })
    })

    describe('#addPayment', function() {
        it('should accept a payment and save in entriesDB and return the id', function() {
            return ms.addPayment({
                amount: 10,
                source: 'a',
                target: 'b',
                trip: 'trip'
            }).then(function(id) {
                return entriesDB.get(id)
            })
        })
    })

    describe('#totals', function() {
        it('should split a single entry equally between 2 splitters', function(done) {
            ms.addBill({
                trip: 'trip',
                amount: 10,
                splitters: ['a', 'b'],
                payer: 'a'
            }).then(function() {
                return ms
                    .totals('trip')
                    .then(function(data) {
                        should.exist(data)
                        data.b.should.be.eql(5)
                        data.a.should.be.eql(-5)
                        done()
                    })
                    .catch(done)
            })
        })

        it('should return 0 for a two simmetric entries', function() {
            var entry = {
                trip: 'trip',
                amount: 10,
                splitters: ['a', 'b'],
                payer: 'a'
            };
            return ms.addBill(entry)
                .then(function() {
                    entry.payer = 'b'
                    return ms.addBill(entry)
                })
                .then(()=> ms .totals('trip'))
                .then(data => {
                    should.exist(data)
                    data.b.should.be.eql(0)
                    data.a.should.be.eql(0)
                })
        })

        it('should get the right calculation for if a third payer pays for other 2 splitters', function() {
            return ms.addBill({
                trip: 'trip',
                amount: 10,
                splitters: ['a', 'b'],
                payer: 'c'
            }).then(function() {
                return ms
                    .totals('trip')
                    .then(function(data) {
                        should.exist(data)
                        data.a.should.be.eql(5)
                        data.b.should.be.eql(5)
                        data.c.should.be.eql(-10)
                    })
            })
        })

        it('should take account of payments', function(done) {
            ms.addBill({
                trip: 'trip',
                amount: 10,
                splitters: ['a', 'b'],
                payer: 'a'
            }).then(function() {
                return ms.addPayment({
                    source: 'b',
                    target: 'a',
                    amount: 5,
                    trip: 'trip'
                })
            }).then(function() {
                return ms.totals('trip')
            }).then(function(data) {
                should.exist(data)
                data.a.should.be.eql(0)
                data.b.should.be.eql(0)
                done()
            }).catch(done)
        })
    })

    describe('#get', ()=>{
        beforeEach(done => {
            ms.create({name:'testTrip', splitters: ['a', 'b']})
                .then( () => done())
        })

        it('should return a trip from the db', ()=>{
            return ms.get('testTrip')
                .then(trip => {
                    trip.should.be.ok
                    trip._id.should.be.eql('testTrip')
                    trip.name.should.be.eql('testTrip')
                    trip.splitters.should.containEql('a')
                    trip.splitters.should.containEql('b')
                })
        })

        it('should reject a non existing trip name', (done)=>{
            return ms.get('notestTrip')
                .then(done)
                .catch(()=>done())
        })
    })

    describe('trips', () =>{
        it('should return an empty array if no trip has benn added', ()=>{
            return ms.trips.then(trips => {
                trips.should.be.instanceOf.Array
                trips.should.be.lengthOf(0)
            })
        })

        it('should return an array of valid trips', () =>{
            return ms.create({name:'test', splitters:['a','b']})
                .then(() => ms.trips)
                .then(trips => {
                    trips.should.be.instanceOf.Array
                    trips.should.be.lengthOf(1)
                    validateFun(trips[0],'trip').valid.should.be.ok
                })
        })

        it('should return an array of trip sorted by name', ()=>{
            return Promise.all([
                ms.create({name:'testE', splitters:['a']}),
                ms.create({name:'testB', splitters:['a']}),
                ms.create({name:'testA', splitters:['a']})
            ])
                .then( _ => ms.trips)
                .then( trips => {
                    trips.should.be.lengthOf(3)
                    trips[0].name.should.be.eql('testA')
                    trips[1].name.should.be.eql('testB')
                    trips[2].name.should.be.eql('testE')
                })
        })
    })
})
