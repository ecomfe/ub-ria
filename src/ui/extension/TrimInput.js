/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 文本框控件自动去除首尾空格
 * @author lixiang(lixiang05@baidu.com)
 */

import ui from 'esui';
import InputControl from 'esui/InputControl';
import Extension from 'esui/Extension';

function trim() {
    let trimedValue = this.target.getValue().trim();
    this.target.setValue(trimedValue);
}

/**
 * 文本框自动去除首尾空格扩展
 *
 * @class ui.extension.TrimInput
 * @extends esui.Extension
 */
export default class TrimInput extends Extension {
    /**
     * 扩展的类型，始终为`"TrimInput"`
     *
     * @member ui.extension.TrimInput#type
     * @type {string}
     * @readonly
     * @override
     */
    get type() {
        return 'TrimInput';
    }

    /**
     * @override
     */
    activate() {
        let target = this.target;
        // 暂时只对`InputControl`控件生效
        if (!(target instanceof InputControl)) {
            return;
        }

        target.on('afterrender', trim, this);
        target.on('change', trim, this);

        super.activate();
    }

    /**
     * @override
     */
    inactivate() {
        let target = this.target;
        // 只对`InputControl`控件生效
        if (!(target instanceof InputControl)) {
            return;
        }

        target.un('afterrender', trim, this);
        target.un('change', trim, this);

        super.inactivate();
    }
}

ui.registerExtension(TrimInput);
