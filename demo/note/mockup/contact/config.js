exports.getConfig = function () {
    return [
        {
            name: 'roles',
            location: '/api/js/contacts/roles',
            handler: [
                file('mockup/contact/roles.json')
            ]
        }
    ];
};