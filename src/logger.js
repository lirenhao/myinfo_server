const log4js = require('log4js')
log4js.configure({
    appenders: {
        out: {
            type: 'dateFile',
            filename: 'logs/out.log'
        }
    },
    categories: {
        default: {
            appenders: ['out'],
            level: 'info'
        }
    }
})
module.exports = log4js.getLogger()