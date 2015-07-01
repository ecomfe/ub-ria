/**
 * UB RIA Base
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 只读页Action基类
 * @author lixiang
 */

import BaseAction from './BaseAction';
import {viewEvent} from './decorator';

/**
 * 只读Action基类
 *
 * @class mvc.ReadAction
 * @extends mvc.BaseAction
 */
export default class ReadAction extends BaseAction {
    category = 'read';

    /**
     * 点击返回后的处理
     *
     * @protected
     * @method mvc.ReadAction#returnBack
     */
    returnBack() {
        this.fire('back');
    }

    @viewEvent('return');
    [Symbol()]() {
        this.returnBack();
    }
}
