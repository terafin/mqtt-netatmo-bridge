// Requirements
const mqtt = require('mqtt')
const netatmo = require('netatmo')
const repeat = require('repeat')
const logging = require('./homeautomation-js-lib/logging.js')
const mqtt_helpers = require('./homeautomation-js-lib/mqtt_helpers.js')


// Config
const host = process.env.MQTT_HOST
const netatmo_user = process.env.NETATMO_USER
const netatmo_pass = process.env.NETATMO_PASS
const netatmo_client_id = process.env.NETATMO_CLIENT_ID
const netatmo_client_secret = process.env.NETATMO_CLIENT_SECRET
const topicPrefix = process.env.NETATMO_TOPIC

// Set up modules
logging.set_enabled(true)

// Setup MQTT
const client = mqtt.connect(host)

// MQTT Observation

client.on('connect', () => {
    logging.log('Connected')
})

client.on('disconnect', () => {
    logging.log('Disconnected, reconnecting')
    client.connect(host)
})

function isInterestingDataPoint(inName) {
    const dataPointName = inName.toLowerCase()
    if (dataPointName === 'rain') return dataPointName
    if (dataPointName === 'temperature') return dataPointName
    if (dataPointName === 'humidity') return dataPointName
    if (dataPointName === 'windangle') return 'wind_angle'
    if (dataPointName === 'windstrength') return 'wind_strength'
    if (dataPointName === 'gustangle') return 'gust_angle'
    if (dataPointName === 'guststrength') return 'gust_strength'
    if (dataPointName === 'co2') return dataPointName
    if (dataPointName === 'temp_trend') return dataPointName
    if (dataPointName === 'pressure') return dataPointName
    if (dataPointName === 'pressure_trend') return dataPointName
    if (dataPointName === 'noise') return dataPointName
    if (dataPointName === 'absolutepressure') return 'absolute_pressure'

    return null
}


var auth = {
    'client_id': netatmo_client_id,
    'client_secret': netatmo_client_secret,
    'username': netatmo_user,
    'password': netatmo_pass,
}

var api = new netatmo(auth)


function processModule(module) {
    const name = module.module_name
    const data = module.dashboard_data
    logging.log('Looking at module: ' + name)

    const batteryPercent = module.battery_percent
    if (batteryPercent !== undefined) {
        const batteryTopic = [topicPrefix, 'battery', name].join('/')
        mqtt_helpers.publish(client, '' + batteryTopic, '' + batteryPercent)
    }

    if (data === null || data === undefined) return

    Object.keys(data).forEach(function(dataKey) {
        const publishKey = isInterestingDataPoint(dataKey)
        if (publishKey !== null) {
            const value = data[dataKey]
            const topicToPublish = [topicPrefix, publishKey, name].join('/')

            mqtt_helpers.publish(client, '' + topicToPublish, '' + value)
        }
    }, this)
}
var stationResponse = function(err, devices) {
    logging.log(devices)
    const station = devices[0]
    const foundModules = station.modules

    processModule(station)

    if (foundModules === null || foundModules === undefined) return

    foundModules.forEach(function(module) {
        processModule(module)
    }, this)

}

function pollData() {
    logging.log('Polling for new info')

    api.getStationsData(null, stationResponse)
}

function refreshToken() {
    logging.log('Refreshing login token')
    api = new netatmo(auth)
}

function startMonitoring() {
    logging.log('Starting netatmo <-> MQTT')
    repeat(pollData).every(30, 's').start.in(1, 'sec')
    repeat(refreshToken).every(30, 'm').start.in(30, 'sec')
}

startMonitoring()