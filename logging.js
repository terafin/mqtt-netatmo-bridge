enable_logging = false

exports.log = function(some_string) {
    if (enable_logging) console.log(some_string)
}

exports.warn = function(some_string) {
    console.log(some_string)
}

exports.set_enabled = function(enabled) {
    enable_logging = enabled
}