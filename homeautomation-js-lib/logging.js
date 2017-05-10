const _ = require('lodash')
var Winston = require('winston')
require('winston-logstash')

var winston = new(Winston.Logger)({
    transports: [
        new(Winston.transports.Console)({ level: 'debug' })
    ]
})

const logstashHost = process.env.LOGSTASH_HOST
const logstashPort = process.env.LOGSTASH_PORT
var name = process.env.name

if (_.isNil(name)) {
    name = process.env.LOGGING_NAME
}

if (_.isNil(name)) {
    name = 'winston'
}

winston.info('Logging enabled for ' + name + '   (logstash sending to: ' + logstashHost + ':' + logstashPort + ')')

module.exports = winston

if (!_.isNil(logstashHost)) {
    winston.add(Winston.transports.Logstash, {
        port: logstashPort,
        node_name: name,
        host: logstashHost
    })

}