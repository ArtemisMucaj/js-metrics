'use strict'

const r = require('ramda')
const DEFAULT_PERCENTILES = [0.5, 0.75, 0.9, 0.95, 0.98, 0.99]

class Histogram {
    constructor(maxSamples = 128) {
        this.maxSamples = maxSamples
        this.type = 'histogram'
        this.samples = []
        this.sum = 0
        this.max = null
        this.min = null
        this.count = 0
    }

    update(val) {
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

    percentiles(percentiles) {
        if (r.isNil(percentiles)) percentiles = DEFAULT_PERCENTILES
        let values = this.samples
                .map(v => {
                    return parseFloat(v)
                })
                .sort((a, b) => {
                    return a - b
                }),
            scores = {},
            percentile,
            pos,
            lower,
            upper
        for (let i = 0; i < percentiles.length; i++) {
            pos = percentiles[i] * (values.length + 1)
            percentile = percentiles[i]
            if (pos < 1) {
                scores[percentile] = values[0]
            } else if (pos >= values.length) {
                scores[percentile] = values[values.length - 1]
            } else {
                lower = values[Math.floor(pos) - 1]
                upper = values[Math.ceil(pos) - 1]
                scores[percentile] =
                    lower + (pos - Math.floor(pos)) * (upper - lower)
            }
        }

        return scores
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
