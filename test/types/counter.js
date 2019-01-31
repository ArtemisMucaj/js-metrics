'use strict'

import test from 'ava'

const Counter = require('../../types/counter')

test('test Counter object', t => {
    const ans = new Counter()
    t.is(0, ans.count) && t.is('count', ans.type)
    t.throws(() => ans.inc(null))
    t.is(0, ans.count)
    ans.inc(10)
    t.is(10, ans.count)
    t.throws(() => ans.dec(null))
    t.is(10, ans.count)
    ans.dec(1)
    t.is(9, ans.count)
    ans.clear()
    t.is(0, ans.count)
    t.deepEqual({ type: 'count', count: 0 }, ans.print())
})
