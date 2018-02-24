'use strict'

import test from 'ava'

const Histogram = require('../../types/histogram')

test('test Histogram class', t => {
    const ans = new Histogram()
    t.is(0, ans.count) &&
        t.is('histogram', ans.type) &&
        t.is(0, ans.sum) &&
        t.is(null, ans.max) &&
        t.is(null, ans.min)
})

test('test Histogram.update function', t => {
    const ans = new Histogram(3)
    t.is(3, ans.maxSamples)
    ans.update(110)
    t.is(1, ans.count) &&
        t.is(110, ans.sum) &&
        t.deepEqual([110], ans.samples) &&
        t.is(110, ans.max) &&
        t.is(110, ans.min)

    ans.update(250)
    t.is(2, ans.count) &&
        t.is(360, ans.sum) &&
        t.deepEqual([110, 250], ans.samples) &&
        t.is(250, ans.max) &&
        t.is(110, ans.min)

    ans.update(300)
    ans.update(450)
    t.is(4, ans.count) &&
        t.deepEqual([250, 300, 450], ans.samples) &&
        t.is(450, ans.max) &&
        t.is(110, ans.min) &&
        t.is(1000, ans.sum)
})

test('test Histogram.percentiles function', t => {
    const ans = new Histogram(16)
    const inputs = [
        250,
        250,
        250,
        1000,
        1000,
        1200,
        2500,
        2600,
        2650,
        3000,
        4500,
        4700,
        4900,
        5000,
        5000,
        5500
    ]
    inputs.map(x => ans.update(x))
    t.is(16, ans.count)
    t.deepEqual(
        {
            '0.5': 2625,
            '0.75': 4850,
            '0.9': 5150,
            '0.95': 5500,
            '0.98': 5500,
            '0.99': 5500
        },
        ans.percentiles()
    )
})

test('test Histogram.mean function', t => {
    const ans = new Histogram()
    t.is(null, ans.mean())
    ans.update(250)
    ans.update(1000)
    t.is(625, ans.mean())
})

test('test Histogram.print function', t => {
    const ans = new Histogram()
    ans.update(1)
    t.deepEqual(
        {
            type: 'histogram',
            min: 1,
            max: 1,
            mean: 1,
            count: 1
        },
        ans.print()
    )
})
