/**
 * UB RIA Base
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 让输入控件在特定事件下自动提交表单的扩展
 * @author otakustay
 */

import u from '../../util';
import ui from 'esui';
import lib from 'esui/lib';
import Form from 'esui/Form';
import Extension from 'esui/Extension';
import {definePropertyAccessor} from '../../meta';

/**
 * 提交表单
 *
 * @param {esui.Control} this 触发事件的控件
 */
function submit() {
    let form = this.resolveForm();
    if (form) {
        form.validateAndSubmit();
    }
}

/**
 * 让输入控件在特定事件下自动提交表单的扩展
 *
 * @class ui.extension.AutoSubmit
 * @extends esui.Extension
 */
export default class AutoSubmit extends Extension {

    /**
     * 扩展的类型，始终为`"AutoSubmit"`
     *
     * @member ui.extension.AutoSubmit#type
     * @type {string}
     * @readonly
     * @override
     */
    get type() {
        return 'AutoSubmit';
    }

    /**
     * 指定用于提交表单的事件名称，默认为`click`、`change`和`search`事件
     *
     * @member ui.extension.AutoSubmit#events
     * @type {string[]}
     */
    events = ['click', 'change', 'search'];

    /**
     * @constructs ui.extension.AutoSubmit
     * @param {Object} [options] 配置项
     * @override
     */
    constructor(options = {}) {
        super(options);

        if (typeof options.events === 'string') {
            options.events = lib.splitTokenList(options.events);
        }
    }

    /**
     * 找到控件对应的`Form`控件
     *
     * @protected
     * @method ui.extension.AutoSubmit#resolveForm
     * @return {esui.Form}
     */
    resolveForm() {
        if (this.form) {
            return this.target.viewContext.get(this.form);
        }

        // 如果没指定表单，就沿DOM结构向上找一个表单控件
        let element = this.target && this.target.main && this.target.main.parentNode;
        while (element) {
            let control = ui.getControlByDOM(element);
            if (control && control instanceof Form) {
                return control;
            }
            element = element.parentNode;
        }

        return null;
    }

    /**
     * @override
     */
    activate() {
        u.each(this.events, (eventName) => this.target.on(eventName, submit, this));

        super.activate();
    }

    /**
     * @override
     */
    inactivate() {
        u.each(this.events, (eventName) => this.target.un(eventName, submit, this));

        super.inactivate();
    }
}

/**
 * 指定对应的表单的id，不指定的话会进行自动查找，使用包含当前控件的main元素的`Form`控件
 *
 * @member ui.extension.AutoSubmit#form
 * @type {string | null}
 */
definePropertyAccessor(AutoSubmit.prototype, 'form');

ui.registerExtension(AutoSubmit);
