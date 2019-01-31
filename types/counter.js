'use strict'

const r = require('ramda')

class Counter {
    constructor() {
        this.count = 0
        this.type = 'count'
    }

    inc(value = 0) {
        if (!r.is(Number, value)) {
            throw new Error('Counter value should be a number')
        }
        if (r.isNil(value)) value = 0
        this.count += parseInt(value)
    }

    dec(value = 0) {
        if (!r.is(Number, value)) {
            throw new Error('Counter value should be a number')
        }
        if (r.isNil(value)) value = 0
        this.count -= parseInt(value)
    }

    clear() {
        this.count = 0
    }

    print() {
        return { type: this.type, count: this.count }
    }
}

module.exports = Counter
