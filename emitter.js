const events = require('events')
const emitter = new events.EventEmitter()

emitter.on('person', data => {
  console.log('person', JSON.stringify(data));
})

module.exports = emitter