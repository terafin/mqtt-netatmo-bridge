const _ = require('lodash')
var Winston = require('winston')
require('winston-splunk-httplogger')

var winston = new(Winston.Logger)({
    transports: [
        new(Winston.transports.Console)({ level: ((disableSyslog === true) ? 'error' : 'info') }),
    ]
})

const disableSyslog = process.env.DISABLE_SYSLOG

var name = process.env.name

if (_.isNil(name)) {
    name = process.env.LOGGING_NAME
}

if (_.isNil(name)) {
    name = 'winston'
}

var splunkSettings = {
    token: process.env.SPLUNK_TOKEN,
    host: process.env.SPLUNK_HOST,
    source: 'home-automation',
    sourcetype: name
}

winston.info('Logging enabled for ' + name + '   (splunk sending to: ' + splunkSettings.host + ':' + splunkSettings.token + ')')

module.exports = winston

if (!_.isNil(splunkSettings.token)) {
    winston.add(Winston.transports.SplunkStreamEvent, { splunk: splunkSettings })
}