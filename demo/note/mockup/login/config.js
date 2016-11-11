exports.getConfig = function () {
    return [
        {
            name: 'current',
            location: '/api/js/users/current/userInfo',
            handler: [
                file('mockup/login/currentUser.json')
            ]
        }
    ];
};
