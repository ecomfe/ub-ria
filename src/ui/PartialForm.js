/**
 * ADM 2.0
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file PartialForm控件
 * @author zhanglili(otakustay@gmail.com)
 */
define(
    function (require) {
        var lib = require('esui/lib');

        /**
         * 局部表单控件
         *
         * 这控件本质上是个`ActionPanel`，但它表现得像是`InputControl`，因此可以用作表单的一部分，从而细粒度地切割表单的组成
         *
         * @class ui.PartialForm
         * @extends ef.ActionPanel
         */
        var exports = {};

        /**
         * 控件类型，始终为`"PartialForm"`
         *
         * @member ui.PartialForm#type
         * @type {string}
         * @readonly
         * @override
         */
        exports.type = 'PartialForm';

        function getHelperForm(action) {
            var Form = require('esui/Form');
            var properties = {
                main: lib.g(action.view.container),
                viewContext: action.view.viewContext
            };
            return new Form(properties);
        }

        /**
         * 进行验证
         *
         * @method ui.PartialForm#validate
         * @return {boolean}
         */
        exports.validate = function () {
            var action = this.get('action');

            if (!action) {
                return true;
            }

            if (typeof action.validate === 'function') {
                return action.validate();
            }

            // 标准的验证必须有`ViewContext`的协助
            var viewContext = action.view && action.view.viewContext;
            if (!viewContext) {
                return true;
            }

            var Validity = require('esui/validator/Validity');
            var validity = new Validity();
            var event = {
                validity: validity
            };
            this.fire('beforevalidate', event);

            // 拿子Action中的输入控件，看上去是一个hack，但工作的不错，
            // 就当是`Form`的特殊功能，把控件作为一种helper来用
            // TODO: 后续想想能不能整得更合理些
            var helperForm = getHelperForm(action);
            var inputs = helperForm.getInputControls();

            var isValid = true;
            for (var i = 0; i < inputs.length; i++) {
                var control = inputs[i];
                 // 不对disabled的控件进行验证
                if (control.isDisabled()) {
                    continue;
                }

                isValid &= control.validate();
            }

            if (!isValid) {
                this.fire('invalid', event);
            }

            this.fire('aftervalidate', event);

            return isValid;
        };

        /**
         * 向用户通知提交错误信息，默认根据`field`字段查找对应`name`的控件并显示错误信息
         *
         * @method ui.PartialForm#notifyErrors
         * @param {Object} errors 错误信息
         * @param {meta.FieldError[]} errors.fields 出现错误的字段集合
         * @param {string} [errors.message] 全局错误信息
         */
        exports.notifyErrors = function (errors) {
            var Validity = require('esui/validator/Validity');
            var ValidityState = require('esui/validator/ValidityState');
            var action = this.get('action');
            var form = getHelperForm(action);

            var inputs = form.getInputControls();
            var fields = errors.fields;
            for (var i = 0; i < inputs.length && fields.length > 0; i++) {
                var input = inputs[i];
                if (typeof input.notifyErrors === 'function') {
                    fields = input.notifyErrors(errors) || fields;
                    continue;
                }
                for (var j = 0; j < fields.length; j++) {
                    var fail = fields[j];
                    if (input.name === fail.field) {
                        var state = new ValidityState(false, fail.message);
                        var validity = new Validity();
                        validity.addState('server', state);

                        if (typeof input.showValidity === 'function') {
                            input.showValidity(validity);
                        }
                    }
                }
            }
        };

        /**
         * 获取值
         *
         * @method ui.PartialForm#getRawValue
         * @return {*}
         */
        exports.getRawValue = function () {
            var action = this.get('action');
            if (!action) {
                return null;
            }

            if (typeof action.getRawValue === 'function') {
                return action.getRawValue();
            }

            if (typeof action.getValue === 'function') {
                return action.getValue();
            }
        };

        /**
         * 获取控件分类，伪装为表单控件
         *
         * @method ui.PartialForm#getCategory
         * @return {string} 始终返回`"input"`
         */
        exports.getCategory = function () {
            return 'input';
        };

        var ActionPanel = require('ef/ActionPanel');
        var PartialForm = require('eoo').create(ActionPanel, exports);

        require('esui').register(PartialForm);

        return PartialForm;
    }
);
