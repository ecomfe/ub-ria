exports.getConfig = function (resources) {
    return [
        {
            location: /\.css$/,
            handler: [
                autoless()
            ]
        },
        {
            location: /\.less$/,
            handler: [
                file(),
                less()
            ]
        },
        {
            location: /[^=](\.js|\.html|\.htm|\.png|\.gif|\.jpg|\.swf|\.map|\.csv|\.otf|\.eot|\.svg|\.ttf|\.woff)(\?.*)?$/,
            handler: [
                file()
            ]
        }
    ];
};
