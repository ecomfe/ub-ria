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

        /**
         * @class CompositeSubmitHandler
         *
         * 表单提交成功后处理组件的组合
         */
        var exports = {};

        /**
         * 设置子组件
         *
         * @param {Object[]} handlers 组件数组
         */
        exports.setChildHandlers = function (handlers) {
            this.childHandlers = handlers;
        };

        /**
         * 提交成功处理函数
         *
         * @param {Object} entity 提交后服务器端返回的实体信息
         * @param {er.Action} action 表单Action实例
         */
        exports.handle = function (entity, action) {
            u.each(
                this.childHandlers,
                function (handler) {
                    if (typeof handler.handle === 'function') {
                        handler.handle(entity, action);
                    }
                }
            );
        };

        var CompositeSubmitHandler = require('eoo').create(exports);

        return CompositeSubmitHandler;
    }
);
