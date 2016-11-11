var path = require('path');
var fs = require('fs');

var proxyTarget = '127.0.0.1';
var proxyTargetPort = 8040;

exports.port = 8040;
exports.directoryIndexes = true;
exports.documentRoot = __dirname;

var auto = require('./tool/edp/auto');
auto.initialize({ proxyTarget: proxyTarget, proxyTargetPort: proxyTargetPort });

var getConfig = require('./tool/edp/getConfig');

exports.getLocations = function () {
    var modules = [
        {
            name: 'login'
        },
        {
            name: 'contact'
        }
    ];

    var locations = require('./mockup/static').getConfig();

    for (var i = 0; i < modules.length; i++) {
        var module = modules[i];
        locations = locations
            .concat(getConfig(module.name, module))
            .concat(auto.config(module.name, module));
    }
    var all = { 
        location: /^.*$/, 
        handler: [
            proxy(proxyTarget, proxyTargetPort)
        ]
    };

    locations.push(all);
    return locations;
};

exports.injectRes = function (res) {
    for (var key in res) {
        global[key] = res[key];
    }
};