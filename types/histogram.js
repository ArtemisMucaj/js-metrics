'use strict'

const r = require('ramda')
const DEFAULT_PERCENTILES = [0.5, 0.75, 0.9, 0.95, 0.98, 0.99]

class Histogram {
    constructor(maxSamples = 128) {
        // Part of the signal can be lost
        // when using a constant maxSamples
        this.maxSamples = maxSamples
        this.type = 'histogram'
        this.samples = []
        this.sum = 0
        this.max = null
        this.min = null
        this.count = 0
    }

    update(val = 0) {
        if (!r.is(Number, val)) {
            throw new Error('Histogram value should be a number')
        }
        this.count++
        if (r.isNil(this.max)) {
            this.max = val
        } else {
            this.max = val > this.max ? val : this.max
        }
        if (r.isNil(this.min)) {
            this.min = val
        } else {
            this.min = val < this.min ? val : this.min
        }

        if (this.samples.length >= this.maxSamples) {
            this.sum -= this.samples.shift()
        }
        this.samples.push(val)
        this.sum += val
    }

    percentiles(percentiles = DEFAULT_PERCENTILES) {
        const samples = r.pipe(r.map(parseFloat), r.sort((a, b) => a - b))(
            this.samples
        )
        return r.zipObj(
            percentiles,
            r.map(x => {
                const position = x * (samples.length + 1)
                if (position < 1) {
                    return r.head(samples)
                } else if (position >= samples.length) {
                    return r.last(samples)
                } else {
                    const lower = samples[Math.floor(position) - 1]
                    const upper = samples[Math.ceil(position) - 1]
                    return (
                        lower +
                        (position - Math.floor(position)) * (upper - lower)
                    )
                }
            }, percentiles)
        )
    }

    mean() {
        return this.sum == 0 || this.samples.length == 0
            ? null
            : this.sum / this.samples.length
    }

    print() {
        return {
            type: 'histogram',
            min: this.min,
            max: this.max,
            mean: this.mean(),
            count: this.count
        }
    }
}

module.exports = Histogram
