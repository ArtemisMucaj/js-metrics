'use strict'

const r = require('ramda')
const util = require('util')
const Fmt = require('./fmt')
const PERCENTILES = [0.25, 0.5, 0.75, 0.95, 0.98, 0.99]

class Influx extends Fmt {
    format(name, value, timestamp) {
        if (r.isNil(value)) {
            return null
        }
        return util.format(
            '%s.%s %s %s\n',
            this.prefix,
            name,
            value,
            parseInt(timestamp)
        )
    }

    formatHistogram(histogram, timestamp) {
        const name = histogram.name
        const percentiles = histogram.percentiles(PERCENTILES)
        const input = r.concat(
            r.zip(r.map(x => `${name}.${x}`, ['count', 'mean', 'min', 'max']), [
                histogram.count,
                histogram.mean(),
                histogram.min,
                histogram.max
            ]),
            r.zip(
                r.map(x => `${name}.p${x * 100}`, PERCENTILES),
                r.map(x => percentiles[x], PERCENTILES)
            )
        )
        return r.reduce(
            (ans, list) => {
                const [key, value] = list
                return ans.concat(this.format(key, value, timestamp))
            },
            '',
            input
        )
    }
}

module.exports = Influx
