const logging = require('./logging.js')
const mqtt = require('mqtt')
const request = require('request')

const curb_user = 's1dfl7jbxov5pth1rxzsc0fl480zz6rwg4uo6bu0gzu1t89393csjwps6g5lsgcx'
const curb_pass = '8dpdzm2a6mcyg3xocfqvfrajfin6yajjdoqmhj77ynvksmyaqw6rpvppn5srde6d'

var energy_curb_token = null
var energy_curb_user_id = null

var energy_curb_oauth_url = 'https://app.energycurb.com/oauth2/token'
var energy_curb_api_url = 'https://app.energycurb.com/api'
var energy_curb_profile_base_url = 'https://app.energycurb.com' // + msg.profile_link

var energy_curb_user = null
var energy_curb_pass = null

var client_callback = null

exports.set_user_pass = function(username, password) {
    energy_curb_user = username
    energy_curb_pass = password
}

exports.set_client_callback = function(callback) {
    client_callback = callback
    send_oauth_request(function(user_id, token) {
        if (token !== null) {
            get_profiles(profile_response)
        } else {
            logging.error('failed to get oauth token')
        }
    })
}

function send_oauth_request(callback) {
    logging.log('oauth request url: ' + energy_curb_oauth_url)

    request.post(energy_curb_oauth_url, { form: { grant_type: 'password', username: energy_curb_user, password: energy_curb_pass }, json: true },
        //request.post({ url: energy_curb_oauth_url, json: true },
        //request.post(energy_curb_oauth_url, { body: "grant_type=password&username=" + energy_curb_user + "&password=" + energy_curb_pass },
        function(err, httpResponse, body) {
            logging.info('error:' + err)
            logging.info('httpResponse:' + httpResponse)
            logging.info('body:' + body)

            energy_curb_user_id = body.user_id
            energy_curb_token = body.access_token

            if (callback !== null && callback !== undefined) {
                callback(err, energy_curb_user_id, energy_curb_token)
            }
        }).auth(curb_user, curb_pass, true)
}

function send_energy_curb_api_request(in_url, callback) {
    logging.info('api request url: ' + in_url)
    base64Token = new Buffer(energy_curb_token).toString('base64')

    request.get({ url: in_url, json: true },
        function(err, httpResponse, body) {
            logging.info('url:' + in_url)
            logging.info('error:' + err)
            logging.info('httpResponse:' + httpResponse)
            logging.info('body:' + body)
            logging.info('energy_curb_token:' + energy_curb_token)
            logging.info('base64Token:' + base64Token)

            if (callback !== null && callback !== undefined) {
                callback(err, body)
            }
        }).auth(null, null, true, base64Token)
}

mqtt_clients = []

function subscribe_to_mqtt(new_items, name_map) {
    if (mqtt_clients !== undefined && mqtt_clients !== null) {
        mqtt_clients.forEach(function(mqtt_info) {
            mqtt_info.client.unsubscribe()
        }, this)
    }
    mqtt_clients = []


    logging.info('subscribing to new MQTT info')

    // iterate and create mqtt clients
    new_items.forEach(function(mqtt_info) {
        logging.info('  host: ' + mqtt_info.host + '    topic: ' + mqtt_info.topic)

        // Setup MQTT
        mqtt_info.client = mqtt.connect(mqtt_info.host)

        // MQTT Observation

        mqtt_info.client.on('connect', () => {
            logging.info('connecting: ' + mqtt_info.host)
            mqtt_info.client.subscribe(mqtt_info.topic)
        })

        mqtt_info.client.on('disconnect', () => {
            logging.error('re-connecting: ' + mqtt_info.host)
            mqtt_info.client.connect(mqtt_info.host)
        })

        mqtt_info.client.on('message', (topic, message) => {
            logging.info(' ' + topic + ':' + message)
            json = JSON.parse(message)
            measurements = json.measurements

            Object.keys(measurements).forEach(function(measurement) {
                var lookup_id = mqtt_info.prefix + ':' + measurement
                var found = name_map[lookup_id]
                var value = Number('' + measurements[measurement])
                if (value < 0) value *= -1
                logging.log('measurement: ' + found.label + '   value: ' + value)
                new_topic = topic_prefix + '/' + found.label
                client_callback(new_topic, '' + value)
            }, this)

        })

        mqtt_clients.push(mqtt_info)
    }, this)

}

function get_profiles(callback) {
    send_energy_curb_api_request(energy_curb_api_url, callback)
}

function get_profile_info(profile_link, callback) {
    send_energy_curb_api_request(energy_curb_profile_base_url + profile_link, callback)
}

function profile_info_response(err, response) {
    if (response !== null) {
        logging.info('profile_info_response: ' + Object.keys(response))
        embedded = response._embedded
        profile = embedded.profiles[0]
        registers = profile._embedded.registers.registers
        name = profile.display_name
        real_time = profile.real_time

        new_items = []
        name_map = {}

        registers.forEach(function(register) {
            name_map[register.id] = register
        }, this)

        real_time.forEach(function(panel) {
            var mqtt_item = {}
            mqtt_item.topic = panel.topic
            mqtt_item.prefix = panel.prefix
            mqtt_item.host = panel._links.ws.href

            new_items.push(mqtt_item)
        }, this)

        subscribe_to_mqtt(new_items, name_map)
    } else {
        logging.error('failed to get info_response')
    }
}

function profile_response(err, response) {
    if (response !== null && response !== undefined) {
        logging.info('profile_response: ' + Object.keys(response))
        logging.info('response._links.profiles.href: ' + response._links.profiles.href)
        get_profile_info(response._links.profiles.href, profile_info_response)
    } else {
        logging.error('failed to get profile_response')
    }
}