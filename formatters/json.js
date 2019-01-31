'use strict'

const r = require('ramda')
const Fmt = require('./fmt')

/**
 * Json formatter
 */
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

    formatHistogram(
        histogram,
        timestamp,
        prependName = false,
        accFunc = r.merge,
        separator = {}
    ) {
        return this.format(
            histogram.name,
            super.formatHistogram(
                histogram,
                timestamp,
                prependName,
                accFunc,
                separator
            )
        )
    }

    export(
        metrics,
        memoryUsage,
        uptime,
        latency,
        timestamp,
        accFunc = r.merge,
        separator = {}
    ) {
        // Timestamp is only used at the
        // root of the json
        return JSON.stringify(
            this.format(
                this.prefix,
                super.export(
                    metrics,
                    memoryUsage,
                    uptime,
                    latency,
                    null,
                    accFunc,
                    separator
                ),
                timestamp
            )
        )
    }
}

module.exports = Json
