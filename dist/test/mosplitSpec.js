'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _mosplit = require('../lib/mosplit');

var _pouchdb = require('pouchdb');

var _pouchdb2 = _interopRequireDefault(_pouchdb);

var _mocha = require('mocha');

var _mocha2 = _interopRequireDefault(_mocha);

var _should = require('should');

var _should2 = _interopRequireDefault(_should);

var _validation = require('../lib/validation');

var _validation2 = _interopRequireDefault(_validation);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ms = undefined,
    entriesDB = undefined,
    tripsDB = undefined,
    dboptions = undefined;

if (typeof window != 'undefined' && window.document) {
    dboptions = {};
} else {
    dboptions = { db: require('memdown') };
}

describe('Mosplit', function () {
    it('should instantiate without any parameter', function () {
        new _mosplit.Mosplit().should.be.ok;
    });

    beforeEach(function (done) {
        var dbSuffix = _pouchdb2.default.utils.uuid();

        Promise.all([new _pouchdb2.default('CashSplitter.trips' + dbSuffix, dboptions), new _pouchdb2.default('CashSplitter.entries' + dbSuffix, dboptions)]).then(function (_ref) {
            var _ref2 = _slicedToArray(_ref, 2);

            var trips = _ref2[0];
            var entries = _ref2[1];

            tripsDB = trips;
            entriesDB = entries;

            ms = new _mosplit.Mosplit({
                tripsDB: trips,
                entriesDB: entries
            });
            return ms.initialize().catch(function (err) {
                return log.error(err);
            });
        }).then(function () {
            return done();
        }).catch(done);
    });

    it('check globals', function () {
        ms.should.be.ok;
        entriesDB.should.be.ok;
        tripsDB.should.be.ok;
    });

    describe('#create', function () {
        it('should create a trip in tripsDB with name ', function () {
            return ms.create({ name: 'testTrip',
                splitters: ['a', 'b'] }).then(function () {
                return tripsDB.get('testTrip');
            }).then(function (_ref3) {
                var name = _ref3.name;
                var splitters = _ref3.splitters;

                name.should.be.eql('testTrip');
                splitters.should.have.lengthOf(2);
            });
        });

        it('should fail to create trip with an empty name', function (done) {
            return ms.create({ name: '',
                splitters: ['a'] }).then(done, function (err) {
                _should2.default.exist(err);
                done();
            });
        });

        it('should fail to create a trip with no splitters', function (done) {
            return ms.create({ name: 'testTrip',
                splitters: [] }).then(done).catch(function (err) {
                _should2.default.exist(err);
                done();
            });
        });

        it('should remove duplicates from splitters ', function () {
            return ms.create({ name: 'testTrip',
                splitters: ['a', 'b', 'a'] }).then(function () {
                return tripsDB.get('testTrip');
            }).then(function (_ref4) {
                var splitters = _ref4.splitters;

                splitters.should.have.a.lengthOf(2);
                splitters.should.containEql('a');
                splitters.should.containEql('b');
            });
        });

        it('should filter out empty splitters', function () {
            return ms.create({
                name: 'testTrip',
                splitters: ['', 'a', ' ']
            }).then(function () {
                return tripsDB.get('testTrip');
            }).then(function (_ref5) {
                var splitters = _ref5.splitters;

                splitters.should.have.a.lengthOf(1);
                splitters.should.containEql('a');
                splitters.should.not.containEql('');
                splitters.should.not.containEql(' ');
            });
        });

        it('should allow multiple creation of the same view', function () {
            var options = {
                entriesDB: new _pouchdb2.default('CashSplitter.entries_t1', dboptions),
                tripsDB: new _pouchdb2.default('CashSplitter.trips_t1', dboptions)
            },
                ms1 = new _mosplit.Mosplit(options),
                ms2 = new _mosplit.Mosplit(options);

            return ms1.initialize().then(function () {
                return ms2.initialize();
            });
        });

        it('should reject a trip wich name is already existing', function (done) {
            ms.create({ name: 'test', splitters: ['a'] }).then(function (_) {
                return ms.create({ name: 'test', splitters: ['a'] });
            }).then(done).catch(function (_) {
                return done();
            });
        });
    });

    afterEach(function (done) {
        return Promise.all([tripsDB.destroy(), entriesDB.destroy()]).then(function () {
            done();
        });
    });

    describe('#addBill', function () {
        it('should accept a bill and save in the entriesDB and return the id', function () {
            return ms.addBill({
                trip: 'testTrip',
                amount: 1,
                splitters: ['a', 'b'],
                payer: 'a'
            }).then(function (id) {
                return entriesDB.get(id);
            });
        });

        it('should reject if trip is not defined', function (done) {
            return ms.addBill({
                amount: 1,
                splitters: ['a', 'b'],
                payer: 'a'
            }).then(done).catch(function (err) {
                _should2.default.exist(err);
                done();
            });
        });

        it('should reject if payer is not defined', function (done) {
            return ms.addBill({
                trip: 'a',
                amount: 1,
                splitters: ['a', 'b']
            }).then(done).catch(function (err) {
                _should2.default.exist(err);
                done();
            });
        });
    });

    describe('#addPayment', function () {
        it('should accept a payment and save in entriesDB and return the id', function () {
            return ms.addPayment({
                amount: 10,
                source: 'a',
                target: 'b',
                trip: 'trip'
            }).then(function (id) {
                return entriesDB.get(id);
            });
        });
    });

    describe('#totals', function () {
        it('should split a single entry equally between 2 splitters', function (done) {
            ms.addBill({
                trip: 'trip',
                amount: 10,
                splitters: ['a', 'b'],
                payer: 'a'
            }).then(function () {
                return ms.totals('trip').then(function (data) {
                    _should2.default.exist(data);
                    data.b.should.be.eql(5);
                    data.a.should.be.eql(-5);
                    done();
                }).catch(done);
            });
        });

        it('should return 0 for a two simmetric entries', function () {
            var entry = {
                trip: 'trip',
                amount: 10,
                splitters: ['a', 'b'],
                payer: 'a'
            };
            return ms.addBill(entry).then(function () {
                entry.payer = 'b';
                return ms.addBill(entry);
            }).then(function () {
                return ms.totals('trip');
            }).then(function (data) {
                _should2.default.exist(data);
                data.b.should.be.eql(0);
                data.a.should.be.eql(0);
            });
        });

        it('should get the right calculation for if a third payer pays for other 2 splitters', function () {
            return ms.addBill({
                trip: 'trip',
                amount: 10,
                splitters: ['a', 'b'],
                payer: 'c'
            }).then(function () {
                return ms.totals('trip').then(function (data) {
                    _should2.default.exist(data);
                    data.a.should.be.eql(5);
                    data.b.should.be.eql(5);
                    data.c.should.be.eql(-10);
                });
            });
        });

        it('should take account of payments', function (done) {
            ms.addBill({
                trip: 'trip',
                amount: 10,
                splitters: ['a', 'b'],
                payer: 'a'
            }).then(function () {
                return ms.addPayment({
                    source: 'b',
                    target: 'a',
                    amount: 5,
                    trip: 'trip'
                });
            }).then(function () {
                return ms.totals('trip');
            }).then(function (data) {
                _should2.default.exist(data);
                data.a.should.be.eql(0);
                data.b.should.be.eql(0);
                done();
            }).catch(done);
        });
    });

    describe('#get', function () {
        beforeEach(function (done) {
            ms.create({ name: 'testTrip', splitters: ['a', 'b'] }).then(function () {
                return done();
            });
        });

        it('should return a trip from the db', function () {
            return ms.get('testTrip').then(function (trip) {
                trip.should.be.ok;
                trip._id.should.be.eql('testTrip');
                trip.name.should.be.eql('testTrip');
                trip.splitters.should.containEql('a');
                trip.splitters.should.containEql('b');
            });
        });

        it('should reject a non existing trip name', function (done) {
            return ms.get('notestTrip').then(done).catch(function () {
                return done();
            });
        });
    });

    describe('trips', function () {
        it('should return an empty array if no trip has benn added', function () {
            return ms.trips.then(function (trips) {
                trips.should.be.instanceOf.Array;
                trips.should.be.lengthOf(0);
            });
        });

        it('should return an array of valid trips', function () {
            return ms.create({ name: 'test', splitters: ['a', 'b'] }).then(function () {
                return ms.trips;
            }).then(function (trips) {
                trips.should.be.instanceOf.Array;
                trips.should.be.lengthOf(1);
                (0, _validation2.default)(trips[0], 'trip').valid.should.be.ok;
            });
        });

        it('should return an array of trip sorted by name', function () {
            return Promise.all([ms.create({ name: 'testE', splitters: ['a'] }), ms.create({ name: 'testB', splitters: ['a'] }), ms.create({ name: 'testA', splitters: ['a'] })]).then(function (_) {
                return ms.trips;
            }).then(function (trips) {
                trips.should.be.lengthOf(3);
                trips[0].name.should.be.eql('testA');
                trips[1].name.should.be.eql('testB');
                trips[2].name.should.be.eql('testE');
            });
        });
    });
});