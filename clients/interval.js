'use strict'

const r = require('ramda')
const Counter = require('../types/counter')
const Histogram = require('../types/histogram')

class Interval {
    constructor() {
        this.__interval = null
        this.trackedMetrics = new Map()
        this.uptime = 0
        this.latency = 0
        this.memoryUsage = 0
        this.timestamp = Date.now()
    }

    addMetric(name, metric) {
        if (!this.trackedMetrics.has(name) && !r.isNil(metric)) {
            this.trackedMetrics.set(name, metric)
        }
    }

    createCounter(name) {
        const metric = new Counter()
        if (!r.isNil(name)) {
            this.addMetric(name, metric)
        }
        return metric
    }

    createHistogram(name) {
        const metric = new Histogram()
        if (!r.isNil(name)) {
            this.addMetric(name, metric)
        }
        return metric
    }

    start(t = 30000) {
        if (r.isNil(this.__interval)) {
            this.__interval = setInterval(this.report.bind(this), t)
        }
    }

    stop() {
        if (!r.isNil(this.__interval)) {
            clearInterval(this.__interval)
        }
    }

    error() {
        this.inc('error', 1)
    }

    inc(name, value = 1) {
        if (this.trackedMetrics.has(name)) {
            return this.trackedMetrics.get(name).inc(value)
        }
        this.createCounter(name)
        return this.inc(name, value)
    }

    dec(name, value = 1) {
        if (this.trackedMetrics.has(name)) {
            return this.trackedMetrics.get(name).dec(value)
        }
        this.createCounter(name)
        return this.dec(name, value)
    }

    timing(name, value) {
        if (this.trackedMetrics.has(name)) {
            return this.trackedMetrics.get(name).update(value)
        }
        this.createHistogram(name)
        return this.timing(name, value)
    }

    report() {
        const now = Date.now()
        this.latency = now - this.timestamp
        if (!r.isNil(r.prop('_idleTimeout', this.__interval))) {
            this.latency -= this.__interval._idleTimeout
        }
        if (this.latency < 0) this.latency = 0
        this.timestamp = now
        // Note: process.memoryUsage().rss is given in bytes;
        // we divide it by 2^20 to get MB
        this.memoryUsage = parseInt(process.memoryUsage().rss / 1048576)
        this.uptime = parseInt(process.uptime())
    }

    getMetrics() {
        return r.reduce(
            (ans, list) => {
                const [name, metric] = list
                metric.name = name
                if (r.is(Histogram, metric)) {
                    ans.histograms.push(metric)
                }
                if (r.is(Counter, metric)) {
                    ans.counters.push(metric)
                }
                return ans
            },
            {
                counters: [],
                histograms: []
            },
            this.trackedMetrics
        )
    }
}

module.exports = Interval
