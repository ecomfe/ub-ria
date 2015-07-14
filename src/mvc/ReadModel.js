/**
 * UB RIA Base
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 只读页数据模型基类
 * @author otakustay
 */

import SingleEntityModel from './SingleEntityModel';
import {definePropertyAccessor} from '../meta';

// 全局所有Model都可能有的属性名，这些属性不需要被自动转为`'--'`
const GLOBAL_MODEL_PROPERTIES = new Map(['url', 'referrer', 'isChildAction', 'container', 'entity']);

/**
 * 只读页数据模型基类
 *
 * @class mvc.ReadModel
 * @extends mvc.SingleEntityModel
 */
export default class ReadModel extends SingleEntityModel {
    defaultDisplayText = '--';

    /**
     * 获取属性值
     *
     * @param {string} name 属性名称
     * @return {*} 对应属性的值，如果不存在属性则返回{@link ReadModel#defaultDisplayText}
     * @override
     */
    get(name) {
        if (GLOBAL_MODEL_PROPERTIES.has(name)) {
            return super.get(name);
        }

        return this.hasReadableValue(name) ? super.get(name) : this.defaultDisplayText;
    }
}

/**
 * 字段无值时的默认显示文本，默认为`"--"`
 *
 * @member mvc.ReadModel#defaultDisplayText
 * @type {string}
 */
definePropertyAccessor(ReadModel.prototype, 'defaultDisplayText');
