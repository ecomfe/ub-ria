/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 表单视图基类
 * @author otakustay
 * @date $DATE$
 */
define(
    function (require) {
        var util = require('er/util');
        var BaseView = require('./BaseView');

        // 使用表单视图，有以下要求：
        //
        // - 有id为`form`的`Form`控件
        // - 所有触发提交的按钮，会触发`form`的`submit`事件
        //
        // 可选：
        //
        // - 可以有一个id为`cancel`的按钮，点击后会触发`cancel`事件

        /**
         * 表单视图基类
         *
         * @extends BaseView
         * @constructor
         */
        function FormView() {
            BaseView.apply(this, arguments);
        }

        util.inherits(FormView, BaseView);

        /**
         * 从表单中获取实体数据
         *
         * @return {Object}
         */
        FormView.prototype.getEntity = function () {
            return this.getFormData();
        };

        /**
         * 向用户通知提交错误信息，默认根据`field`字段查找对应`name`的控件并显示错误信息
         *
         * @param {Object} errors 错误信息
         * @param {meta.FieldError[]} errors.fields 出现错误的字段集合
         */
        FormView.prototype.notifyErrors = function (errors) {
            var Validity = require('esui/validator/Validity');
            var ValidityState = require('esui/validator/ValidityState');
            var form = this.get('form');

            for (var i = 0; i < errors.fields.length; i++) {
                var fail = errors.fields[i];

                var state = new ValidityState(false, fail.message);
                var validity = new Validity();
                validity.addState('server', state);

                var input = form.getInputControls(fail.field)[0];
                if (input && typeof input.showValidity === 'function') {
                    input.showValidity(validity);
                }
            }
        };


        /**
         * 等待用户取消确认
         *
         *
         * @return {er.Promise} 一个`Promise`对象，用户确认则进入`resolved`状态，
         * 用户取消则进入`rejected`状态
         */
        FormView.prototype.waitCancelConfirm = function (options) {
            this.waitConfirm(options);
        }

        /**
         * 取消编辑
         */
        function cancelEdit() {
            this.fire('cancel');
        }

        /**
         * 提交数据
         */
        function submit() {
            this.fire('submit');
        }

        /**
         * 绑定控件事件
         *
         * @override
         */
        FormView.prototype.bindEvents = function () {
            var form = this.get('form');
            if (form) {
                form.on('submit', submit, this);
            }

            var cancelButton = this.get('cancel');
            if (cancelButton) {
                cancelButton.on('click', cancelEdit, this);
            }

            BaseView.prototype.bindEvents.apply(this, arguments);
        };

        /**
         * 禁用提交操作
         */
        FormView.prototype.disableSubmit = function () {
            if (this.viewContext) {
                this.getGroup('submit').disable();
            }
        };

        /**
         * 启用提交操作
         */
        FormView.prototype.enableSubmit = function () {
            if (this.viewContext) {
                this.getGroup('submit').enable();
            }
        };

        /**
         * 获取表单数据
         *
         * @return {Object}
         */
        FormView.prototype.getFormData = function () {
            var form = this.get('form');
            return form ? form.getData() : {};
        };

        return FormView;
    }
);
