/**
 * UB RIA Base
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 通用装饰器集合
 * @author otakustay
 */

import u from './util';

export function memoize(hasher) {
    return function (target, key, descriptor) {
        if (descriptor.get) {
            descriptor.get = u.memoize(descriptor.get, hasher);
        }
        else if (typeof descriptor.value === 'function') {
            descriptor.value = u.memoize(descriptor.value, hasher);
        }

        return descriptor;
    };
}

/**
 * 类属性访问器方法装饰器
 *
 * @param {string} propertyName 属性名
 * @return {Function}
 */
export function accessorMethod(propertyName) {
    if (typeof propertyName !== 'string' || !propertyName) {
        throw new Error('Name of accessor must be provided');
    }

    return target => {
        // 属性映射为实例上的private属性
        let privateProperty = Symbol(propertyName);

        let getter = function () {
            return this[privateProperty];
        };

        let setter = function (value) {
            this[privateProperty] = value;
        };

        let upperName = propertyName.charAt(0).toUpperCase() + propertyName.slice(1);

        target.prototype[`get${upperName}`] = getter;
        target.prototype[`set${upperName}`] = setter;
    };
}

/**
 * 类属性访问器装饰器
 *
 * @param {string} propertyName 属性名
 * @return {Function}
 */
export function accessorProperty(propertyName) {
    if (typeof propertyName !== 'string' || !propertyName) {
        throw new Error('Name of accessor must be provided');
    }

    return target => {
        // 属性映射为实例上的private属性
        let privateProperty = Symbol(propertyName);
        let descriptor = {
            get() {
                return this[privateProperty];
            },

            set(value) {
                this[privateProperty] = value;
            },

            enumerable: false
        };

        Object.defineProperty(target.prototype, propertyName, descriptor);
    };
}
