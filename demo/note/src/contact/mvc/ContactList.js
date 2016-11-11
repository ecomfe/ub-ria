/**
 * DEMO
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 列表
 * @exports contact.mvc.ContactList
 * @author dddbear(dddbear@aliyun.com)
 */
define(
    function (require) {
        /**
         * @class contact.mvc.ContactList
         * @extends ub-ria.mvc.ListAction
         */
        var exports = {};

        /**
         * @override
         */
        exports.entityDescription = '联系人';

        var ListAction = require('ub-ria/mvc/ListAction');
        var ContactList = require('eoo').create(ListAction, exports);
        return ContactList;
    }
);
