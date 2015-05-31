/**
 * UB RIA Base
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 计算文本框可输入字符的扩展
 * @author otakustay
 */

import ui from 'esui';
import lib from 'esui/lib';
import Validity from 'esui/validator/Validity';
import Extension from 'esui/Extension';

/**
 * 检查长度并显示提示信息
 */
function checkLength() {
    let maxLength = this.getMaxLength();
    let currentLength = this.target.getValue().length;

    let data = {
        max: maxLength,
        current: currentLength,
        available: maxLength - currentLength
    };

    let validState = data.available < 0 ? 'error' : 'hint';
    let message = this.getHintMessage(data);

    let validity = new Validity();
    validity.setCustomValidState(validState);
    validity.setCustomMessage(message);

    this.target.showValidity(validity);
}

/**
 * 计算文本框可输入字符的扩展
 *
 * @class ui.extension.WordCount
 * @extends esui.Extension
 */
export default class WordCount extends Extension {
    /**
     * 扩展的类型，始终为`"WordCount"`
     *
     * @member ui.extension.WordCount#type
     * @type {string}
     * @readonly
     * @override
     */
    get type() {
        return 'WordCount';
    }

    /**
     * 设置未输入字符时的提示信息模板，可用以下占位符：
     *
     * - `${available}`：表示可输入字符个数
     * - `${current}`：表示已输入的字符个数
     * - `${max}`：表示最大可输入字符个数
     *
     * @member ui.extension.WordCount#initialTemplate
     * @type {string}
     */
    initialTemplate = '最多可输入${available}个字符';

    /**
     * 设置还可以输入字符时的提示信息模板，可用以下占位符：
     *
     * - `${available}`：表示剩余字符个数
     * - `${current}`：表示已输入的字符个数
     * - `${max}`：表示最大可输入字符个数
     *
     * @member ui.extension.WordCount#remainingTemplate
     * @type {string}
     */
    remainingTemplate = '还可输入${available}个字符';

    /**
     * 设置已超出可输入字符限制时的提示信息模板，可用以下占位符：
     *
     * - `${available}`：表示超出的字符数
     * - `${current}`：表示已输入的字符个数
     * - `${max}`：表示最大可输入字符个数
     *
     * @member ui.extension.WordCount#exceededTemplate
     * @type {string}
     */
    exceededTemplate = '已超出${available}个字符';

    /**
     * 获取提示信息
     *
     * @protected
     * @method ui.extension.WordCount#getHintMessage
     * @param {Object} data 长度计算的相关数据
     * @param {number} data.available 还可输入的字符个数，已超出时为负数
     * @param {number} data.current 已经输入的字符个数
     * @param {number} data.max 最大可输入的字符个数
     * @return {string}
     */
    getHintMessage(data) {
        let template;
        if (!data.current) {
            template = this.initialTemplate;
        }
        else if (data.available >= 0) {
            template = this.remainingTemplate;
        }
        else {
            template = this.exceededTemplate;
            data.available = -data.available;
        }

        return lib.format(template, data);
    }

    /**
     * 获取最大可输入字符数
     *
     * @protected
     * @method ui.extension.WordCount#getMaxLength
     * @return {number}
     */
    getMaxLength() {
        if (+this.target.get('maxLength') === -1) {
            return this.target.get('length');
        }
        return this.target.get('maxLength');
    }


    /**
     * @override
     */
    activate() {
        let maxLength = this.getMaxLength();

        if (maxLength) {
            this.target.on('input', checkLength, this);
            this.target.on('afterrender', checkLength, this);
        }

        super.activate();
    }

    /**
     * @override
     */
    inactivate() {
        this.target.un('input', checkLength, this);
        this.target.un('afterrender', checkLength, this);

        super.inactivate();
    }
}

ui.registerExtension(WordCount);
