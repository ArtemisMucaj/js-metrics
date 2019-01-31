'use strict'

const r = require('ramda')
const dgram = require('dgram')
const Interval = require('./interval')

class Udp extends Interval {
    constructor(fmt, host, port = 9003) {
        super(fmt)
        this.host = host
        this.port = port
    }

    start(t) {
        this.__socket = dgram.createSocket('udp4')
        super.start(t)
    }

    stop() {
        super.stop()
        this.__socket.close()
    }

    send(message) {
        if (r.isNil(message)) {
            return null
        }
        message = new Buffer(message)
        this.__socket.send(message, 0, message.length, this.port, this.host)
    }
}

module.exports = Udp
