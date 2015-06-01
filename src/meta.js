/**
 * UB RIA Base
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 类定义辅助模块，不对外
 * @author otakustay
 */

export function definePropertyAccessor(obj, propertyName) {
    let symbol = Symbol(propertyName);
    Object.defineProperty(
        obj,
        propertyName,
        {
            get: function () {
                return this[symbol];
            },
            set: function (value) {
                this[symbol] = value;
            },
            enumerable: false,
            configurable: true
        }
    );
}
