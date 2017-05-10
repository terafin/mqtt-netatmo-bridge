const logging = require('./logging.js')
const request = require('request')
const repeat = require('repeat')

var rainforest_ip = null
var rainforest_user = null
var rainforest_pass = null
var client_callback = null

exports.set_ip = function(ip_address) {
    rainforest_ip = ip_address
}

exports.set_user_pass = function(username, password) {
    rainforest_user = username
    rainforest_pass = password
}

exports.set_callback = function(callback) {
    client_callback = callback
    start_monitoring()
}


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
        if (client_callback !== null && client_callback !== undefined) {
            try {
                logging.debug('body:' + body)
                client_callback(body)
            } catch (err) {}
        }
    })
}

function start_monitoring() {
    logging.info('Starting to monitor: ' + rainforest_ip)
    repeat(check_power).every(5, 's').start.in(1, 'sec')
}