/**
 * UB RIA Base
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file 子视图基类
 * @author liyidong
 */

import u from '../util';
import BaseView from './BaseView';
import Validity from 'esui/validator/Validity';
import ValidityState from 'esui/validator/ValidityState';

/**
 * 判断是否为输入控件
 *
 * @param {Control} control 控件
 * @return {boolean}
 */
let isInputControl = (control) => {
    let category = control.getCategory();
    return category === 'input' || category === 'check';
};

/**
 * @class mvc.BaseChildView
 * @extends ef.UIView
 */
export default class BaseChildView extends BaseView {
    /**
     * 获取view数据的接口
     *
     * @method mvc.BaseChildView#getViewData
     * @return {Object}
     */
    getViewData() {
        // 默认实现为返回所有类型为InputControll控件的RawValue值，key为控件的name
        let store = {};
        let inputs = this.getAllInputControls();

        for (let control of inputs) {
            // 排除未选中的选择框控件
            if (control.getCategory() === 'check' && !control.isChecked()) {
                continue;
            }

            // 不需要禁用了的控件的值
            if (control.isDisabled()) {
                continue;
            }

            let name = control.get('name');
            let value = control.getRawValue();
            if (store.hasOwnProperty(name)) {
                store[name] = [...store[name], value];
            }
            else {
                store[name] = value;
            }
        }

        return store;
    }

    /**
     * 获取view数据的接口
     *
     * @method mvc.BaseChildView#setViewData
     * @param {Object} values 控件name与value组成的对象
     */
    setViewData(values) {
        // 默认实现
        u.each(
            values,
            (value, key) => {
                key = u.dasherize(key);
                this.get(key).set('rawValue', value);
            }
        );
    }

    /**
     * disable当前View下所有控件
     *
     * @method mvc.BaseChildView#disableInputControls
     */
    disableInputControls() {
        // 默认实现为将所有类型为InputControll控件设置为disable状态
        let inputs = this.getAllInputControls();

        u.each(
            inputs,
            (control) => {
                if (u.isFunction(control.disable)) {
                    control.disable();
                }
            }
        );
    }

    /**
     * enable当前View下所有控件
     *
     * @method mvc.BaseChildView#enableInputControls
     */
    enableInputControls() {
        // 默认实现为将所有类型为InputControll控件设置为enable状态
        let inputs = this.getAllInputControls();

        u.each(
            inputs,
            (control) => {
                if (u.isFunction(control.enable)) {
                    control.enable();
                }
            }
        );
    }

    /**
     * setReadOnly当前View下所有控件
     *
     * @method mvc.BaseChildView#setReadOnly
     * @param {boolean} status 设置的readOnly状态
     */
    setReadOnly(status) {
        // 默认实现为将所有类型为InputControll控件设置为status所规定的readOnly状态
        let inputs = this.getAllInputControls();

        u.each(
            inputs,
            (control) => {
                if (u.isFunction(control.setReadOnly)) {
                    control.setReadOnly(status);
                }
            }
        );
    }

    /**
     * 向用户通知提交错误信息
     *
     * @method mvc.BaseChildView#notifyErrors
     * @param {Array.<Object>} errors 错误信息数组
     */
    notifyErrors(errors) {
        for (let fail of errors) {
            let inputId = u.dasherize(fail.field);
            let input = this.get(inputId);

            if (input) {
                let state = new ValidityState(false, fail.message);
                let validity = new Validity();
                validity.addState('server', state);

                input.showValidity(validity);
            }
        }
    }

    /**
     * 触发当前View下所有控件的自身校验
     *
     * @method mvc.BaseChildView#validate
     * @return {boolean} 控件的验证状态
     */
    validate() {
        let inputs = this.getAllInputControls();
        let result = true;

        for (let control of inputs) {
             // 不对disabled的控件进行验证
            if (control.isDisabled()) {
                continue;
            }

            result &= control.validate();
        }

        return !!result;
    }

    /**
     * 获取当前视图下所有的InputControl控件
     *
     * @method mvc.BaseChildView#getAllInputControls
     * @return {Array.<Control>} 所有InputControl控件
     */
    getAllInputControls() {
        let controls = this.viewContext.getControls();
        let inputs = [];

        u.each(
            controls,
            (control) => {
                if (isInputControl(control)) {
                    inputs.push(control);
                }
            }
        );

        return inputs;
    }
}
