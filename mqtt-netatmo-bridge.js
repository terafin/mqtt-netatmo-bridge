// Requirements
const mqtt = require('mqtt')
const logging = require('./homeautomation-js-lib/logging.js')


// Config
const host = process.env.MQTT_HOST
const netatmo_user = process.env.NETATMO_USER
const netatmo_pass = process.env.NETATMO_PASS
const topic_prefix = process.env.TOPIC_PREFIX

// Set up modules
logging.set_enabled(true)

// Setup MQTT
const client = mqtt.connect(host)

// MQTT Observation

client.on('connect', () => {
    logging.log('Connected')
    client.subscribe('#')
})

client.on('disconnect', () => {
    logging.log('Disconnected, reconnecting')
    client.connect(host)
})

client.on('message', (topic, message) => {

})