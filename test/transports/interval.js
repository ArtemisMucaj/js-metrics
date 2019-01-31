'use strict'

import test from 'ava'

const Interval = require('../../transports/interval')
const Fmt = require('../../formatters/fmt')

test('test Interval class', t => {
    const ans = new Interval()
    const timestamp = Date.now()
    t.is(null, ans.__interval) &&
        t.is(0, ans.uptime) &&
        t.is(0, ans.latency) &&
        t.is(0, ans.memoryUsage) &&
        t.is(timestamp, ans.timestamp) &&
        t.deepEqual({}, this.trackedMetrics)
})

test('test Interval.create(Counter|Histogram) function', t => {
    const ans = new Interval()
    ans.createCounter('req')
    ans.createHistogram('requests')
    t.notDeepEqual({}, ans.trackedMetrics)
    const res = ans.getMetrics()
    t.is(1, res.counters.length) &&
        t.is(1, res.histograms.length) &&
        t.is('req', res.counters[0].name) &&
        t.is('requests', res.histograms[0].name)
})

test('test Interval.(inc|dec) function', t => {
    const ans = new Interval()
    ans.inc('requests-0')
    const res = ans.getMetrics()
    t.is('count', res.counters[0].type) &&
        t.is('requests-0', res.counters[0].name) &&
        t.is(1, res.counters[0].count)
    ans.dec('requests-0')
    t.is(0, res.counters[0].count)
})

test('test Interval.error function', t => {
    const ans = new Interval()
    ans.error()
    const res = ans.getMetrics()
    t.is('count', res.counters[0].type) &&
        t.is('error', res.counters[0].name) &&
        t.is(1, res.counters[0].count)
})

test('test Interval.timing function', t => {
    const ans = new Interval()
    ans.timing('requests-0')
    const res = ans.getMetrics()
    t.is('histogram', res.histograms[0].type) &&
        t.is('requests-0', res.histograms[0].name) &&
        t.is(1, res.histograms[0].count)
})

test('test Interval.report function', t => {
    const ans = new Interval()
    t.throws(() => ans.report())
})

test.cb('test Interval.export function', t => {
    const fmt = new Fmt('stats')
    const ans = new Interval(fmt)
    setTimeout(() => {
        ans.export()
        t.not(0, ans.memoryUsage) && t.no(0, ans.latency)
        t.end()
    }, 250)
})
