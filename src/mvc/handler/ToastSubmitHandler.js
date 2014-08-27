/**
 * UB RIA Base
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 表单提交成功后的toast提醒组件
 * @author yanghuabei
 * @date $DATE$
 */
define(
    function (require) {
        var u = require('underscore');
        require('esui/Toast');

        /**
         * @class ToastSubmitHandler
         *
         * 表单提交成功后的toast提醒组件
         */
        var exports = {};

        /**
         * toast消息模版
         *
         * @type {string}
         */
        exports.template = '';

        /**
         * 设置toast消息模版
         *
         * @param {string} template toast消息模版
         */
        exports.setTemplate = function (template) {
            this.template = template;
        };

        /**
         * 提交成功处理函数
         *
         * @param {Object} entity 提交后服务器端返回的实体信息
         * @param {er.Action} action 表单Action实例
         */
        exports.handle = function (entity, action) {
            var toast = this.getToastMessage(entity, action);
            if (toast) {
                showToast(toast);
            }
        };

        /**
         * 获取表单提交成功后显示的信息
         *
         * 默认提示信息为“您[创建|修改]的{实体名称}{name}已经成功保存”
         *
         * @param {Object} entity 提交后服务器端返回的实体信息
         * @param {er.Action} action 表单Action实例
         * @return {string}
         */
        exports.getToastMessage = function (entity, action) {
            if (this.template == null) {
                return '';
            }

            if (this.template) {
                return u.template(this.template, entity || {});
            }
            else {
                var actionType = action.context.formType === 'update'
                    ? '修改'
                    : '创建';
                return '您' + actionType + '的'
                    + action.getEntityDescription()
                    + '[<strong>]' + u.escape(entity.name) + '</strong>]'
                    + '已经成功保存';
            }
        };

        /**
         * 显示toast提示信息，这个方法会控制一个单例，以免信息叠在一起
         *
         * @param {string} content 显示的内容
         * @param {Object} options 配置
         * @ignore
         */
        function showToast(content, options) {
            var properties = {
                content: content,
                disposeOnHide: true,
                autoShow: true,
                duration: 3000
            };

            u.extend(properties, options);

            var toast = require('esui').create('Toast', properties);
            toast.show();
        }

        var ToastSubmitHandler = require('eoo').create(exports);

        return ToastSubmitHandler;
    }
);
