const chokidar = require('chokidar')
const jsonfile = require('jsonfile')
const emitter = require('./emitter')

let clients = jsonfile.readFileSync('./data/clients.json')
let template = jsonfile.readFileSync('./data/template.json')

chokidar.watch('./data').on('change', (event, path) => {
  try {
    clients = jsonfile.readFileSync('./data/clients.json')
    template = jsonfile.readFileSync('./data/template.json')
  } catch (e) {
    emitter.emit('warn', e.message)
  }
})

const getClients = () => {
  return clients
}

const getTemplate = () => {
  return template
}

module.exports = {
  getClients,
  getTemplate
}