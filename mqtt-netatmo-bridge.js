// Requirements
const mqtt = require('mqtt')
const netatmo = require('netatmo')
const repeat = require('repeat')
const _ = require('lodash')
const logging = require('homeautomation-js-lib/logging.js')
const mqtt_helpers = require('homeautomation-js-lib/mqtt_helpers.js')

const health = require('homeautomation-js-lib/health.js')


// Config
const webhook_url = process.env.WEBHOOK_URL
const webhook_port = process.env.WEBHOOK_PORT
const netatmo_user = process.env.NETATMO_USER
const netatmo_pass = process.env.NETATMO_PASS
const netatmo_client_id = process.env.NETATMO_CLIENT_ID
const netatmo_client_secret = process.env.NETATMO_CLIENT_SECRET
const topicPrefix = process.env.NETATMO_TOPIC

// Setup MQTT
const client = mqtt_helpers.setupClient(null, null)

const isInterestingDataPoint = function(inName) {
	const dataPointName = inName.toLowerCase()
	if (dataPointName === 'rain') {
		return dataPointName
	}
	if (dataPointName === 'temperature') {
		return dataPointName 
	}
	if (dataPointName === 'humidity') { 
		return dataPointName
	}
	if (dataPointName === 'windangle') { 
		return 'wind_angle' 
	}
	if (dataPointName === 'windstrength') {
		return 'wind_strength' 
	}
	if (dataPointName === 'gustangle') { 
		return 'gust_angle'
	}
	if (dataPointName === 'guststrength') {
		return 'gust_strength'
	}
	if (dataPointName === 'co2') { 
		return dataPointName
	}
	if (dataPointName === 'temp_trend') { 
		return dataPointName 
	}
	if (dataPointName === 'pressure') {
		return dataPointName 
	}
	if (dataPointName === 'pressure_trend') {
		return dataPointName 
	}
	if (dataPointName === 'noise') { 
		return dataPointName 
	}
	if (dataPointName === 'absolutepressure') { 
		return 'absolute_pressure'
	}

	return null
}

var auth = {
	'client_id': netatmo_client_id,
	'client_secret': netatmo_client_secret,
	'username': netatmo_user,
	'password': netatmo_pass,
}

var api = null


reconnect()

const reconnect = function() {
	logging.info('connecting')
	api = new netatmo(auth)
}


api.on('error', function(error) {
	// When the "error" event is emitted, this is called
	logging.error('Netatmo threw an error: ' + error)
	health.unhealthyEvent()
	reconnect()
})

api.on('warning', function(error) {
	// When the "warning" event is emitted, this is called
	logging.log('Netatmo threw a warning: ' + error)
	health.unhealthyEvent()
	reconnect()
})

var getStationsData = function(err, devices) {
	if ( _.isNil(err) ) {
		health.healthyEvent()
		logging.info('loaded station data')
	} else {
		health.unhealthyEvent()
		logging.error('unable to get stations data: ' + err)
		return
	}

	logging.info(devices)
	const station = devices[0]
	const foundModules = station.modules

	processModule(station)

	if (_.isNil(foundModules)) {
		logging.error('no modules found: ' + stations)
		return
	}

	foundModules.forEach(function(module) {
		processModule(module)
	}, this)
}

var getMeasure = function(err, measure) {
	console.log(measure.length)
	console.log(measure[0])
}

var getThermostatsData = function(err, devices) {
	console.log(devices)
}

var setSyncSchedule = function(err, status) {
	console.log(status)
}

var setThermpoint = function(err, status) {
	console.log(status)
}

var getHomeData = function(err, data) {
	console.log(data)
}

var handleEvents = function(err, data) {
	console.log(data.events_list)
}

// Get Home Data
// https://dev.netatmo.com/dev/resources/technical/reference/cameras/gethomedata
api.getHomeData()

// // Get Next Events
// // See docs: https://dev.netatmo.com/dev/resources/technical/reference/cameras/getnextevents
// var options = {
//     home_id: '5a1a38b9b26ddfafc58bf1df',
//     event_id: ''
// };

// api.getNextEvents(options);

// // Get Last Event Of
// // See docs: https://dev.netatmo.com/dev/resources/technical/reference/cameras/getlasteventof
// var options = {
//     home_id: '5a1a38b9b26ddfafc58bf1df',
//     person_id: ''
// };

// api.getLastEventOf(options);

// // Get Events Until
// // See docs: https://dev.netatmo.com/dev/resources/technical/reference/cameras/geteventsuntil
// var options = {
//     home_id: '5a1a38b9b26ddfafc58bf1df',
//     event_id: '',
// };

// api.getEventsUntil(options);

// // Get Camera Picture
// // See docs: https://dev.netatmo.com/dev/resources/technical/reference/cameras/getcamerapicture
// var options = {
//     image_id: '',
//     key: ''
// };

// api.getCameraPicture(options);


// Event Listeners
api.on('get-stationsdata', getStationsData)
api.on('get-measure', getMeasure)
api.on('get-thermostatsdata', getThermostatsData)
api.on('set-syncschedule', setSyncSchedule)
api.on('set-thermpoint', setThermpoint)
api.on('get-homedata', getHomeData)
api.on('get-nextevents', handleEvents)
api.on('get-lasteventof', handleEvents)
api.on('get-eventsuntil', handleEvents)



const processModule = function(module) {
	const name = module.module_name
	const data = module.dashboard_data
	logging.info('Looking at module: ' + name)
	health.healthyEvent()

	const batteryPercent = module.battery_percent
	if (batteryPercent !== undefined) {
		const batteryTopic = [topicPrefix, 'battery', name].join('/')
		client.smartPublish('' + batteryTopic, '' + batteryPercent, {retain: true})
	}

	if (_.isNil(data)) { 
		return 
	}

	Object.keys(data).forEach(function(dataKey) {
		const publishKey = isInterestingDataPoint(dataKey)
		if (!_.isNil(publishKey)) {
			const value = data[dataKey]
			const topicToPublish = [topicPrefix, publishKey, name].join('/')

			client.smartPublish('' + topicToPublish, '' + value, {retain: true})
		}
	}, this)
}

const pollData = function() {
	logging.info('Polling for new info')

	api.getStationsData(getStationsData)
}

const refreshToken = function() {
	logging.info('Refreshing login token')
	api = new netatmo(auth)
}

const startMonitoring = function() {
	logging.info('Starting netatmo <-> MQTT')
	repeat(pollData).every(30, 's').start.in(1, 'sec')
	repeat(refreshToken).every(25, 'm').start.in(30, 'sec')
}

startMonitoring()


const express = require('express')

const app = express()

app.get(webhook_url, function(req, res) {
	console.log('request: ' + JSON.stringify(Object.keys(req)))
	console.log('url: ' + JSON.stringify(req.url))
	console.log('headers: ' + JSON.stringify(req.headers))
	res.send('all is well, thanks netatmo')
})

app.put(webhook_url, function(req, res) {
	console.log('request: ' + JSON.stringify(Object.keys(req)))
	console.log('url: ' + JSON.stringify(req.url))
	console.log('headers: ' + JSON.stringify(req.headers))
	res.send('all is well, thanks netatmo')
})

app.listen(webhook_port, function() {
	console.log('webhook listening on port: ', webhook_port)
})
