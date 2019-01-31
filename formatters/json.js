'use strict'

const r = require('ramda')
const Fmt = require('./fmt')
const PERCENTILES = [0.25, 0.5, 0.75, 0.95, 0.98, 0.99]

class Json extends Fmt {
    format(name, value, timestamp) {
        if (r.isNil(value)) {
            return null
        }
        const res = {
            [name]: value
        }
        if (!r.isNil(timestamp)) {
            res.timestamp = parseInt(timestamp)
        }
        return res
    }

    formatHistogram(histogram, timestamp) {
        const name = histogram.name
        const percentiles = histogram.percentiles(PERCENTILES)
        const input = r.concat(
            r.zip(
                ['count', 'mean', 'min', 'max'],
                [
                    histogram.count,
                    histogram.mean(),
                    histogram.min,
                    histogram.max
                ]
            ),
            r.zip(
                r.map(x => `p${x * 100}`, PERCENTILES),
                r.map(x => percentiles[x], PERCENTILES)
            )
        )
        return this.format(
            name,
            r.reduce(
                (ans, list) => {
                    const [key, value] = list
                    return r.merge(ans, this.format(key, value))
                },
                {},
                input
            )
        )
    }

    export(
        metrics,
        memoryUsage,
        uptime,
        latency,
        timestamp,
        accumulateFn = r.merge,
        separator = {}
    ) {
        return JSON.stringify(
            this.format(
                this.prefix,
                super.export(
                    metrics,
                    memoryUsage,
                    uptime,
                    latency,
                    null,
                    accumulateFn,
                    separator
                ),
                // Only use timestamp here
                timestamp
            )
        )
    }
}

module.exports = Json
