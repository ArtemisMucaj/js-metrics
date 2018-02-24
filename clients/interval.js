'use strict'

const r = require('ramda')
const Counter = require('../types/counter')
const Histogram = require('../types/histogram')

function operation(type, name, f1, value, f2) {
    if (r.isNil(type) || r.isNil(name) || r.isNil(f1) || r.isNil(f2)) {
        return
    }
    if (!r.isNil(r.path([type, name], this.trackedMetrics))) {
        return this.trackedMetrics[type][name][f1](value)
    }
    let res = this[f2](name)
    return operation.call(this, type, name, f1, value, f2)
}

class Interval {
    constructor() {
        this.__interval = null
        // Store metrics here
        this.trackedMetrics = {}
        // Stats
        this.uptime = 0
        this.latency = 0
        this.memoryUsage = 0
        this.timestamp = Date.now()
    }

    addMetric(name, metric) {
        if (r.isNil(this.trackedMetrics[metric.type])) {
            this.trackedMetrics[metric.type] = {}
        }
        if (r.isNil(this.trackedMetrics[metric.type][name])) {
            this.trackedMetrics[metric.type][name] = metric
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
        return operation.call(
            this,
            'count',
            name,
            'inc',
            value,
            'createCounter'
        )
    }

    dec(name, value = 1) {
        return operation.call(
            this,
            'count',
            name,
            'dec',
            value,
            'createCounter'
        )
    }

    timing(name, value) {
        return operation.call(
            this,
            'histogram',
            name,
            'update',
            value,
            'createHistogram'
        )
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
        let counters = []
        let histograms = []
        let trackedMetrics = this.trackedMetrics
        for (let namespace in trackedMetrics) {
            for (let name in trackedMetrics[namespace]) {
                let metric = trackedMetrics[namespace][name]
                metric.name = name
                let metricType = Object.getPrototypeOf(metric)
                if (metricType === Counter.prototype) {
                    counters.push(metric)
                } else if (metricType == Histogram.prototype) {
                    histograms.push(metric)
                }
            }
        }
        return { counters: counters, histograms: histograms }
    }
}

module.exports = Interval
