# mqtt-netatmo-bridge

This is a simple docker container that I use to bridge to/from my MQTT bridge.

I have a collection of bridges, and the general format of these begins with these environment variables:

```yaml
      TOPIC_PREFIX: /your_topic_prefix  (eg: /some_topic_prefix/somthing)
      MQTT_HOST: YOUR_MQTT_URL (eg: mqtt://mqtt.yourdomain.net)
      (OPTIONAL) MQTT_USER: YOUR_MQTT_USERNAME
      (OPTIONAL) MQTT_PASS: YOUR_MQTT_PASSWORD
```

Here's an example docker compose:

```yaml
version: '3.3'
services:
  mqtt-netatmo-bridge:
    image: terafin/mqtt-netatmo-bridge:latest
    environment:
      LOGGING_NAME: mqtt-netatmo-bridge
      TZ: YOUR_TIMEZONE (eg: America/Los_Angeles)
      TOPIC_PREFIX: /your_topic_prefix  (eg: /netatmo)
      NETATMO_USER": YOUR_NETATMO_USERNAME,
      NETATMO_PASS": YOUR_NETATMO_PASSWORD,
      NETATMO_CLIENT_ID": YOUR_NETATMO_CLIENT_ID,
      NETATMO_CLIENT_SECRET": YOUR_NETATMO_CLIENT_SECRET,
      MQTT_HOST: YOUR_MQTT_URL (eg: mqtt://mqtt.yourdomain.net)
      (OPTIONAL) MQTT_USER: YOUR_MQTT_USERNAME
      (OPTIONAL) MQTT_PASS: YOUR_MQTT_PASSWORD
      (OPTIONAL) HEALTH_CHECK_PORT: "3001"
      (OPTIONAL) HEALTH_CHECK_TIME: "120"
      (OPTIONAL) HEALTH_CHECK_URL: /healthcheck
```

Here's an example publish for my setup:

```log
/netatmo/atrium/time_utc 1601834374
/netatmo/atrium/temperature 23.4
/netatmo/atrium/co2 487
/netatmo/atrium/humidity 49
/netatmo/atrium/noise 43
/netatmo/atrium/pressure 1013.9
/netatmo/atrium/absolutepressure 1006.9
/netatmo/atrium/min_temp 23.4
/netatmo/atrium/max_temp 24.8
/netatmo/atrium/date_max_temp 1601795086
/netatmo/atrium/date_min_temp 1601831351
/netatmo/atrium/temp_trend stable
/netatmo/atrium/pressure_trend stable
/netatmo/outdoor/battery 72
/netatmo/outdoor/time_utc 1601834332
/netatmo/outdoor/temperature 22.2
/netatmo/outdoor/humidity 70
/netatmo/outdoor/min_temp 15.6
/netatmo/outdoor/max_temp 22.2
/netatmo/outdoor/date_max_temp 1601834332
/netatmo/outdoor/date_min_temp 1601820746
/netatmo/outdoor/temp_trend up
/netatmo/rain_sensor/battery 85
/netatmo/rain_sensor/time_utc 1601834364
/netatmo/rain_sensor/rain 0
/netatmo/rain_sensor/sum_rain_1 0
/netatmo/rain_sensor/sum_rain_24 0
/netatmo/wind_sensor/battery 46
/netatmo/wind_sensor/time_utc 1601834371
/netatmo/wind_sensor/windstrength 3
/netatmo/wind_sensor/windangle 241
/netatmo/wind_sensor/guststrength 8
/netatmo/wind_sensor/gustangle 249
/netatmo/wind_sensor/max_wind_str 17
/netatmo/wind_sensor/max_wind_angle 223
/netatmo/wind_sensor/date_max_wind_str 1601795689
/netatmo/bedroom/battery 46
/netatmo/bedroom/time_utc 1601834371
/netatmo/bedroom/temperature 20.9
/netatmo/bedroom/co2 556
/netatmo/bedroom/humidity 60
/netatmo/bedroom/min_temp 19.3
/netatmo/bedroom/max_temp 21
/netatmo/bedroom/date_max_temp 1601833755
/netatmo/bedroom/date_min_temp 1601795048
/netatmo/bedroom/temp_trend up
/netatmo/living_room/battery 24
/netatmo/living_room/time_utc 1601834371
/netatmo/living_room/temperature 21
/netatmo/living_room/co2 572
/netatmo/living_room/humidity 59
/netatmo/living_room/min_temp 20.2
/netatmo/living_room/max_temp 21.4
/netatmo/living_room/date_max_temp 1601797764
/netatmo/living_room/date_min_temp 1601826475
/netatmo/living_room/temp_trend stable
/netatmo/entrance/battery 100
/netatmo/entrance/time_utc 1601834364
/netatmo/entrance/temperature 20.3
/netatmo/entrance/co2 556
/netatmo/entrance/humidity 59
/netatmo/entrance/min_temp 19.7
/netatmo/entrance/max_temp 20.9
/netatmo/entrance/date_max_temp 1601797758
/netatmo/entrance/date_min_temp 1601824059
/netatmo/entrance/temp_trend down

```
