/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 让输入控件在特定事件下自动提交表单的扩展
 * @author otakustay
 * @date $DATE$
 */
define(
    function (require) {
        var u = require('../../util');
        var lib = require('esui/lib');
        var ui = require('esui');
        var Form = require('esui/Form');

        /**
         * 让输入控件在特定事件下自动提交表单的扩展
         *
         * @class ui.extension.AutoSubmit
         * @extends esui.Extension
         */
        var exports = {};

        /**
         * @constructs ui.extension.AutoSubmit
         * @override
         * @param {Object} [options] 配置项
         */
        exports.constructor = function (options) {
            options = options || {};
            if (typeof options.events === 'string') {
                options.events = u.map(
                    lib.splitTokenList(options.events),
                    lib.trim
                );
            }

            this.$super(arguments);
        };

        /**
         * 扩展的类型，始终为`"AutoSubmit"`
         *
         * @type {string}
         * @override
         */
        exports.type = 'AutoSubmit';

        /**
         * 指定对应的表单的id，不指定的话会进行自动查找，
         * 使用包含当前控件的main元素的`Form`控件
         *
         * @type {string | null}
         */
        exports.form = null;

        /**
         * 指定用于提交表单的事件名称，默认为`click`、`change`和`search`事件
         *
         * @type {string[]}
         */
        exports.events = ['click', 'change', 'search'];

        /**
         * 找到控件对应的`Form`控件
         *
         * @return {esui.Form}
         */
        exports.resolveForm = function () {
            if (this.form) {
                return this.target.viewContext.get(this.form);
            }

            // 如果没指定表单，就沿DOM结构向上找一个表单控件
            var element = this.target
                && this.target.main
                && this.target.main.parentNode;
            while (element) {
                var control = ui.getControlByDOM(element);
                if (control && control instanceof Form) {
                    return control;
                }
                element = element.parentNode;
            }

            return null;
        };

        /**
         * 提交表单
         *
         * @param {esui.Control} this 触发事件的控件
         * @ignore
         */
        function submit() {
            var form = this.resolveForm();
            if (form) {
                form.validateAndSubmit();
            }
        }

        /**
         * 激活扩展
         *
         * @override
         */
        exports.activate = function () {
            u.each(
                this.events,
                function (eventName) {
                    this.target.on(eventName, submit, this);
                },
                this
            );

            this.$super(arguments);
        };

        /**
         * 取消激活
         *
         * @override
         */
        exports.inactivate = function () {
            u.each(
                this.events,
                function (eventName) {
                    this.target.un(eventName, submit, this);
                },
                this
            );

            this.$super(arguments);
        };

        var Extension = require('esui/Extension');
        var AutoSubmit = require('eoo').create(Extension, exports);

        require('esui').registerExtension(AutoSubmit);

        return AutoSubmit;
    }
);
