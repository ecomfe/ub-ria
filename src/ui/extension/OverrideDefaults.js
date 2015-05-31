/**
 * UB RIA Base
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 重写控件默认配置用的扩展
 * @author otakustay
 */

import u from '../../util';
import ui from 'esui';
import Extension from 'esui/Extension';

function onInit(e) {
    this.overrideDefaults(e.options);
}

/**
 * 重写控件默认配置用的扩展
 *
 * @class ui.extension.OverrideDefaults
 * @extends esui.Extension
 */
export default class OverrideDefaults extends Extension {
    /**
     * 扩展的类型，始终为`"OverrideDefaults"`
     *
     * @member ui.extension.OverrideDefaults#type
     * @type {string}
     * @readonly
     * @override
     */
    get type() {
        return 'OverrideDefaults';
    }

    /**
     * @override
     */
    activate() {
        this.target.on('init', onInit, this);

        super.activate();
    }

    /**
     * @override
     */
    inactivate() {
        this.target.un('init', onInit, this);

        super.inactivate();
    }

    /**
     * 重写默认属性
     *
     * @protected
     * @method ui.extension.OverrideDefaults#overrideDefaults
     * @param {Object} [rawOptions] 初始化控件时传入的参数
     */
    overrideDefaults(rawOptions = {}) {
        // 只有初始化时没有显式指定的才覆盖
        let overrides = u.omit(this.overrides[this.target.type], u.keys(rawOptions));
        if (overrides) {
            this.target.setProperties(overrides);
        }
    }
}

ui.registerExtension(OverrideDefaults);
