fs = require('fs')
path = require('path');
watch = require('watch')
yaml = require('js-yaml');

configs = []
config_path = null

logging = require('./logging.js')

exports.load_path = function(in_path) {
    config_path = in_path
        // Watch Path
    watch.watchTree(config_path, function(f, curr, prev) {
        logging.log('Updating configs')
        load_device_config()
    })
}

exports.get_configs = function() {
    return configs
}


exports.translate_to_topic = function(in_topic) {
    found_topic = null

    config.get_configs().forEach(function(config_item) {
        all_configs = Object.keys(config_item)

        all_configs.forEach(function(key) {
            map = config_item[key]
            foundItem = map[in_topic]
            if (found_topic === null && foundItem !== null && foundItem !== undefined) {
                logging.log("  " + in_topic + " => " + foundItem)
                found_topic = foundItem
            }
        }, this);
    }, this);

    return found_topic
}

exports.translate_from_topic = function(in_topic) {
    found_topic = null

    config.get_configs().forEach(function(config_item) {
        all_configs = Object.keys(config_item).forEach(function(key) {
            map = config_item[key]

            all_topics = Object.keys(map).forEach(function(this_topic) {
                if (found_topic === null && in_topic == map[this_topic]) {
                    logging.log("  " + in_topic + " => " + this_topic)
                    found_topic = this_topic
                }
            }, this);
        }, this);
    }, this);

    return found_topic
}

function load_device_config() {
    fs.readdir(config_path, function(err, files) {
        configs = []

        logging.log('Loading configs at path: ' + config_path)
        if (err) {
            throw err;
        }

        files.map(function(file) {
            return path.join(config_path, file);
        }).filter(function(file) {
            return fs.statSync(file).isFile();
        }).forEach(function(file) {
            logging.log(" - Loading: " + file);
            doc = yaml.safeLoad(fs.readFileSync(file, 'utf8'));
            configs.push(doc)
        });

        logging.log('...done loading configs')
    })
}