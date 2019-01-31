'use strict'

const r = require('ramda')
const dgram = require('dgram')
const Interval = require('./interval')

class Udp extends Interval {
    constructor(fmt, host, port = 9003) {
        super()
        this.fmt = fmt
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
        // Compute memory usage, uptime ...
        this.compute()
        // Report metrics
        const metrics = this.getMetrics()
        const timestamp = new Date().getTime() / 1000
        this.send(
            r.reduce((ans, x) => ans + x, '', [
                this.fmt.formatGauge('process.uptime', this.uptime, timestamp),
                this.fmt.formatGauge(
                    'process.latency',
                    this.latency,
                    timestamp
                ),
                this.fmt.formatGauge(
                    'process.memoryusage',
                    this.memoryUsage,
                    timestamp
                ),
                r.reduce(
                    (ans, x) => ans + this.fmt.formatHistogram(x, timestamp),
                    '',
                    metrics.histograms
                ),
                r.reduce(
                    (ans, x) => ans + this.fmt.formatCounter(x, timestamp),
                    '',
                    metrics.counters
                )
            ])
        )
    }

    send(message) {
        if (r.isNil(message)) {
            return null
        }
        message = new Buffer(message)
        this.__socket.send(message, 0, message.length, this.port, this.host)
    }
}

module.exports = Udp
