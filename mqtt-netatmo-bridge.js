// Requirements
const mqtt = require('mqtt')
const netatmo = require('netatmo')
const repeat = require('repeat')
const _ = require('lodash')
const logging = require('./homeautomation-js-lib/logging.js')
require('./homeautomation-js-lib/mqtt_helpers.js')


// Config
const netatmo_user = process.env.NETATMO_USER
const netatmo_pass = process.env.NETATMO_PASS
const netatmo_client_id = process.env.NETATMO_CLIENT_ID
const netatmo_client_secret = process.env.NETATMO_CLIENT_SECRET
const topicPrefix = process.env.NETATMO_TOPIC

// Setup MQTT
const client = mqtt.setupClient(null, null)

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
    logging.info('Looking at module: ' + name)

    const batteryPercent = module.battery_percent
    if (batteryPercent !== undefined) {
        const batteryTopic = [topicPrefix, 'battery', name].join('/')
        client.smartPublish('' + batteryTopic, '' + batteryPercent)
    }

    if (_.isNil(data)) return

    Object.keys(data).forEach(function(dataKey) {
        const publishKey = isInterestingDataPoint(dataKey)
        if (!_.isNil(publishKey)) {
            const value = data[dataKey]
            const topicToPublish = [topicPrefix, publishKey, name].join('/')

            client.smartPublish('' + topicToPublish, '' + value)
        }
    }, this)
}
var stationResponse = function(err, devices) {
    logging.info(devices)
    const station = devices[0]
    const foundModules = station.modules

    processModule(station)

    if (_.isNil(foundModules)) return

    foundModules.forEach(function(module) {
        processModule(module)
    }, this)

}

function pollData() {
    logging.info('Polling for new info')

    api.getStationsData(null, stationResponse)
}

function refreshToken() {
    logging.info('Refreshing login token')
    api = new netatmo(auth)
}

function startMonitoring() {
    logging.info('Starting netatmo <-> MQTT')
    repeat(pollData).every(30, 's').start.in(1, 'sec')
    repeat(refreshToken).every(30, 'm').start.in(30, 'sec')
}

startMonitoring()