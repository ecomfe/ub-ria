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
         * 将一个符合一定规则的字符串转成`PascalCase`形式
         *
         * 输入字符串必须以空格、横线`-`、斜杠`/`或下划线`_`分割各单词，否则无法分析
         * 若输入的所有单词都是大写形式，则将每个单词分别转为小写形式后再进行转变
         *
         * @param {string} s 输入的字符串
         * @return {string}
         */
        util.pascalize = function (s) {
            s = s + '';
            if (/^[A-Z\s-\/_]+$/.test(s)) {
                s = s.toLowerCase();
            }
            s = s.replace(
                /[\s-\/_]+(.)/g,
                function (w, c) {
                    return c.toUpperCase();
                }
            );
            s = s.charAt(0).toUpperCase() + s.slice(1);
            return s;
        };
        util.pascalize = u.memoize(util.pascalize);

        /**
         * 将一个符合一定规则的字符串转成`camelCase`形式
         *
         * 此方法是将{@link util#pascalize}方法的输出首字母变为小写
         *
         * @param {string} s 输入的字符串
         * @return {string}
         */
        util.camelize = function (s) {
            s = util.pascalize(s);
            return s.charAt(0).toLowerCase() + s.slice(1);
        };
        util.camelize = u.memoize(util.camelize);

        /**
         * 将一个符合规则的字符串转成`split-by-dash`的横线分割形式
         *
         * 具体规则参考{@link util#pascalize}方法的说明
         *
         * 在此方法中，如果字符串出现多个连续的大写字母，则会将除最后一个字符以外的子串
         * 转成小写字母后再进行分割，因为连续的大写字母通常表示一个单词的缩写，不应当拆分，
         * 如`encodeURIComponent`在经过此方法处理后会变为`encode-uri-component`，
         * 而不是`encode-u-r-i-component`，前者拥有更好的可读性
         *
         * @param {string} s 输入的字符串
         * @return {string}
         */
        util.dasherize = function (s) {
            s = util.pascalize(s);
            // 这里把ABCD这种连续的大写，转成AbcD这种形式。
            // 如果`encodeURIComponent`，会变成`encodeUriComponent`，
            // 然后加横线后就是`encode-uri-component`得到正确的结果
            // 但是如果连续的大写串后没有其它字母，则将其第二个字母起全部转成小写
            s = s.replace(
                /[A-Z]{2,}$/g,
                function (match) {
                    return match.charAt(0)
                        + match.slice(1).toLowerCase();
                }
            );
            s = s.replace(
                /[A-Z]{2,}/g,
                function (match) {
                    return match.charAt(0)
                        + match.slice(1, -1).toLowerCase()
                        + match.charAt(match.length - 1);
                }
            );
            // 大写字符之间用横线连起来
            s = s.replace(
                /[A-Z]/g,
                function (match) {
                    return '-' + match.toLowerCase();
                }
            );
            if (s.charAt(0) === '-') {
                s = s.substring(1);
            }
            return s;
        };
        util.dasherize = u.memoize(util.dasherize);

        /**
         * 将一个符合规则的字符串转成`THIS_IS_A_CONST`的常量形式
         *
         * 具体规则参考{@link util#pascalize}方法的说明
         *
         * @param {string} s 输入的字符串
         * @return {string}
         */
        util.constlize = function (s) {
            s = util.pascalize(s);
            return s.toUpperCase();
        };
        util.constlize = u.memoize(util.constlize);

        /**
         * 将一个单词转为复数
         *
         * 如果单词结尾为`y`，则转为`ies`，其它情况下简单地加上`s`
         *
         * @param {string} s 输入的字符串
         * @return {string}
         */
        util.pluralize = function (s) {
            return s.replace(/y$/, 'ie') + 's';
        };
        util.pluralize = u.memoize(util.pluralize);

        /**
         * 格式化数字
         *
         * @param {number} number 输入的数字
         * @param {number} [decimals=0] 保留小数位数
         * @param {string} [emptyValue=""] 当输入为空或不是数字时的返回内容，会加前缀
         * @param {string} [prefix=""] 返回的字符串的前缀
         * @return {string}
         */
        util.formatNumber = function (number, decimals, emptyValue, prefix) {
            // 共6个重载：
            //
            // - `formatNumber(s)`
            // - `formatNumber(s, emptyValue)`
            // - `formatNumber(s, emptyValue, prefix)`
            // - `formatNumber(s, decimals)`
            // - `formatNumber(s, decimals, emptyValue)`
            // - `formatNumber(s, decimals, emptyValue, prefix)`
            //
            // 主要看第2个参数的类型，不是数字的话参数往前移1个
            if (typeof arguments[1] !== 'number') {
                prefix = arguments[2];
                emptyValue = arguments[1];
                decimals = 0;
            }
            prefix = prefix || '';
            emptyValue = emptyValue || '';

            if (number == null || isNaN(number)) {
                return prefix + emptyValue;
            }

            number = parseFloat(number).toFixed(decimals);
            // 分为整数和小数
            var parts = number.split('.');
            var integer = parts[0];
            var decimal = parts[1];
            // 加上千位分隔
            integer = integer.replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
            // 再拼起来
            var result = prefix + integer;
            if (decimal) {
                result += '.' + decimal;
            }
            return result;
        };

        /**
         * 当字符串未达到预期长度时，在前方填充补齐字符
         *
         * @param {string} s 输入字符串
         * @param {string} padding 补齐用的字符，只能是一个字符
         * @param {number} length 补齐后的长度
         * @return {string}
         */
        util.pad = function (s, padding, length) {
            s = s + '';
            var padLength = length - s.length;
            if (padLength > 0) {
                var left = new Array(padLength + 1).join(padding);
                return left + s;
            }
            else {
                return s;
            }
        };

        /**
         * 当字符串未达到预期长度时，在后方填充补齐字符
         *
         * @param {string} s 输入字符串
         * @param {string} padding 补齐用的字符，只能是一个字符
         * @param {number} length 补齐后的长度
         * @return {string}
         */
        util.padRight = function (s, padding, length) {
            s = s + '';
            var padLength = length - s.length;
            if (padLength > 0) {
                var right = new Array(padLength + 1).join(padding);
                return s + right;
            }
            else {
                return s;
            }
        };

        /**
         * 深度复制一个对象
         *
         * @param {Mixed} obj 任何对象
         * @return {Mixed} 复制后的对象
         */
        util.deepClone = function (obj) {
            // 非对象以及函数就直接返回
            if (!u.isObject(obj) || u.isFunction(obj) || u.isRegExp(obj)) {
                return obj;
            }

            if (u.isArray(obj)) {
                return u.map(obj, util.deepClone);
            }

            var clone = {};
            u.each(
                obj,
                function (value, key) {
                    clone[key] = util.deepClone(value);
                }
            );
            return clone;
        };

        return util;
    }
);
