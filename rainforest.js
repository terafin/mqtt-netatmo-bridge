logging = require('./logging.js')
request = require('request');
repeat = require('repeat');
current_speed = null

rainforest_ip = null
rainforest_user = null
rainforest_pass = null
client_callback = null

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
    rainforest_url = "http://" + rainforest_ip + "/cgi-bin/cgi_manager"
    body_payload = "<LocalCommand><Name>get_usage_data</Name><MacId>0xd8d5b90000009e89</MacId></LocalCommand>"

    logging.log('request url: ' + rainforest_url)

    request.post({ url: rainforest_url, body: body_payload, json: true },
        function(err, httpResponse, body) {
            logging.log("error:" + err);
            logging.log("httpResponse:" + httpResponse);
            logging.log("body:" + body);
            if (callback !== null && callback !== undefined) {
                callback(err, body)
            }
        }).auth(rainforest_user, rainforest_pass, true);
}

function check_power() {
    logging.log("Checking power...")

    send_request(function(error, body) {
        if (client_callback !== null && client_callback !== undefined) {
            try {
                logging.log("body:" + body);
                client_callback(body)
            } catch (err) {}
        }
    })
}

function start_monitoring() {
    logging.log("Starting to monitor: " + rainforest_ip)
    repeat(check_power).every(5, 's').start.in(1, 'sec');
}

function speed_up() {
    logging.log("... upping speed")
    send_request(null)
}