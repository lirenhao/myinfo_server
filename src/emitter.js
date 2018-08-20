const events = require('events')
const emitter = new events.EventEmitter()
const logger = require('./logger')

emitter.on('person', data => {
    logger.info(JSON.stringify(data));
})

emitter.on('warn', data => {
    logger.warn(JSON.stringify(data));
})

emitter.on('error', data => {
    logger.error(JSON.stringify(data));
})

module.exports = emitter