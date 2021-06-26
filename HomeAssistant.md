# Integration with HomeAssistant

Enabling the HomeAssistant MQTT Discovery feature publishes a sensor config
for each data entry so the entries are automatically discovered by Home Assistant.
The Netatmo Module is used as the 'Device' for the sensors, so the sensor are grouped in Home Assistant per module.

A separate sensor is created for the MQTT-Netatmo-Bridge itself so the online/offline status of this bridge can be monitored in Home Assistant as well.

## Entity names

In the HA Netatmo Integration, an entity friendly_name constists of: 'Netatmo <station_name> <module_name> <data_name>'.
E.g.: 'Netatmo MyStation MyModule CO2'

Via the config, a similar naming convention is used.

## MQTT Auto discovery config

This config for a sensor seems to work and creates an entity identical to the ones created by the Netatmo integration.

```
{
	"device": {
		"identifiers": "<uuid>",
		"manufacturer": "Netatmo",
		"model": "NAMain",
		"name": "Beneden",
		"via_device": "netatmo-mqtt-bridge"
	},
	"device_class": "temperature",
	"unique_id": "mqtt_netatmo_cocklaantje_beneden_temperature",
	"name": "MQTT Netatmo Cocklaantje Beneden Temperature",
	"state_topic": "/netatmo/cocklaantje/beneden/temperature",
	"unit_of_measurement": "°C"
}
```

- device: based on module
    - identifier: module._id
    - manufacturer: 'Netatmo'
    - model: module.type
    - name: 'Netatmo \<station-name> \<module-name>'
	- sw_version: module.firmware
    - via_device: "mqtt-netatmo-bridge"
- device_class: [depends on data property. See Modules above.]
- unique_id: "mqtt_netatmo_\<station-name-normalized>\_\<module-name-normalized>\_\<property>"
- name: "Netatmo \<station-name> \<module-name> \<property>"
- state_topic: [generate based on station, module, property]
- unit_of_measurement: [depends on data property. See Modules above.]

Publish config to topic:
    homeassistant/sensor/netatmo/\<station-name-normalized>\_\<module_name_normalized>\_\<property>/config

## Bridge sensor

A separate binary sensor is added to monitor the mqtt-netatmo-bridge state in Home Asistant.
On startup, the bridge publishes a '1' to the status topic.
Whenever the bridge stops, a '0' is published to the status topic.

The status topic is: `MQTT_STATUS_TOPIC_PREFIX`/`MQTT_NAME`.  
Default value for `MQTT_STATUS_TOPIC_PREFIX` is `status/`.

Sensor config:
```
{
	"device": {
		"identifiers": "mqtt-netatmo-bridge",
		"name": "MQTT Netatmo Bridge"
	},
	"device_class": "connectivity",
	"unique_id": "mqtt_netatmo_bridge",
	"name": "MQTT Netatmo Bridge Status",
	"state_topic": "/`MQTT_STATUS_TOPIC_PREFIX`/netatmo_bridge",
	"payload_off": "0",
	"payload_on": "1"
}
```

# Netatmo Modules

In Home Assistant, each module is represented as a device with multiple sensor entities.
Here an overview of (Weather Station) modules, the available properties and the 'unit_of_measurement', 'device_class' and/or 'icon' to be used in the HA config.

_Note: not using the 'timestamp' device_class since it does not work with timestamps in seconds._

## Station module

| property | e.g. value | unit of measurement | device_class | icon |
|----------|---|---------------------|--------------|------|
| absolutepressure | 1019.9 | mbar | pressure | |
| battery  | 77 | %                   | battery      | |
| co2      | 927 | ppm                 |              | mdi:molecule-co2 |
| humidity | 48 | %                   | humidity     | |
| date_min_temp | \<timestamp> | | | |
| date_max_temp | \<timestamp> | | | |
| min_temp | 17.8 | °C               | temperature | |
| max_temp | 21.4 | °C               | temperature | |
| noise | 59 | dB | | mdi:volume-high |
| pressure | 1020.3 | mbar | pressure  | |
| pressure_trend | 'down' | | | |
| temp_trend | 'stable' | | | |
| temperature | 18.3 |  °C               | temperature | |
| time_utc | \<timestamp> | | | |
| wifi_status | 56 | | signal_strength | mdi:wifi |

## Indoor module

| property | e.g. value | unit of measurement | device_class | icon |
|----------|---|---------------------|--------------|------|
| battery  | 77 | %                   | battery      | |
| co2      | 927 | ppm                 |              | mdi:molecule-co2 |
| humidity | 48 | %                   | humidity     | |
| date_min_temp | \<timestamp> | | | |
| date_max_temp | \<timestamp> | | | |
| min_temp | 17.8 | °C               | temperature | |
| max_temp | 21.4 | °C               | temperature | |
| rf_status | 47 | | signal_strength | mdi:radio-tower |
| temp_trend | 'stable' | | | |
| temperature | 18.3 |  °C               | temperature | |
| time_utc | \<timestamp> | | | |

## Outdoor module

| property | e.g. value | unit of measurement | device_class | icon |
|----------|---|---------------------|--------------|------|
| battery  | 77 | %                   | battery      | |
| humidity | 48 | %                   | humidity     | |
| date_min_temp | \<timestamp> | | | |
| date_max_temp | \<timestamp> | | | |
| min_temp | 17.8 | °C               | temperature | |
| max_temp | 21.4 | °C               | temperature | |
| rf_status | 47 | | signal_strength | mdi:radio-tower |
| temp_trend | 'stable' | | | |
| temperature | 18.3 |  °C               | temperature | |
| time_utc | \<timestamp> | | | |

## Wind module

| data     | e.g. value | unit of measurement | device_class | icon |
|----------|---|---------------------|--------------|------|
| battery  | 77 | %                   | battery      | |
| date_max_wind_str | \<timestamp> | | | |
| gustangle | 231 | | |
| guststrength | 12 | kph | | mdi:weather-windy |
| max_wind_angle | 140 | | |
| max_wind_str | 13 | kph | | mdi:weather-windy | 
| rf_status | 47 | | signal_strength | mdi:radio-tower |
| time_utc | \<timestamp> | | | |
| windangle | 225 | | |
| windstrength | 3 | kph | | mdi:weather-windy |

## Rain module

| property | e.g. value | unit of measurement | device_class | icon |
|----------|---|---------------------|--------------|------|
| battery  | 77 | %                   | battery      | |
| rain | 0 | mm | | mdi:weather-rainy |
| rf_status | 47 | | signal_strength | mdi:radio-tower |
| sum_rain_1 | 0 | mm | | mdi:weather-rainy |
| sum_rain_24 | 0 | mm | | mdi:weather-rainy |
| time_utc | \<timestamp> | | | |

