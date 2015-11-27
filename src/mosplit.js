import _ from 'lodash'
import PouchDB from 'pouchdb'
import {validate, decorate} from './validation'
import * as views from './views'

export default class Mosplit {
    constructor({
        tripsDB   = PouchDB('Mosplit.trips'),
        entriesDB = PouchDB('Mosplit.entries')
    }={}){
        this.tripsDB = tripsDB
        this.entriesDB = entriesDB
    }

    initialize(){
        return this.entriesDB
            .get('_design/entries')
            .then(_.property('_rev'), () => null)
            .then(rev => this.entriesDB.put({
                _id:'_design/entries',
                _rev: rev,
                views:{
                    double_entry: {
                        map: (views.double_entry).toString(),
                        reduce: '_sum'
                    }
                }
            }))
    }



    // @validate('trip')
    create({name, splitters}){
        return this.tripsDB.put({
            _id: name,
            name,
            splitters: _(splitters)
                .map(s => s.trim())
                .filter()
                .unique()
                .value()
        }).then(_.property('id'))
    }

    // @validate('bill')
    addBill(bill){
        return addEntry('bill').call(this, bill)
    }

    // @validate('payment')
    addPayment(payment){
        return addEntry('payment').call(this, payment)
    }

    totals(trip_id){
        return this.entriesDB.query('entries/double_entry', {
            group: true,
            group_level: 2,
            startkey: [trip_id],
            endkey: [trip_id, {}]
        }).then(data => {
            return _.zipObject(_.map(data.rows, row => {
                return [
                    row.key[1],
                    row.value
                ]
            }))
        })
    }

    get(name){
        return this.tripsDB.get(name)
    }

    get trips(){
        return this.tripsDB
            .allDocs({include_docs:true})
            .then(_.property('rows'))
            .then( ret => ret.map(_.property('doc')))

    }
}

decorate(Mosplit.prototype, 'create', validate('trip'))
decorate(Mosplit.prototype, 'addBill', validate('bill'))
decorate(Mosplit.prototype, 'addPayment', validate('payment'))

function addEntry(type){
    return function(entry){
        return this.entriesDB
            .post(_.extend({}, entry, {
                type
            }))
            .then(_.property('id'))
    }
}
