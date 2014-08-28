/**
 * UB RIA Base
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 表单提交成功后的跳转组件
 * @author yanghuabei
 * @date $DATE$
 */
define(
    function (require) {
        var u = require('underscore');
        var SubmitHandler = require('./SubmitHandler');

        /**
         * @class RedirectSubmitHandler
         *
         * 表单提交成功后的跳转组件
         */
        var exports = {};

        /**
         * 跳转url模版
         *
         * @type {string}
         */
        exports.template = '/${entityName}/list';

        /**
         * 跳转参数
         *
         * @type {string}
         */
        exports.redirectOptions = null;

        /**
         * 设置组件的url模版
         *
         * @param {string} template 跳转url模版
         */
        exports.setTemplate = function (template) {
            this.template = template;
        };

        /**
         * 获取模版
         *
         */
        exports.getTemplate = function () {
            return this.template;
        };

        /**
         * 设置跳转参数
         *
         * @param {Object} options 跳转参数
         */
        exports.setRedirectOptions = function (options) {
            this.redirectOptions = options;
        };

        /**
         * 获取跳转参数
         *
         */
        exports.getRedirectOptions = function () {
            return this.redirectOptions;
        };

        /**
         * 提交成功处理函数
         *
         * @param {Object} entity 提交后服务器端返回的实体信息
         * @param {er.Action} action 表单Action实例
         */
        exports.handle = function (entity, action) {
            var entitySaveEvent = action.fire('entitysave', { entity: entity });
            var handleFinishEvent = action.fire('handlefinish');

            if (!entitySaveEvent.isDefaultPrevented()
                && !handleFinishEvent.isDefaultPrevented()
            ) {
                var data = this.getData(entity, action);
                var url = u.template(this.getTemplate(), data);
                this.redirect(action, url, this.getRedirectOptions());
            }

            this.next(entity, action);
        };

        /**
         * 跳转的方法
         *
         * @param {er.Action} action 表单Action实例
         * @param {string} url 跳转目的url
         * @param {Object} options 跳转参数
         */
        exports.redirect = function (action, url, options) {
            action.redirect(url, options);
        };

        /**
         * 获取url模版的数据
         *
         * @param {Object} entity 提交后服务器端返回的实体信息
         * @param {er.Action} action 表单Action实例
         */
        exports.getData = function (entity, action) {
            return { entityName: action.getEntityName() };
        };

        var RedirectSubmitHandler = require('eoo').create(SubmitHandler, exports);

        return RedirectSubmitHandler;
    }
);
