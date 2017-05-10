const Redis = require('redis')
const _ = require('lodash')
const logging = require('./logging.js')


const redisHost = process.env.REDIS_HOST
const redisPort = process.env.REDIS_PORT
const redisDB = process.env.REDIS_DATABASE

if (Redis.setupClient == null) Redis.setupClient = function(connectedCallback) {
    const redis = Redis.createClient({
        host: redisHost,
        port: redisPort,
        db: redisDB,
        retry_strategy: function(options) {
            if (options.error && options.error.code === 'ECONNREFUSED') {
                // End reconnecting on a specific error and flush all commands with a individual error
                return new Error('The server refused the connection')
            }
            if (options.total_retry_time > 1000 * 60 * 60) {
                // End reconnecting after a specific timeout and flush all commands with a individual error
                return new Error('Retry time exhausted')
            }
            if (options.times_connected > 10) {
                // End reconnecting with built in error
                return undefined
            }
            // reconnect after
            return Math.min(options.attempt * 100, 3000)
        }
    })

    // redis callbacks

    redis.on('error', function(err) {
        logging.error('redis error ' + err)
    })

    redis.on('connect', function() {
        logging.info('redis connected')
        if (!_.isNil(connectedCallback))
            connectedCallback()
    })

    return redis
}