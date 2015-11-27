'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.double_entry = double_entry;
function double_entry(entry) {
    if (entry.deleted) return;
    if (entry.type == 'bill') {
        var length = entry.splitters.length;
        emit([entry.trip, entry.payer], -parseFloat(entry.amount));
        entry.splitters.forEach(function (splitter, i) {
            emit([entry.trip, splitter], parseFloat(entry.amount / length));
        });
    }
    if (entry.type == 'payment') {
        emit([entry.trip, entry.source], -parseFloat(entry.amount));
        emit([entry.trip, entry.target], +parseFloat(entry.amount));
    }
}