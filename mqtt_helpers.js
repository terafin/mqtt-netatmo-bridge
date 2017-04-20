logging = require('./logging.js')
mqtt = require('mqtt')

publish_map = {}

function fix_name(str) {
    str = str.replace(/[+\\\&\*\%\$\#\@\!]/g, '')
    str = str.replace(/\s/g, '_').trim().toLowerCase()
    str = str.replace(/__/g, '_')
    return str
}

exports.publish = function(client, topic, message) {
    if (client === null || topic === null) {
        logging.warn("empty client or topic passed into mqtt_helpers.publish")
        return
    }
    topic = fix_name(topic)

    logging.log(" " + topic + ":" + message)
    if (publish_map[topic] !== message) {
        publish_map[topic] = message
        logging.log(" => published!")
        client.publish(topic, message)
    } else {
        logging.log(" * not published")
    }
}