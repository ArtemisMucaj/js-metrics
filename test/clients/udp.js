'use strict'

import test from 'ava'
const Udp = require('../../clients/udp')

const MSGS = []
class UdpTest extends Udp {
    start() {}
    stop() {}

    send(message) {
        MSGS.push(message)
        return
    }
}

test('test Udp class', t => {
    const ans = new UdpTest('stats.tests', 'localhost')
    t.is('stats.tests', ans.prefix) &&
        t.is('localhost', ans.host) &&
        t.is(9003, ans.port) &&
        t.deepEqual({}, this.trackedMetrics)
    ans.error()
    ans.inc('requests-0')
    ans.timing('requests-1', 1000)
    ans.report()
    const m = MSGS.shift()
        .split('\n')
        .filter(x => x != '')
    t.is(15, m.length) &&
        t.regex(m[0], /stats.tests.process.uptime 0 [0-9]+/) &&
        t.regex(m[1], /stats.tests.process.latency [0-9]+ [0-9]+/) &&
        t.regex(m[2], /stats.tests.process.memoryusage [0-9]+ [0-9]+/) &&
        t.regex(m[3], /stats.tests.requests-1.count 1 [0-9]+/) &&
        t.regex(m[4], /stats.tests.requests-1.mean 1000 [0-9]+/) &&
        t.regex(m[5], /stats.tests.requests-1.min 1000 [0-9]+/) &&
        t.regex(m[6], /stats.tests.requests-1.max 1000 [0-9]+/) &&
        t.regex(m[7], /stats.tests.requests-1.p25 1000 [0-9]+/) &&
        t.regex(m[8], /stats.tests.requests-1.p50 1000 [0-9]+/) &&
        t.regex(m[9], /stats.tests.requests-1.p75 1000 [0-9]+/) &&
        t.regex(m[10], /stats.tests.requests-1.p95 1000 [0-9]+/) &&
        t.regex(m[11], /stats.tests.requests-1.p98 1000 [0-9]+/) &&
        t.regex(m[12], /stats.tests.requests-1.p99 1000 [0-9]+/) &&
        t.regex(m[13], /stats.tests.error 1 [0-9]+/) &&
        t.regex(m[14], /stats.tests.requests-0 1 [0-9]+/)
})
