/**
 * UB RIA Base
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 表单提交成功后跳转处理组件基类
 * @author yanghuabei
 * @date $DATE$
 */
define(
    function (require) {
        /**
         * @class SubmitHandler
         *
         * 表单提交成功后处理组件基类
         */
        var exports = {};

        /**
         * 下一个处理组件
         *
         * @type {SubmitHandler}
         */
        exports.nextSubmitHandler = null;

        /**
         * 设置下一个组件
         *
         * @param {SubmitHandler} handler 下一个组件
         */
        exports.setNextSubmitHandler = function (handler) {
            this.nextSubmitHandler = handler;
        };

        /**
         * 获取下一个组件
         *
         */
        exports.getNextSubmitHandler = function (handler) {
            return this.nextSubmitHandler;
        };

        /**
         * 提交成功处理函数
         *
         * @param {Object} entity 提交后服务器端返回的实体信息
         * @param {er.Action} action 表单Action实例
         */
        exports.handle = function (entity, action) {
            this.next(entity, action);
        };

        exports.next = function (entity, action) {
            var nextSubmitHandler = this.getNextSubmitHandler();
            if (nextSubmitHandler) {
                nextSubmitHandler.handle(entity, action);
            }
        };

        var SubmitHandler = require('eoo').create(exports);

        return SubmitHandler;
    }
);
