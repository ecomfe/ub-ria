/**
 * UB RIA Base
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file PartialForm控件
 * @author otakustay
 */

import ui from 'esui';
import lib from 'esui/lib';
import Form from 'esui/Form';
import ActionPanel from 'ef/ActionPanel';
import Validity from 'esui/validator/Validity';
import ValidityState from 'esui/validator/ValidityState';

function getHelperForm(action) {
    let properties = {
        main: lib.g(action.view.container),
        viewContext: action.view.viewContext
    };
    return new Form(properties);
}

/**
 * 局部表单控件
 *
 * 这控件本质上是个`ActionPanel`，但它表现得像是`InputControl`，因此可以用作表单的一部分，从而细粒度地切割表单的组成
 *
 * @class ui.PartialForm
 * @extends ef.ActionPanel
 */
export default class PartialForm extends ActionPanel {
    /**
     * 控件类型，始终为`"PartialForm"`
     *
     * @member ui.PartialForm#type
     * @type {string}
     * @readonly
     * @override
     */
    get type() {
        return 'PartialForm';
    }

    /**
     * 进行验证
     *
     * @method ui.PartialForm#validate
     * @return {boolean}
     */
    validate() {
        let action = this.get('action');

        if (!action) {
            return true;
        }

        if (typeof action.validate === 'function') {
            return action.validate();
        }

        // 标准的验证必须有`ViewContext`的协助
        let viewContext = action.view && action.view.viewContext;
        if (!viewContext) {
            return true;
        }

        let validity = new Validity();
        let event = {validity};
        this.fire('beforevalidate', event);

        // 拿子Action中的输入控件，看上去是一个hack，但工作的不错，
        // 就当是`Form`的特殊功能，把控件作为一种helper来用
        // TODO: 后续想想能不能整得更合理些
        let helperForm = getHelperForm(action);
        let inputs = helperForm.getInputControls();

        let isValid = true;
        for (let i = 0; i < inputs.length; i++) {
            let control = inputs[i];
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
    }

    /**
     * 向用户通知提交错误信息，默认根据`field`字段查找对应`name`的控件并显示错误信息
     *
     * @method ui.PartialForm#notifyErrors
     * @param {Object} errors 错误信息
     * @param {meta.FieldError[]} errors.fields 出现错误的字段集合
     * @param {string} [errors.message] 全局错误信息
     */
    notifyErrors(errors) {
        let action = this.get('action');
        let form = getHelperForm(action);

        let inputs = form.getInputControls();
        let fields = errors.fields;
        for (let i = 0; i < inputs.length && fields.length > 0; i++) {
            let input = inputs[i];
            if (typeof input.notifyErrors === 'function') {
                fields = input.notifyErrors(errors) || fields;
                continue;
            }
            for (let fail of fields) {
                if (input.name === fail.field) {
                    let state = new ValidityState(false, fail.message);
                    let validity = new Validity();
                    validity.addState('server', state);

                    if (typeof input.showValidity === 'function') {
                        input.showValidity(validity);
                    }
                }
            }
        }
    }

    /**
     * 获取值
     *
     * @method ui.PartialForm#getRawValue
     * @return {*}
     */
    getRawValue() {
        let action = this.get('action');
        if (!action) {
            return null;
        }

        if (typeof action.getRawValue === 'function') {
            return action.getRawValue();
        }

        if (typeof action.getValue === 'function') {
            return action.getValue();
        }
    }

    /**
     * 获取控件分类，伪装为表单控件
     *
     * @method ui.PartialForm#getCategory
     * @return {string} 始终返回`"input"`
     */
    getCategory() {
        return 'input';
    }
}

ui.register(PartialForm);
