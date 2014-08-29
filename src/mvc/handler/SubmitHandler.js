/**
 * UB RIA Base
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file 表单提交成功后跳转处理组件基类
 * @class SubmitHandler
 * @author yanghuabei(yanghuabei@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
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
         * @method SubmitHandler.prototype.setNextSubmitHandler
         * @param {SubmitHandler} handler 下一个组件
         */
        exports.setNextSubmitHandler = function (handler) {
            this.nextSubmitHandler = handler;
        };

        /**
         * 获取下一个组件
         *
         * @method SubmitHandler.prototype.getNextSubmitHandler
         * @return {SubmitHandler}
         */
        exports.getNextSubmitHandler = function () {
            return this.nextSubmitHandler;
        };

        /**
         * 提交成功处理函数
         *
         * @method SubmitHandler.prototype.handle
         * @param {Object} entity 提交后服务器端返回的实体信息
         * @param {er.Action} action 表单Action实例
         */
        exports.handle = function (entity, action) {
            this.next(entity, action);
        };

        /**
         * 调用下一个handler
         *
         * @method SubmitHandler.prototype.next
         * @param {Object} entity 提交后服务器端返回的实体信息
         * @param {er.Action} action 表单Action实例
         */
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
