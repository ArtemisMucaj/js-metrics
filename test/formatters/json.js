'use strict'

import test from 'ava'

const Json = require('../../formatters/json')

test('test Json class', t => {
    const fmt = new Json('stats.tests')
    const ans = fmt.format('requests', 10, 0)
    t.deepEqual({ requests: 10, timestamp: 0 }, ans)
})
