'use strict'

const db = require('../db.js')

const changeWorkTime = require('../use-cases/restaurant config/change_time.js')
const restikcfg = db('restikcfg');


module.exports = {
    async 'change-time' (args) {
        return changeWorkTime(args)
    }
}
