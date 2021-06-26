/**
 * Support for Home Assistant to automatically publish sensor configuration
 * for each data property of a Netatmo Module.
 */
const haSensorConfig = require('./ha-sensor-config.json')
const logging = require('homeautomation-js-lib/logging.js')
const mqtt_helpers = require('homeautomation-js-lib/mqtt_helpers.js')

const homeAssistantDiscoveryPrefix = process.env.HOMEASSISTANT_DISCOVERY_PREFIX || 'homeassistant'
const homeAssistantAutoDiscovery = process.env.HOMEASSISTANT_AUTO_DISCOVERY || false
const mqttStatusTopicPrefix = process.env.MQTT_STATUS_TOPIC_PREFIX || 'status/'
const mqttName = process.env.MQTT_NAME
const topicPrefix = process.env.TOPIC_PREFIX
const retainMessage = true

const normalize = function(s) {
    return s.replace('(','')
        .replace(')','')
        .replace(' ','_')
        .toLowerCase()
}

/** Create the device config for HomeAssitant MQTT Auto Discovery */
const createHADeviceConfig = function(station, module) {
    return {
        identifiers: module._id,
        manufacturer: "Netatmo",
        model: module.type,
        name: `Netatmo ${station.station_name} ${module.module_name}`,
        sw_version: `${module.firmware}`,
        via_device: "mqtt-netatmo-bridge"
    }
}

/** Creates a sensor config for HomeAssistant MQTT Auto Discovery */
const createHASensorConfig = function(station, module, propertyName) {
    return {
        device: createHADeviceConfig(station, module),
        unique_id: `mqtt_netatmo_${normalize(station.station_name)}_${normalize(module.module_name)}_${normalize(propertyName)}`,
        name: `Netatmo ${station.station_name} ${module.module_name} ${haSensorConfig.translations[propertyName.toLowerCase()]}`,
        state_topic: mqtt_helpers.generateTopic(topicPrefix, normalize(station.station_name), module.module_name, propertyName),
        ...(haSensorConfig.unitOfMeasurements[propertyName.toLowerCase()] && { unit_of_measurement: haSensorConfig.unitOfMeasurements[propertyName.toLowerCase()] }),
        ...(haSensorConfig.deviceClasses[propertyName.toLowerCase()] && { device_class: haSensorConfig.deviceClasses[propertyName.toLowerCase()] }),
        ...(haSensorConfig.icons[propertyName.toLowerCase()] && { icon: haSensorConfig.icons[propertyName.toLowerCase()] })
    }
}

/** Publis sensor config for each data property of a module */
const publishSensorConfigsForModule = function(mqttClient, station, module) {
    logging.warn(`Publishing MQTT Discovery configs for module ${module.module_name}`)
    if (module.dashboard_data) {
        propertyNames = Object.getOwnPropertyNames(module.dashboard_data)
        if (module.battery_percent) {
            propertyNames.push('battery')
        }
        if (module.rf_status) {
            propertyNames.push('rf_status')
        }
        if (module.wifi_status) {
            propertyNames.push('wifi_status')
        }

        propertyNames.forEach(pn => {
            const sensorConfig = createHASensorConfig(station, module, pn)
            logging.debug('sensor config:')
            logging.debug(sensorConfig)

            const configTopic = `${homeAssistantDiscoveryPrefix}/sensor/netatmo-bridge/${normalize(station.station_name)}_${normalize(module.module_name)}_${normalize(pn)}/config`
            logging.debug(`config topic: ${configTopic}`)

            mqttClient.smartPublish(configTopic, prettyPrint(sensorConfig), { retain: retainMessage })
        })
    } else {
        logging.warn(`No dashboard_data for this station`)
        logging.warn(`data: ${module}`)
    }
}

const prettyPrint = function(json) {
    return JSON.stringify(json, null, 2)
}

/** 
 * When HomeAssistant MQTT Discovery is enabled, 
 * publish a sensor config for data property
 * using the module as device 
 */
const publishHADiscoveryConfigs = function(mqttClient, station) {
    if (homeAssistantAutoDiscovery) {
        // public config for bridge
        const bridgeConfig = {
            device: {
                identifiers: "mqtt-netatmo-bridge",
                name: "MQTT Netatmo Bridge"
            },
            device_class: "connectivity",
            unique_id: "mqtt_netatmo_bridge",
            name: "MQTT Netatmo Bridge Status",
            state_topic: `${mqttStatusTopicPrefix}${mqttName}`,
            payload_off: "0",
            payload_on: "1"
        }
        const bridgeConfigTopic = `${homeAssistantDiscoveryPrefix}/binary_sensor/netatmo-bridge/netatmo-bridge/config`
        logging.debug(`Publishing bridge sensor config to topic: ${bridgeConfigTopic}`)
        logging.debug(bridgeConfig)
        mqttClient.smartPublish(bridgeConfigTopic, prettyPrint(bridgeConfig), { retain: retainMessage })

        // publis config for station (which is also a module)
        publishSensorConfigsForModule(mqttClient, station, station)

        // public config for any additional modules
        if (station.modules) {
            station.modules.forEach(module => publishSensorConfigsForModule(mqttClient, station, module))
        }
        logging.info("Home Assistant MQTT Discovery configs published.")
    }
}

module.exports = { publishHADiscoveryConfigs, normalize }