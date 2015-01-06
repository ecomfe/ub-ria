/**
 * UB RIA Base
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file IoCAction工厂
 * @exports mvc.IoCActionFactory
 * @author shenbin(bobshenbin@gmail.com)
 */
define(
    function (require) {
        var u = require('../util');

        /**
         * @class mvc.IoCActionFactory
         */
        var exports = {};

        /**
         * @param {string} actionComponent action组件名
         * @param {Object} options 相关配置
         * @param {boolean=} options.noSchema 模块没有`schema`信息，通常只有列表的模块会这样
         */
        exports.constructor = function (actionComponent, options) {
            options = options || {};
            this.actionComponent = actionComponent;
            this.noSchema = options.noSchema || false;
        };

        /**
         * 创建一个Action实例
         *
         * @public
         * @method mvc.IoCActionFactory#createRuntimeAction
         * @param {er.meta.ActionContext} actionContext Action的执行上下文
         * @return {er.Promise}
         */
        exports.createRuntimeAction = function (actionContext) {
            var Deferred = require('er/Deferred');
            var deferred = new Deferred();

            require('uioc').getComponent(this.actionComponent, deferred.resolver.resolve);

            return deferred.promise.then(u.bind(this.buildAction, this, actionContext));
        };

        /**
         * 获取视图名称
         *
         * @param {er.meta.ActionContext} actionContext Action的执行上下文
         * @return {string}
         */
        function getViewName(actionContext) {
            var parts = u.compact(actionContext.url.toString().split('/'));

            var pageType = parts[parts.length - 1];
            if (pageType === 'create' || pageType === 'update') {
                parts[parts.length - 1] = 'form';
            }

            return u.map(parts, u.dasherize).join('-');
        }

        /**
         * 组装Action
         *
         * @protected
         * @method mvc.IoCActionFactory#buildAction
         * @param {er.meta.ActionContext} actionContext Action的执行上下文
         * @param {er.Action} action 待组装的`Action`实例
         * @return {er.Action}
         */
        exports.buildAction = function (actionContext, action) {
            action.view.name = getViewName(actionContext);

            return action;
        };

        var IoCActionFactory = require('eoo').create(exports);

        return IoCActionFactory;
    }
);
