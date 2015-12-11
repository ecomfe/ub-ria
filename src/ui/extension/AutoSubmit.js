/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 让输入控件在特定事件下自动提交表单的扩展
 * @author otakustay
 */
define(
    function (require) {
        var u = require('../../util');
        var lib = require('esui/lib');
        var ui = require('esui');
        var Form = require('esui/Form');

        var store = {};

        /**
         * 让输入控件在特定事件下自动提交表单的扩展
         *
         * @class ui.extension.AutoSubmit
         * @extends esui.Extension
         */
        var exports = {};

        /**
         * @constructs ui.extension.AutoSubmit
         * @param {Object} [options] 配置项
         * @override
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
         * @member ui.extension.AutoSubmit#type
         * @type {string}
         * @readonly
         * @override
         */
        exports.type = 'AutoSubmit';

        /**
         * 指定对应的表单的id，不指定的话会进行自动查找，使用包含当前控件的main元素的`Form`控件
         *
         * @member ui.extension.AutoSubmit#form
         * @type {string | null}
         */
        exports.form = null;

        /**
         * 指定用于提交表单的事件名称，默认为`click`、`change`和`search`事件
         *
         * @member ui.extension.AutoSubmit#events
         * @type {string[]}
         */
        exports.events = ['click', 'change', 'search'];

        /**
         * 找到控件对应的`Form`控件
         *
         * @protected
         * @method ui.extension.AutoSubmit#resolveForm
         * @return {esui.Form}
         */
        exports.resolveForm = function () {
            if (this.form) {
                return this.target.viewContext.get(this.form);
            }

            // 如果没指定表单，就沿DOM结构向上找一个表单控件
            var element = this.target && this.target.main && this.target.main.parentNode;
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
         */
        function submit() {
            var form = this.resolveForm();
            if (form) {
                form.validateAndSubmit();
            }
        }

        /**
         * @override
         */
        exports.activate = function () {
            var handler = submit;
            //  对指定的 form 进行 debounce 限制
            if (this.form && this.debounce) {
                handler = store[this.form] || u.debounce(submit, 0);
                store[this.form] = handler;
            }
            u.each(
                this.events,
                function (eventName) {
                    this.target.on(eventName, handler, this);
                },
                this
            );

            this.$super(arguments);
        };

        /**
         * @override
         */
        exports.inactivate = function () {
            var handler = this.form && this.debounce ? store[this.form] : submit;
            u.each(
                this.events,
                function (eventName) {
                    this.target.un(eventName, handler, this);
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
