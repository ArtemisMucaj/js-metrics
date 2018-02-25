'use strict'

const r = require('ramda')
const util = require('util')
const dgram = require('dgram')
const Interval = require('./interval')

const PERCENTILES = [0.25, 0.5, 0.75, 0.95, 0.98, 0.99]

class Udp extends Interval {
    constructor(prefix, host, port = 9003) {
        super()
        this.prefix = prefix
        this.host = host
        this.port = port
    }

    start(t) {
        this.__socket = dgram.createSocket('udp4')
        super.start(t)
    }

    stop() {
        super.stop()
        this.__socket.close()
    }

    report() {
        super.report()
        const metrics = this.getMetrics()
        const timestamp = new Date().getTime() / 1000
        this.send(
            r.reduce((ans, x) => ans + x, '', [
                this.reportUptime(this.uptime, timestamp),
                this.reportLatency(this.latency, timestamp),
                this.reportMemoryUsage(this.memoryUsage, timestamp),
                r.reduce(
                    (ans, x) => ans + this.reportHistogram(x, timestamp),
                    '',
                    metrics.histograms
                ),
                r.reduce(
                    (ans, x) => ans + this.reportCounter(x, timestamp),
                    '',
                    metrics.counters
                )
            ])
        )
    }

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

    send(message) {
        if (r.isNil(message)) {
            return null
        }
        message = new Buffer(message)
        this.__socket.send(message, 0, message.length, this.port, this.host)
    }

    reportUptime(value, timestamp) {
        return this.format('process.uptime', value, timestamp)
    }

    reportMemoryUsage(rss, timestamp) {
        return this.format('process.memoryusage', rss, timestamp)
    }

    reportLatency(latency, timestamp) {
        return this.format('process.latency', latency, timestamp)
    }

    reportCounter(counter, timestamp) {
        return this.format(counter.name, counter.count, timestamp)
    }

    reportHistogram(histogram, timestamp) {
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
                return ans + this.format(key, value, timestamp)
            },
            '',
            input
        )
    }
}

module.exports = Udp
