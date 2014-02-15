/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @ignore
 * @file 工具模块
 * @author otakustay
 */
define(
    function (require) {
        var u = require('underscore');
        
        var EMPTY_OBJECT = {};

        /**
         * 工具模块
         *
         * @class util
         * @singleton
         */
        var util = {};

        /**
         * 清理对象中无用的键值对
         *
         * 默认会去除所有值为`null`、`undefined`以及空字符串`""`的键值对
         *
         * 如果提供了`defaults`参数，则额外去除值与`defaults`的同名属性相同的键值对
         *
         * @param {Object} object 输入的对象
         * @param {Object} [defaults] 用于提供属性默认值的参照对象
         * @param {boolean} [deep=false] 是否深度清理，即遇到属性值为对象继续递归清理
         * @return {Object} 清理后的新对象
         */
        util.purify = function purify(object, defaults, deep) {
            defaults = defaults || EMPTY_OBJECT;
            var purifiedObject = {};
            u.each(
                object,
                function (value, key) {
                    var isDefaultNull = 
                        value == null || value === '';
                    var isInDefaults = 
                        defaults.hasOwnProperty(key) && defaults[key] === value;
                    if (!isDefaultNull && !isInDefaults) {
                        if (deep && typeof value === 'object') {
                            purifiedObject[key] = 
                                purify(value, defaults[key], deep);
                        }
                        else {
                            purifiedObject[key] = value;
                        }
                    }
                }
            );
            return purifiedObject;
        };

        /**
         * 去除字符串首尾空格
         *
         * @param {string} s 输入字符串
         * @return {string}
         */
        util.trim = function (s) {
            return s.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
        };

        /**
         * 深度复制一个对象
         *
         * @param {Mixed} obj 任何对象
         * @return {Mixed} 复制后的对象
         */
        u.deepClone = function (obj) {
            // 非对象以及函数就直接返回
            if (!u.isObject(obj) || u.isFunction(obj)) {
                return obj;
            }

            if (u.isArray(obj)) {
                return u.map(obj, u.deepClone);
            }

            var clone = {};
            u.each(
                obj,
                function (value, key) {
                    clone[key] = u.deepClone(value);
                }
            );
            return clone;
        };

        return util;
    }
);
