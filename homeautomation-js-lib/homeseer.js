logging = require('./logging.js')
request = require('request');
homeseer_json_api_path = null

exports.set_path = function(new_path) {
    homeseer_json_api_path = new_path
}

exports.publish = function(deviceRefID, targetValue) {
    JSON_Path = "/JSON?request=controldevicebyvalue&ref="
    homeseer_url = homeseer_json_api_path + JSON_Path + deviceRefID + "&value=" + targetValue

    logging.log('request url: ' + homeseer_url)
    request(homeseer_url, function(error, response, body) {
        if ((response !== null && response.statusCode != 200) || (error !== null && error !== undefined)) {
            console.log('error:', error);
            console.log('statusCode:', response && response.statusCode);
            console.log('body:', body);
        }
    });
}