const redis = require('redis')

//Only add this implementation if one does not already exist.
if (redis.RedisClient.prototype.valueForTopic == null) redis.RedisClient.prototype.valueForTopic = function(topic, callback) {
    if (callback == null || callback == undefined) return

    if (topic.endsWith('/set')) {
        callback('cannot get value for /set topic', null)
        return
    }
    if (topic.startsWith('/homeseer/action/')) {
        callback('cannot get value for /homeseer/action/ topic', null)
        return
    }

    this.get(topic, callback)
}