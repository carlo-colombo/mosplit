import {property, filter, uniq, map, extend, fromPairs} from 'lodash'
import PouchDB from 'pouchdb'
import {validate} from './validation'
import * as views from './views'
import {trip, payment, bill} from './schema'

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
            .then(property('_rev'), () => null)
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

    @validate(trip)
    create({name, splitters}){
        const splittersList = uniq(filter(map(splitters, s => s.trim())))
        return this.tripsDB.put({
            _id: name,
            name,
            splitters: splittersList
        }).then(property('id'))
    }

    @validate(bill)
    addBill(bill){
        return addEntry('bill').call(this, bill)
    }

    @validate(payment)
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
            console.log(data)
            return fromPairs(map(data.rows, row => [row.key[1], row.value]))
        })
    }

    get(name){
        return this.tripsDB.get(name)
    }

    get trips(){
        return this.tripsDB
            .allDocs({include_docs:true})
            .then(property('rows'))
            .then( ret => ret.map(property('doc')))

    }
}

function addEntry(type){
    return function(entry){
        return this.entriesDB
            .post({
                ...entry,
                type
            })
            .then(property('id'))
    }
}
