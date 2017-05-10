const mqtt = require('mqtt')
const logging = require('./logging.js')
const _ = require('lodash')


var publish_map = {}

function fix_name(str) {
    str = str.replace(/[+\\\&\*\%\$\#\@\!]/g, '')
    str = str.replace(/\s/g, '_').trim().toLowerCase()
    str = str.replace(/__/g, '_')
    return str
}

if (mqtt.MqttClient.prototype.smartPublish == null) mqtt.MqttClient.prototype.smartPublish = function(topic, message) {
    if (topic === null) {
        logging.error('empty client or topic passed into mqtt_helpers.publish')
        return
    }
    topic = fix_name(topic)

    logging.info(' ' + topic + ':' + message)
    if (publish_map[topic] !== message) {
        publish_map[topic] = message
        logging.debug(' => published!')
        this.publish(topic, message)
    } else {
        logging.debug(' * not published')
    }
}

const host = process.env.MQTT_HOST
const mqttUsername = process.env.MQTT_USER
const mqttPassword = process.env.MQTT_PASS

if (mqtt.setupClient == null) mqtt.setupClient = function(connectedCallback, disconnectedCallback) {
    if (_.isNil(host)) {
        logging.warn('MQTT_HOST not set, aborting')
        process.abort()
    }

    var mqtt_options = {}
    if (!_.isNil(mqttUsername))
        mqtt_options.username = mqttUsername
    if (!_.isNil(mqttPassword))
        mqtt_options.password = mqttPassword

    const client = mqtt.connect(host, mqtt_options)

    // MQTT Observation

    client.on('connect', () => {
        logging.info('MQTT Connected')
        if (!_.isNil(connectedCallback))
            connectedCallback()
    })

    client.on('disconnect', () => {
        logging.error('MQTT Disconnected, reconnecting')
        client.connect(host)

        if (!_.isNil(disconnectedCallback))
            disconnectedCallback()
    })

    return client
}