const express = require('express')
const logging = require('./logging.js')

var lastHealthEventDate = null

// HS Web API
var healthCheckPort = 80
var healthCheckTime = 60
var healthCheckURL = '/healthcheck'

exports.healthyEvent = function() {
    lastHealthEventDate = new Date()
    logging.info('healthy event', { event: 'healthy-check', lastHealthEventDate: lastHealthEventDate })
}

exports.unhealthyEvent = function() {
    lastHealthEventDate = null
    logging.error('unhealthy event', { event: 'unhealthy-check', lastHealthEventDate: lastHealthEventDate })
}

exports.startHealthChecks = function(url, port, time) {
    healthCheckPort = port
    healthCheckTime = time
    if (url !== null)
        healthCheckURL = url

    const app = express()

    app.get(healthCheckURL, function(req, res) {
        if (lastHealthEventDate === null) {
            logging.info('health check, but nothing healthy')
            res.send('empty, bad')
            return
        }

        var difference = Date.now() - lastHealthEventDate
        difference /= 1000
        logging.debug('health check time difference: ' + difference)

        if (difference > healthCheckTime) {
            res.sendStatus(501)
        } else {
            res.send('OK difference: ' + difference)
        }
    })

    app.listen(healthCheckPort, function() {
        logging.info('health check listening on port: ', healthCheckPort)
    })
}