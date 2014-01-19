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
        /**
         * 工具模块
         *
         * @class util
         * @singleton
         */
        var util = {};

        util.purify = function purify(object, defaults, deep) {
            defaults = defaults || empty;
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

        return util;
    }
);
