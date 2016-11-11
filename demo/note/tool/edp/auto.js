var path = require('path');
var fs = require('fs');
var url = require('url');

var allMapping = [
    {
        name: 'search',
        method: 'GET',
        regex: /^\/(\w+)$/,
        files: ['$entityName/search.json']
    },
    {
        name: 'list',
        method: 'GET',
        regex: /^\/(\w+)\/list$/,
        files: ['$entityName/list.json']
    },
    {
        name: 'findById',
        method: 'GET',
        regex: /^\/(\w+)\/\d+$/,
        files: ['$entityName/findById.json']
    },
    {
        name: 'save',
        method: 'POST',
        regex: /^\/(\w+)$/,
        files: ['$entityName/save.json']
    },
    {
        name: 'update',
        method: 'PUT',
        regex: /^\/(\w+)\/\d+$/,
        files: ['$entityName/save.json']
    }
];

var globalOptions = {};
exports.initialize = function (options) {
    globalOptions = options;
};

var getResponseConfig = function (mapping, method, pathname) {
    method = method.toUpperCase();

    for (var i = 0; i < mapping.length; i++) {
        var config = mapping[i];
        if (config.method === method && config.regex.test(pathname)) {
            return config;
        }
    }
    return null;
}

function getFullFileName(entityName, pathname, config, options, file) {

    if (options.packageName) {
        // 独立模块去`dep`下面找，且隔了一层版本号
        var packageFolder = path.join(__dirname, '..', '..', 'dep', options.packageName);
        var versionFolder = fs.readdirSync(packageFolder)
            .map(function (file) { return path.join(packageFolder, file); })
            .filter(function (dir) { return fs.statSync(dir).isDirectory() })[0];
        var packageMockupFolder = path.join(versionFolder, 'mockup');
        var matches = config.regex.exec(pathname);
        file = file
            .replace('$entityName/', '')
            .replace(
                /\$([a-zA-Z0-9]+)/,
                function (m, i) { return matches[i]; }
            );
        var filePath = path.join(packageMockupFolder, file);
        return filePath;
    }
    else {
        var root = path.join(__dirname, '..', '..', 'mockup');
        var matches = config.regex.exec(pathname);
        matches.entityName = entityName;
        file = file.replace(
            /\$([a-zA-Z0-9]+)/,
            function (m, i) { return matches[i]; }
        );
        var filePath = path.join(root, file);
        return filePath;
    }

}

exports.handler = function (entityName, options) {
    var include = options.include;
    if (!include) {
        include = allMapping.map(function (config) { return config.name });
    }

    var exclude = options.exclude;
    if (exclude) {
        include = include.filter(function (name) { return exclude.indexOf(name) < 0; });
    }

    var mapping = allMapping.filter(function (config) { return include.indexOf(config.name) >= 0; });

    return function (context) {
        context.stop();

        var pathname = url.parse(context.request.url).pathname;
        if (pathname.indexOf('/api/js') === 0) {
            pathname = pathname.substring('/api/js'.length);
        }
        // 去掉实体名的复数
        pathname = pathname.split('/');
        if (pathname[1].slice(-3) === 'ies') {
            // ies变y
            pathname[1] = pathname[1].slice(0, -3) + 'y';
        }
        else {
            // 去掉s
            pathname[1] = pathname[1].slice(0, -1);
        }
        pathname = pathname.join('/');

        var config = getResponseConfig(mapping, context.request.method, pathname);

        if (!config) {
            return proxy(globalOptions.proxyTarget, globalOptions.proxyTargetPort)(context);
        }

        var availableFiles = config.files
            .map(function (file) { return getFullFileName(entityName, pathname, config, options, file); })
            .filter(fs.existsSync);

        if (!availableFiles.length) {
            return proxy(globalOptions.proxyTarget, globalOptions.proxyTargetPort)(context);
        }

        console.log('Resolved ' + context.request.url + ' to ' + availableFiles[0]);
        return file(availableFiles[0])(context);
    };
};

exports.config = function (entity, options) {
    options = options || {};
    var entityName = options.entityName || entity;
    var lastCharacter = entityName.slice(-1);
    if (lastCharacter === 'y') {
        entityName = entityName.slice(0, -1) + 'ies';
    }
    else {
        entityName += 's';
    }
    var config = {
        location: new RegExp('\\/api\\/js\\/' + entityName),
        handler: exports.handler(entity, options)
    };

    return config;
};
