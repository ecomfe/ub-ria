/**
 * UB RIA Base
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file 表单提交成功后的toast提醒组件
 * @author yanghuabei(yanghuabei@baidu.com)
 */
define(
    function (require) {
        var u = require('../../util');
        var Toast = require('esui/Toast');
        var SubmitHandler = require('./SubmitHandler');

        /**
         * 表单提交成功后的toast提醒组件
         *
         * @class mvc.handler.ToastSubmitHandler
         * @extends mvc.hadnler.SubmitHandler
         */
        var exports = {};

        /**
         * toast消息模版
         *
         * @member mvc.handler.ToastSubmitHandler#template
         * @type {string}
         */
        exports.template = '';

        /**
         * 设置下一个组件
         *
         * @method mvc.handler.ToastSubmitHandler#setTemplate
         * @param {string} template toast消息模版
         */
        exports.setTemplate = function (template) {
            this.template = template;
        };

        /**
         * 获取模版
         *
         * @method mvc.handler.ToastSubmitHandler#getTemplate
         * @return {string}
         */
        exports.getTemplate = function () {
            return this.template;
        };

        /**
         * @override
         */
        exports.handle = function (entity, action) {
            var message = this.getToastMessage(entity, action);
            if (message) {
                var toast = Toast.success(message);
                toast.show();
            }

            this.next(entity, action);
        };

        /**
         * 获取表单提交成功后显示的信息
         *
         * 默认提示信息为“您[创建|修改]的{实体名称}{name}已经成功保存”
         *
         * @protected
         * @method mvc.handler.ToastSubmitHandler#getToastMessage
         * @param {Object} entity 提交后服务器端返回的实体信息
         * @param {er.Action} action 表单Action实例
         * @return {string}
         */
        exports.getToastMessage = function (entity, action) {
            var template = this.getTemplate();
            if (template == null) {
                return '';
            }

            if (template) {
                return u.template(template, entity || {});
            }

            var actionType = action.context.formType === 'update'
                ? '修改'
                : '创建';
            return '您' + actionType + '的'
                + action.getEntityDescription()
                + '[<strong>' + u.escape(entity.name) + '</strong>]'
                + '已经成功保存';
        };

        var ToastSubmitHandler = require('eoo').create(SubmitHandler, exports);

        return ToastSubmitHandler;
    }
);
