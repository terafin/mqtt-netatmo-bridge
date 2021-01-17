# mqtt-netatmo-bridge

This is a simple docker container that I use to bridge to/from my MQTT bridge.

I have a collection of bridges, and the general format of these begins with these environment variables:

```yaml
      TOPIC_PREFIX: /your_topic_prefix  (eg: /some_topic_prefix/somthing)
      MQTT_HOST: YOUR_MQTT_URL (eg: mqtt://mqtt.yourdomain.net)
      (OPTIONAL) MQTT_USER: YOUR_MQTT_USERNAME
      (OPTIONAL) MQTT_PASS: YOUR_MQTT_PASSWORD
```

## Home Assistant Support

This service can automatically publish configurations so Home Assistant will automatically discovery all properties.
For each module, a new device is created.
[Read more](HomeAssistant.md)

## Running locally

When running this project locally, the settings can be set in a  `.env` file.
Copy the `.env.sample` to `.env` and adjust the Netatmo and MQTT settings according to your environment.
Then run `npm start`.

## Documentation
Thanks to @skyynet for some documentation for how to set this up on a Synology NAS (but likely applies to more)!
* English: https://skyynet.de/e-netatmo
* German: https://skyynet.de/netatmo

## Docker Compose
Here's an example docker compose:

```yaml
version: '3.3'
services:
  mqtt-netatmo-bridge:
    image: terafin/mqtt-netatmo-bridge:latest
    environment:
      LOGGING_NAME: mqtt-netatmo-bridge
      LOG_LEVEL: info
      TZ: YOUR_TIMEZONE (eg: America/Los_Angeles)
      TOPIC_PREFIX: /your_topic_prefix  (eg: /netatmo)
      NETATMO_USER: YOUR_NETATMO_USERNAME,
      NETATMO_PASS: YOUR_NETATMO_PASSWORD,
      NETATMO_CLIENT_ID: YOUR_NETATMO_CLIENT_ID,
      NETATMO_CLIENT_SECRET: YOUR_NETATMO_CLIENT_SECRET,
      MQTT_HOST: YOUR_MQTT_URL (eg: mqtt://mqtt.yourdomain.net)
      MQTT_STATUS_TOPIC_PREFIX: /status/ (set to fix issue when not set)
      (OPTIONAL) MQTT_USER: YOUR_MQTT_USERNAME
      (OPTIONAL) MQTT_PASS: YOUR_MQTT_PASSWORD
      (OPTIONAL) MQTT_NAME: netatmo-bridge
      (OPTIONAL) POLL_INTERVAL: 300 (every 5min more than enough)
      (OPTIONAL) RETAIN_VALUES: true (whether to retain the sensor values)
      (OPTIONAL) HOME_ASSISTANT_AUTO_DISCOVERY: true
      (OPTIONAL) HEALTH_CHECK_PORT: "3001"
      (OPTIONAL) HEALTH_CHECK_TIME: "120"
      (OPTIONAL) HEALTH_CHECK_URL: /healthcheck
```

Here's an example publish for my setup:

```log
/netatmo/mystation/atrium/time_utc 1601834374
/netatmo/mystation/atrium/temperature 23.4
/netatmo/mystation/atrium/co2 487
/netatmo/mystation/atrium/humidity 49
/netatmo/mystation/atrium/noise 43
/netatmo/mystation/atrium/pressure 1013.9
/netatmo/mystation/atrium/absolutepressure 1006.9
/netatmo/mystation/atrium/min_temp 23.4
/netatmo/mystation/atrium/max_temp 24.8
/netatmo/mystation/atrium/date_max_temp 1601795086
/netatmo/mystation/atrium/date_min_temp 1601831351
/netatmo/mystation/atrium/temp_trend stable
/netatmo/mystation/atrium/pressure_trend stable
/netatmo/mystation/outdoor/battery 72
/netatmo/mystation/outdoor/time_utc 1601834332
/netatmo/mystation/outdoor/temperature 22.2
/netatmo/mystation/outdoor/humidity 70
/netatmo/mystation/outdoor/min_temp 15.6
/netatmo/mystation/outdoor/max_temp 22.2
/netatmo/mystation/outdoor/date_max_temp 1601834332
/netatmo/mystation/outdoor/date_min_temp 1601820746
/netatmo/mystation/outdoor/temp_trend up
/netatmo/mystation/rain_sensor/battery 85
/netatmo/mystation/rain_sensor/time_utc 1601834364
/netatmo/mystation/rain_sensor/rain 0
/netatmo/mystation/rain_sensor/sum_rain_1 0
/netatmo/mystation/rain_sensor/sum_rain_24 0
/netatmo/mystation/wind_sensor/battery 46
/netatmo/mystation/wind_sensor/time_utc 1601834371
/netatmo/mystation/wind_sensor/windstrength 3
/netatmo/mystation/wind_sensor/windangle 241
/netatmo/mystation/wind_sensor/guststrength 8
/netatmo/mystation/wind_sensor/gustangle 249
/netatmo/mystation/wind_sensor/max_wind_str 17
/netatmo/mystation/wind_sensor/max_wind_angle 223
/netatmo/mystation/wind_sensor/date_max_wind_str 1601795689
/netatmo/mystation/bedroom/battery 46
/netatmo/mystation/bedroom/time_utc 1601834371
/netatmo/mystation/bedroom/temperature 20.9
/netatmo/mystation/bedroom/co2 556
/netatmo/mystation/bedroom/humidity 60
/netatmo/mystation/bedroom/min_temp 19.3
/netatmo/mystation/bedroom/max_temp 21
/netatmo/mystation/bedroom/date_max_temp 1601833755
/netatmo/mystation/bedroom/date_min_temp 1601795048
/netatmo/mystation/bedroom/temp_trend up
/netatmo/mystation/living_room/battery 24
/netatmo/mystation/living_room/time_utc 1601834371
/netatmo/mystation/living_room/temperature 21
/netatmo/mystation/living_room/co2 572
/netatmo/mystation/living_room/humidity 59
/netatmo/mystation/living_room/min_temp 20.2
/netatmo/mystation/living_room/max_temp 21.4
/netatmo/mystation/living_room/date_max_temp 1601797764
/netatmo/mystation/living_room/date_min_temp 1601826475
/netatmo/mystation/living_room/temp_trend stable
/netatmo/mystation/entrance/battery 100
/netatmo/mystation/entrance/time_utc 1601834364
/netatmo/mystation/entrance/temperature 20.3
/netatmo/mystation/entrance/co2 556
/netatmo/mystation/entrance/humidity 59
/netatmo/mystation/entrance/min_temp 19.7
/netatmo/mystation/entrance/max_temp 20.9
/netatmo/mystation/entrance/date_max_temp 1601797758
/netatmo/mystation/entrance/date_min_temp 1601824059
/netatmo/mystation/entrance/temp_trend down

```
