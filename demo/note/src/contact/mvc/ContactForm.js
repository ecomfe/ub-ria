/**
 * DEMO
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 表单
 * @exports contact.mvc.ContactForm
 * @author dddbear(dddbear@aliyun.com)
 */
define(
    function (require) {
        /**
         * @class contact.mvc.ContactForm
         * @extends ub-ria.mvc.FormAction
         */
        var exports = {};

        /**
         * @override
         */
        exports.entityDescription = '联系人';

        var FormAction = require('ub-ria/mvc/FormAction');
        var ContactForm = require('eoo').create(FormAction, exports);
        return ContactForm;
    }
);
