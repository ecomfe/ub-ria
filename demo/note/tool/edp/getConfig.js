module.exports = function (module, options) {
    process.chdir(require('path').join(__dirname, '..', '..'));
    try {
        var config = require('../../mockup/' + module + '/config').getConfig();

        var include = (options.include || config.map(function (c) { return c.name })).slice();
        
        if (options.exclude) {
            include = include.filter(function (name) { return options.exclude.indexOf(name) < 0; });
        }

        var result = config.filter(function (c) { return include.indexOf(c.name) >= 0; });
        return result;
    }
    catch (noModule) {
        return [];
    }
};