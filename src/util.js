/**
 * UB RIA Base
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 工具模块
 * @author otakustay
 */

import underscore from 'underscore';

const EMPTY_OBJECT = {};

const TEMPLATE_SETTINGS = {
    interpolate: /\$\{(.+?)\}/g, // `${name}`直接输出
    escape: /\$\{\:(.+?)\}/g // `${:name}`提供HTML转义
};

/**
 * 工具对象
 *
 * @namespace util
 * @extends underscore
 */
let util = Object.create(underscore);

// 模板配置

/**
 * @override
 */
util.template = function (template, data) {
    return underscore.template(template, TEMPLATE_SETTINGS)(data);
};

/**
 * 清理对象中无用的键值对
 *
 * 默认会去除所有值为`null`、`undefined`以及空字符串`""`的键值对
 *
 * 如果提供了`defaults`参数，则额外去除值与`defaults`的同名属性相同的键值对
 *
 * @method util.purify
 * @param {Object} object 输入的对象
 * @param {Object} [defaults] 用于提供属性默认值的参照对象
 * @param {boolean} [deep=false] 是否深度清理，即遇到属性值为对象继续递归清理
 * @return {Object} 清理后的新对象
 */
util.purify = function purify(object, defaults, deep) {
    defaults = defaults || EMPTY_OBJECT;
    let purifiedObject = {};
    util.each(
        object,
        (value, key) => {
            let isDefaultNull = value == null || value === '';
            let isInDefaults = defaults.hasOwnProperty(key) && defaults[key] === value;
            if (!isDefaultNull && !isInDefaults) {
                if (deep && typeof value === 'object') {
                    purifiedObject[key] = purify(value, defaults[key], deep);
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
 * 将一个符合一定规则的字符串转成`PascalCase`形式
 *
 * 输入字符串必须以空格、横线`-`、斜杠`/`或下划线`_`分割各单词，否则无法分析
 * 若输入的所有单词都是大写形式，则将每个单词分别转为小写形式后再进行转变
 *
 * @method util.pascalize
 * @param {string} s 输入的字符串
 * @return {string}
 */
util.pascalize = function (s) {
    if (s == null || s === '') {
        return '';
    }

    s = s + '';
    if (/^[A-Z\s-\/_]+$/.test(s)) {
        s = s.toLowerCase();
    }
    s = s.replace(/[\s-\/_]+(.)/g, (w, c) => c.toUpperCase());
    s = s[0].toUpperCase() + s.slice(1);
    return s;
};
util.pascalize = util.memoize(util.pascalize);

/**
 * 将一个符合一定规则的字符串转成`camelCase`形式
 *
 * 此方法是将{@link util.pascalize}方法的输出首字母变为小写
 *
 * @method util.camelize
 * @param {string} s 输入的字符串
 * @return {string}
 */
util.camelize = function (s) {
    if (s == null || s === '') {
        return '';
    }

    s = util.pascalize(s);
    return s[0].toLowerCase() + s.slice(1);
};
util.camelize = util.memoize(util.camelize);

/**
 * 将一个符合规则的字符串转成`split-by-dash`的横线分割形式
 *
 * 具体规则参考{@link util.pascalize}方法的说明
 *
 * 在此方法中，如果字符串出现多个连续的大写字母，则会将除最后一个字符以外的子串
 * 转成小写字母后再进行分割，因为连续的大写字母通常表示一个单词的缩写，不应当拆分，
 * 如`encodeURIComponent`在经过此方法处理后会变为`encode-uri-component`，
 * 而不是`encode-u-r-i-component`，前者拥有更好的可读性
 *
 * @method util.dasherize
 * @param {string} s 输入的字符串
 * @return {string}
 */
util.dasherize = function (s) {
    if (s == null || s === '') {
        return '';
    }

    s = util.pascalize(s);
    // 这里把ABCD这种连续的大写，转成AbcD这种形式。
    // 如果`encodeURIComponent`，会变成`encodeUriComponent`，
    // 然后加横线后就是`encode-uri-component`得到正确的结果
    // 但是如果连续的大写串后没有其它字母，则将其第二个字母起全部转成小写
    s = s.replace(/[A-Z]{2,}$/g, (match) => match[0] + match.slice(1).toLowerCase());
    s = s.replace(/[A-Z]{2,}/g, (match) => match[0] + match.slice(1, -1).toLowerCase() + match[match.length - 1]);
    // 大写字符之间用横线连起来
    s = s.replace(/[A-Z]/g, (match) => '-' + match.toLowerCase());
    if (s[0] === '-') {
        s = s.substring(1);
    }
    return s;
};
util.dasherize = util.memoize(util.dasherize);

/**
 * 将一个符合规则的字符串转成`THIS_IS_A_CONST`的常量形式
 *
 * 具体规则参考{@link util.pascalize}方法的说明
 *
 * @method util.constlize
 * @param {string} s 输入的字符串
 * @return {string}
 */
util.constlize = function (s) {
    if (s == null || s === '') {
        return '';
    }

    s = util.dasherize(s).replace(/-/g, '_');
    return s.toUpperCase();
};
util.constlize = util.memoize(util.constlize);

/**
 * 将一个单词转为复数
 *
 * 如果单词结尾为`y`，则转为`ies`，其它情况下简单地加上`s`
 *
 * @method util.pluralize
 * @param {string} s 输入的字符串
 * @return {string}
 */
util.pluralize = function (s) {
    if (s == null || s === '') {
        return '';
    }

    return s.replace(/y$/, 'ie') + 's';
};
util.pluralize = util.memoize(util.pluralize);

/**
 * 格式化数字
 *
 * @method util.formatNumber
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
    let [integer, decimal] = number.split('.');
    // 加上千位分隔
    integer = integer.replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
    // 再拼起来
    let result = prefix + integer;
    if (decimal) {
        result += '.' + decimal;
    }
    return result;
};

/**
 * 当字符串未达到预期长度时，在前方填充补齐字符
 *
 * @method util.pad
 * @param {string} s 输入字符串
 * @param {string} padding 补齐用的字符，只能是一个字符
 * @param {number} length 补齐后的长度
 * @return {string}
 */
util.pad = function (s, padding, length) {
    s = (s == null ? '' : s) + '';
    let padLength = length - s.length;
    if (padLength > 0) {
        return padding.repeat(padLength) + s;
    }

    return s;
};

/**
 * 当字符串未达到预期长度时，在后方填充补齐字符
 *
 * @method util.padRight
 * @param {string} s 输入字符串
 * @param {string} padding 补齐用的字符，只能是一个字符
 * @param {number} length 补齐后的长度
 * @return {string}
 */
util.padRight = function (s, padding, length) {
    s = (s == null ? '' : s) + '';
    let padLength = length - s.length;
    if (padLength > 0) {
        return s + padding.repeat(padLength);
    }

    return s;
};

/**
 * 深度复制一个对象
 *
 * @method util.deepClone
 * @param {*} obj 任何对象
 * @return {*} 复制后的对象
 */
util.deepClone = function (obj) {
    // 非对象以及函数就直接返回
    if (!util.isObject(obj) || util.isFunction(obj) || util.isRegExp(obj)) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(util.deepClone);
    }

    let clone = {};
    util.each(obj, (value, key) => clone[key] = util.deepClone(value));
    return clone;
};

util.transformPlainObjectToStructured = function (obj) {
    let result = {};

    let addDeepProperty = (keyPath, value) => {
        let container = result;
        keyPath = keyPath.split('.');
        // 最后一个是真正的`key`，前面的都是一层层创建容器对象
        let actualPropertyName = keyPath.pop();
        // 这里用递归的话蛮损性能的，循环也还算直接，就用循环了
        util.each(
            keyPath,
            (key) => {
                if (!container.hasOwnProperty(key)) {
                    container[key] = {};
                }
                container = container[key];
            }
        );
        container[actualPropertyName] = value;
    };

    util.each(
        obj,
        (value, key) => {
            if (key.indexOf('.') >= 0) {
                addDeepProperty(key, value);
            }
            else {
                result[key] = value;
            }
        }
    );

    return result;
};

export default util;
