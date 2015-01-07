/**
 * UB RIA Base
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file 表单提交成功后的跳转组件
 * @class RedirectSubmitHandler
 * @extends SubmitHandler
 * @author yanghuabei(yanghuabei@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var u = require('../../util');
        var SubmitHandler = require('./SubmitHandler');

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
         * @method RedirectSubmitHandler.prototype.setTemplate
         * @param {string} template 跳转url模版
         */
        exports.setTemplate = function (template) {
            this.template = template;
        };

        /**
         * 获取模版
         *
         * @method RedirectSubmitHandler.prototype.getTemplate
         * @return {string}
         */
        exports.getTemplate = function () {
            return this.template;
        };

        /**
         * 设置跳转参数
         *
         * @method RedirectSubmitHandler.prototype.setRedirectOptions
         * @param {Object} options 跳转参数
         */
        exports.setRedirectOptions = function (options) {
            this.redirectOptions = options;
        };

        /**
         * 获取跳转参数
         *
         * @method RedirectSubmitHandler.prototype.getRedirectOptions
         * @return {Object}
         */
        exports.getRedirectOptions = function () {
            return this.redirectOptions;
        };

        /**
         * 提交成功处理函数
         *
         * @method RedirectSubmitHandler.prototype.handle
         * @param {Object} entity 提交后服务器端返回的实体信息
         * @param {er.Action} action 表单Action实例
         */
        exports.handle = function (entity, action) {
            var data = this.getData(entity, action);
            var url = u.template(this.getTemplate(), data);
            this.redirect(action, url, this.getRedirectOptions());

            this.next(entity, action);
        };

        /**
         * 跳转的方法
         *
         * @method RedirectSubmitHandler.prototype.redirect
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
         * @method RedirectSubmitHandler.prototype.getData
         * @param {Object} entity 提交后服务器端返回的实体信息
         * @param {er.Action} action 表单Action实例
         * @return {Object}
         */
        exports.getData = function (entity, action) {
            return {entityName: action.getEntityName()};
        };

        var RedirectSubmitHandler = require('eoo').create(SubmitHandler, exports);

        return RedirectSubmitHandler;
    }
);
