/**
 * UB RIA Base
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file 表单提交成功后跳转处理组件基类
 * @author yanghuabei(yanghuabei@baidu.com)
 */
define(
    function (require) {
        /**
         * 表单提交成功后跳转处理组件基类
         *
         * @class mvc.handler.SubmitHandler
         */
        var exports = {};

        /**
         * 下一个处理组件
         *
         * @member mvc.handler.SubmitHandler#nextSubmitHandler
         * @type {mvc.handler.SubmitHandler}
         */
        exports.nextSubmitHandler = null;

        /**
         * 设置下一个组件
         * 可选。默认值为空。
         * 参数类型 ub-ria.mvc.handler.SubmitHandler
         * 修改后可指下一个Handler（如toast后刷新）。
         *
         * @method mvc.handler.SubmitHandler#setNextSubmitHandler
         * @param {SubmitHandler} handler 下一个组件
         */
        exports.setNextSubmitHandler = function (handler) {
            this.nextSubmitHandler = handler;
        };

        /**
         * 获取下一个组件
         *
         * @method mvc.handler.SubmitHandler#getNextSubmitHandler
         * @return {SubmitHandler}
         */
        exports.getNextSubmitHandler = function () {
            return this.nextSubmitHandler;
        };

        /**
         * 提交成功处理函数
         *
         * @method mvc.handler.SubmitHandler#handle
         * @param {Object} entity 提交后服务器端返回的实体信息
         * @param {er.Action} action 表单Action实例
         */
        exports.handle = function (entity, action) {
            this.next(entity, action);
        };

        /**
         * 调用下一个handler
         *
         * @method mvc.handler.SubmitHandler#next
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
