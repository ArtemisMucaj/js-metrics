'use strict'

const Udp = require('./clients/udp')

const METRICS = Symbol.for('Nodejs.Metrics')
function getMetrics(prefix, host, port) {
    const globalSymbols = Object.getOwnPropertySymbols(global)
    const hasMetrics = globalSymbols.indexOf(METRICS) > -1
    if (!hasMetrics) {
        global[METRICS] = new Udp(prefix, host, port)
        global[METRICS] = Object.freeze(global[METRICS])
    }
    return global[METRICS]
}

module.exports = getMetrics
