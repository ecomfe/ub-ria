/**
 * UB RIA Base
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file 子视图基类
 * @exports mvc.BaseChildView
 * @author liyidong
 */
define(
    function (require) {
        var u = require('../util');

        /**
         * @class mvc.BaseChildView
         * @extends ef.UIView
         */
        var exports = {};

        /**
         * 获取view数据的接口
         *
         * @public
         * @method mvc.BaseChildView#getViewData
         * @return {Object}
         */
        exports.getViewData = function () {
            // 默认实现为返回所有类型为InputControll控件的RawValue值，key为控件的name
            var store = {};
            var inputs = this.getAllInputControls();

            for (var i = 0, length = inputs.length; i < length; i++) {
                var control = inputs[i];

                // 排除未选中的选择框控件
                if (control.getCategory() === 'check' && !control.isChecked()) {
                    continue;
                }

                // 不需要禁用了的控件的值
                if (control.isDisabled()) {
                    continue;
                }

                var name = control.get('name');
                var value = control.getRawValue();
                if (store.hasOwnProperty(name)) {
                    store[name] = [].concat(store[name], value);
                }
                else {
                    store[name] = value;
                }
            }

            return store;
        };

        /**
         * 获取view数据的接口
         *
         * @public
         * @method mvc.BaseChildView#setViewData
         * @param {Object} values 控件name与value组成的对象
         */
        exports.setViewData = function (values) {
            // 默认实现
            u.each(
                values,
                function (value, key) {
                    var key = u.dasherize(key);
                    this.get(key).set('rawValue', value);
                },
                this
            );
        };

        /**
         * disable当前View下所有控件
         *
         * @public
         * @method mvc.BaseChildView#disableInputControls
         */
        exports.disableInputControls = function () {
            // 默认实现为将所有类型为InputControll控件设置为disable状态
            var inputs = this.getAllInputControls();

            u.each(
                inputs,
                function (control) {
                    if (u.isFunction(control.disable)) {
                        control.disable();
                    }
                }
            );
        };

        /**
         * enable当前View下所有控件
         *
         * @public
         * @method mvc.BaseChildView#enableInputControls
         */
        exports.enableInputControls = function () {
            // 默认实现为将所有类型为InputControll控件设置为enable状态
            var inputs = this.getAllInputControls();

            u.each(
                inputs,
                function (control) {
                    if (u.isFunction(control.enable)) {
                        control.enable();
                    }
                }
            );
        };

        /**
         * setReadOnly当前View下所有控件
         *
         * @public
         * @method mvc.BaseChildView#setReadOnly
         * @param {boolean} status 设置的readOnly状态
         */
        exports.setReadOnly = function (status) {
            // 默认实现为将所有类型为InputControll控件设置为status所规定的readOnly状态
            var inputs = this.getAllInputControls();

            u.each(
                inputs,
                function (control) {
                    if (u.isFunction(control.setReadOnly)) {
                        control.setReadOnly(status);
                    }
                }
            );
        };

        /**
         * 向用户通知提交错误信息
         *
         * @public
         * @method mvc.BaseChildView#notifyErrors
         * @param {Array.<Object>} errors 错误信息数组
         */
        exports.notifyErrors = function (errors) {
            var Validity = require('esui/validator/Validity');
            var ValidityState = require('esui/validator/ValidityState');

            for (var i = 0; i < errors.length; i++) {
                var fail = errors[i];
                var state = new ValidityState(false, fail.message);
                var validity = new Validity();
                validity.addState('server', state);

                var inputId = u.dasherize(fail.field);
                var input = this.get(inputId);

                if (input) {
                    input.showValidity(validity);
                }
            }
        };

        /**
         * 触发当前View下所有控件的自身校验
         *
         * @public
         * @method mvc.BaseChildView#validate
         * @return {boolean} 控件的验证状态
         */
        exports.validate = function () {
            var inputs = this.getAllInputControls();
            var result = true;

            for (var i = 0; i < inputs.length; i++) {
                var control = inputs[i];
                 // 不对disabled的控件进行验证
                if (control.isDisabled()) {
                    continue;
                }

                result &= control.validate();
            }

            return !!result;
        };

        /**
         * 获取当前视图下所有的InputControl控件
         *
         * @public
         * @method mvc.BaseChildView#getAllInputControls
         * @return {Array.<Control>} 所有InputControl控件
         */
        exports.getAllInputControls = function () {
            var controls = this.viewContext.getControls();
            var inputs = [];

            u.each(
                controls,
                function (control) {
                    if (isInputControl(control)) {
                        inputs.push(control);
                    }
                }
            );

            return inputs;
        };

        /**
         * 判断是否为输入控件
         *
         * @param {Control} control 控件
         * @return {boolean}
         */
        function isInputControl(control) {
            var category = control.getCategory();
            return category === 'input' || category === 'check';
        }

        var UIView = require('ef/UIView');
        var BaseChildView = require('eoo').create(UIView, exports);

        return BaseChildView;
    }
);
