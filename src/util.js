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
