/**
 * DEMO
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 表单视图
 * @exports contact.mvc.ContactFormView
 * @author dddbear(dddbear@aliyun.com)
 */
define(
    function (require) {
        require('tpl!../tpl/contactForm.tpl.html');
        
        var u = require('underscore');
        var URL = require('er/URL');

        /**
         * 视图
         *
         * @class mvc.ContactFormView
         * @extends ub-ria.mvc.FormView
         */
        var exports = {};

        /**
         * @override
         */
        exports.template = 'contactForm';
        var ContactFormView = require('eoo').create(require('ub-ria/mvc/FormView'), exports);
        return ContactFormView;
    }
);
