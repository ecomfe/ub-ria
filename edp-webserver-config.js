exports.port = 8848;
exports.directoryIndexes = true;
exports.documentRoot = __dirname;

var BABEL_OPTIONS = {
    loose: 'all',
    stage: 0,
    modules: 'amd',
    compact: false,
    ast: false,
    blacklist: ['strict'],
    externalHelpers: true,
    sourceMaps: true
};

exports.getLocations = function () {
    return [
        {
            key: 'source',
            location: /^\/src\/.+\.js(\?.+)?/,
            handler: [
                file(),
                function compileBabel(context) {
                    if (context.status !== 200) {
                        return;
                    }

                    var code = context.content;
                    var babelResult = require('babel').transform(code, BABEL_OPTIONS);
                    context.map = babelResult.map;
                    context.content = babelResult.code;
                }
            ]
        },
        {
            location: /^.*$/,
            handler: [
                file()
            ]
        }
    ];
};

exports.injectResource = function ( res ) {
    for ( var key in res ) {
        global[ key ] = res[ key ];
    }
};
