/**
 * UB RIA Base
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file 表单提交成功后的跳转组件
 * @author liyidong(srhb18@gmail.com)
 */
define(
    function (require) {
        /**
         * @class common.handler.RedirectSubmitHandler
         * @extends ub-ria.mvc.handler.RedirectSubmitHandler
         */
        var exports = {};

        /**
         * 提交成功处理函数
         *
         * @method RedirectSubmitHandler.prototype.handle
         * @param {Object} entity 提交后服务器端返回的实体信息
         * @param {er.Action} action 表单Action实例
         * @override
         */
        exports.handle = function (entity, action) {
            var isChildForm = action.isChildForm();
            var childFormSubmitRedirect = this.getRedirectOptions().childFormSubmitRedirect || false;

            // 如果Model里isChildForm为true，即当前调用的Action并是一个子Form
            // 并且注入的属性中childFormSubmitRedirect为flase，即子Form不需要跳转时
            // 略过父类中跳转相关逻辑，直接进入下一个handl
            if (isChildForm && !childFormSubmitRedirect) {
                this.next(entity, action);
            }
            // 否则执行父类逻辑，进行redirect
            else {
                this.$super(arguments);
            }
        };

        var ParentRedirectSubmitHandler = require('ub-ria/mvc/handler/RedirectSubmitHandler');
        var RedirectSubmitHandler = require('eoo').create(ParentRedirectSubmitHandler, exports);

        return RedirectSubmitHandler;
    }
);
