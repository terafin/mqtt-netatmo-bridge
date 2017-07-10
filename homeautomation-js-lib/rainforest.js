const logging = require('./logging.js')
const request = require('request')
const repeat = require('repeat')
const EventEmitter = require('events')
const _ = require('lodash')

const rainforest_ip = process.env.RAINFOREST_IP
const rainforest_user = process.env.RAINFOREST_USER
const rainforest_pass = process.env.RAINFOREST_PASSWORD

module.exports = new EventEmitter()

function send_request(callback) {
    var rainforest_url = 'http://' + rainforest_ip + '/cgi-bin/cgi_manager'
    var body_payload = '<LocalCommand><Name>get_usage_data</Name><MacId>0xd8d5b90000009e89</MacId></LocalCommand>'

    logging.info('request url: ' + rainforest_url)

    request.post({ url: rainforest_url, body: body_payload, json: true },
        function(err, httpResponse, body) {
            logging.info('error:' + err)
            logging.info('httpResponse:' + httpResponse)
            logging.info('body:' + body)
            if (callback !== null && callback !== undefined) {
                callback(err, body)
            }
        }).auth(rainforest_user, rainforest_pass, true)
}

function check_power() {
    logging.info('Checking power...')

    send_request(function(error, body) {
        module.exports.emit('energy-updated', body)

    })
}

function startMonitoring() {
    logging.info('Starting to monitor: ' + rainforest_ip)
    repeat(check_power).every(5, 's').start.in(1, 'sec')
}

startMonitoring()