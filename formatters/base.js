'use strict'

const r = require('ramda')

class Base {
    constructor(prefix) {
        this.prefix = prefix
    }

    format(name, value, timestamp) {
        throw new Error('Should implement format method')
    }

    formatGauge(name, value, timestamp) {
        return this.format(name, value, timestamp)
    }

    formatCounter(counter, timestamp) {
        return this.format(counter.name, counter.count, timestamp)
    }

    /**
     * Method used to format an histogram
     *
     * @return string
     */
    formatHistogram(histogram, timestamp) {
        throw new Error('Should implement formatHistogram method')
    }

    /**
     * Method used to export metrics
     *
     * @return string
     */
    export(metrics, memoryUsage, uptime, latency, timestamp, separator = '') {
        return r.reduce((ans, x) => ans.concat(x), separator, [
            this.formatGauge('process.uptime', uptime, timestamp),
            this.formatGauge('process.latency', latency, timestamp),
            this.formatGauge('process.memoryusage', memoryUsage, timestamp),
            r.reduce(
                (ans, x) => ans.concat(this.formatHistogram(x, timestamp)),
                separator,
                metrics.histograms
            ),
            r.reduce(
                (ans, x) => ans.concat(this.formatCounter(x, timestamp)),
                separator,
                metrics.counters
            )
        ])
    }
}

module.exports = Base
