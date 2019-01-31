'use strict'

const r = require('ramda')
const util = require('util')
const PERCENTILES = [0.25, 0.5, 0.75, 0.95, 0.98, 0.99]

/**
 * Default formatter uses Carbon format
 */
class Fmt {
    constructor(prefix) {
        this.prefix = prefix
    }

    /**
     * Method used to format a generic (name, value, timestamp) 3-uple
     *
     * @return string
     */
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

    /**
     * Method used to format a gauge
     *
     * @return string
     */
    formatGauge(name, value, timestamp) {
        return this.format(name, value, timestamp)
    }

    /**
     * Method used to format a counter
     *
     * @return string
     */
    formatCounter(counter, timestamp) {
        return this.format(counter.name, counter.count, timestamp)
    }

    /**
     * Method used to format an histogram
     *
     * @return string
     */
    formatHistogram(
        histogram,
        timestamp,
        prependName = true,
        accFunc = r.concat,
        separator = ''
    ) {
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
        return r.reduce(
            (ans, list) => {
                const [key, value] = list
                return accFunc(
                    ans,
                    this.format(
                        prependName ? `${name}.${key}` : key,
                        value,
                        timestamp
                    )
                )
            },
            separator,
            input
        )
    }

    /**
     * Method used to export metrics
     *
     * @return string
     */
    export(
        metrics,
        memoryUsage,
        uptime,
        latency,
        timestamp,
        accFunc = r.concat,
        separator = ''
    ) {
        return r.reduce((ans, x) => accFunc(ans, x), separator, [
            this.formatGauge('process.uptime', uptime, timestamp),
            this.formatGauge('process.latency', latency, timestamp),
            this.formatGauge('process.memoryusage', memoryUsage, timestamp),
            r.reduce(
                (ans, x) => accFunc(ans, this.formatHistogram(x, timestamp)),
                separator,
                metrics.histograms
            ),
            r.reduce(
                (ans, x) => accFunc(ans, this.formatCounter(x, timestamp)),
                separator,
                metrics.counters
            )
        ])
    }
}

module.exports = Fmt
