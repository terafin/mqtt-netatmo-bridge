logging = require('./logging.js')
request = require('request');
repeat = require('repeat');
xml_parser = require('xml2js');
current_speed = null

airscape_ip = null
client_callback = null

exports.set_ip = function(ip_address) {
    airscape_ip = ip_address
}

exports.set_callback = function(callback) {
    client_callback = callback
    start_monitoring()
}

exports.off = function() {
    send_airscape_request(4, null)
}

exports.set_speed = function(target_speed) {
    logging.log("Targeting speed: " + target_speed)
    if (current_speed == target_speed) {
        logging.log("Same speed, bailing")
        return;
    }
    current_speed = target_speed

    this.off()

    if (target_speed == 0) {
        return
    }

    repeat(speed_up).every(5, 's').times(target_speed).start.in(2, 'sec');
}

function send_airscape_request(command, callback) {
    airscape_url = "http://" + airscape_ip + "/fanspd.cgi"

    if (command != null) {
        airscape_url = airscape_url + "?dir=" + command
    }

    logging.log('request url: ' + airscape_url)
    request(airscape_url, function(error, response, body) {
        if ((error !== null && error !== undefined)) {
            logging.log("error:" + error);
            logging.log("response:" + response);
            logging.log("body:" + body);
        }

        if (callback !== null && callback !== undefined) {
            callback(error, body)
        }
    });
}

function check_fan() {
    logging.log("Checking fan...")

    send_airscape_request(null, function(error, body) {
        if (client_callback !== null && client_callback !== undefined) {
            body_list = null, fixed_lines = null, fixed_body = null

            try {
                body_list = body.split("\n")
                fixed_lines = body_list.map(function(line) {
                    return line.substr(line.indexOf('<'));
                });
                fixed_body = fixed_lines.join("\n")
                fixed_body = '<?xml version="1.0" encoding="utf-8"?>\n<root>\n' + fixed_body + "</root>"
            } catch (err) {
                logging.warn("error: " + err)
            }

            logging.log("fixed_body: " + fixed_body)
            xml_parser.parseString(fixed_body, { trim: true, normalize: true, normalizeTags: true }, function(err, result) {
                try {
                    logging.log("result: " + Object.keys(result))
                    callback_value = (result != null && result.root != undefined) ? result.root : null
                    if (callback_value != null && result.root != undefined)
                        current_speed = result.root.fanspd
                    client_callback(callback_value)
                } catch (err) {
                    logging.warn("callback error: " + err)
                }
            });
        }
    })
}

function start_monitoring() {
    logging.log("Starting to monitor: " + airscape_ip)
    repeat(check_fan).every(5, 's').start.in(1, 'sec');
}

function speed_up() {
    logging.log("... upping speed")
    send_airscape_request(1, null)
}