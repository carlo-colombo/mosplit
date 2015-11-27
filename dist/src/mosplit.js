'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Mosplit = undefined;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _pouchdb = require('pouchdb');

var _pouchdb2 = _interopRequireDefault(_pouchdb);

var _validation = require('./validation');

var _views = require('./views');

var views = _interopRequireWildcard(_views);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Mosplit = exports.Mosplit = (function () {
    function Mosplit() {
        var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        var _ref$tripsDB = _ref.tripsDB;
        var tripsDB = _ref$tripsDB === undefined ? (0, _pouchdb2.default)('Mosplit.trips') : _ref$tripsDB;
        var _ref$entriesDB = _ref.entriesDB;
        var entriesDB = _ref$entriesDB === undefined ? (0, _pouchdb2.default)('Mosplit.entries') : _ref$entriesDB;

        _classCallCheck(this, Mosplit);

        this.tripsDB = tripsDB;
        this.entriesDB = entriesDB;
    }

    _createClass(Mosplit, [{
        key: 'initialize',
        value: function initialize() {
            var _this = this;

            return this.entriesDB.get('_design/entries').then(_lodash2.default.property('_rev'), function () {
                return null;
            }).then(function (rev) {
                return _this.entriesDB.put({
                    _id: '_design/entries',
                    _rev: rev,
                    views: {
                        double_entry: {
                            map: views.double_entry.toString(),
                            reduce: '_sum'
                        }
                    }
                });
            });
        }

        // @validate('trip')

    }, {
        key: 'create',
        value: function create(_ref2) {
            var name = _ref2.name;
            var splitters = _ref2.splitters;

            return this.tripsDB.put({
                _id: name,
                name: name,
                splitters: (0, _lodash2.default)(splitters).map(function (s) {
                    return s.trim();
                }).filter().unique().value()
            }).then(_lodash2.default.property('id'));
        }

        // @validate('bill')

    }, {
        key: 'addBill',
        value: function addBill(bill) {
            return addEntry('bill').call(this, bill);
        }

        // @validate('payment')

    }, {
        key: 'addPayment',
        value: function addPayment(payment) {
            return addEntry('payment').call(this, payment);
        }
    }, {
        key: 'totals',
        value: function totals(trip_id) {
            return this.entriesDB.query('entries/double_entry', {
                group: true,
                group_level: 2,
                startkey: [trip_id],
                endkey: [trip_id, {}]
            }).then(function (data) {
                return _lodash2.default.zipObject(_lodash2.default.map(data.rows, function splitterAndValue(row) {
                    return [row.key[1], row.value];
                }));
            });
        }
    }, {
        key: 'get',
        value: function get(name) {
            return this.tripsDB.get(name);
        }
    }, {
        key: 'trips',
        get: function get() {
            return this.tripsDB.allDocs({ include_docs: true }).then(_lodash2.default.property('rows')).then(function (ret) {
                return ret.map(_lodash2.default.property('doc'));
            });
        }
    }]);

    return Mosplit;
})();

(0, _validation.decorate)(Mosplit.prototype, 'create', (0, _validation.validate)('trip'));
(0, _validation.decorate)(Mosplit.prototype, 'addBill', (0, _validation.validate)('bill'));
(0, _validation.decorate)(Mosplit.prototype, 'addPayment', (0, _validation.validate)('payment'));

function addEntry(type) {
    return function (entry) {
        return this.entriesDB.post(_lodash2.default.extend({}, entry, {
            type: type
        })).then(_lodash2.default.property('id'));
    };
}