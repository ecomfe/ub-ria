/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 只读页视图基类
 * @author otakustay
 */

import {bindControlEvent as on} from './decorator';
import BaseView from './BaseView';

/**
 * 只读页视图基类
 *
 * @class mvc.ReadView
 * @extends mvc.BaseView
 */
export default class ReadView extends BaseView {
    @on('return', 'click');
    [Symbol('onReturnClick')]() {
        this.fire('return');
    }
}
