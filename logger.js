const log4js = require('log4js')
log4js.configure({
    appenders: {dateLog: {type: 'dateFile', filename: 'out.log'}},
    categories: {default: {appenders: ['dateLog'], level: 'info'}}
})
module.exports = log4js.getLogger()