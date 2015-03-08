/**
 * UB RIA Base
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file 正则校验器
 * @author yanghuabei(yanghuabei@baidu.com)
 */
define(
    function (require) {
        var checker = {
            name: 'pattern',
            errorMessage: '${title}格式不符合要求',
            priority: 30,
            check: check
        };

        /**
         * 正则检验器，value为null、undefined、''时，返回true
         *
         * @param {string | number} value 待检验的值
         * @param {Array} schema 字段的定义、约束, 长度为3的数组
         * @return {boolean} 检验成功返回true，失败返回false
         */
        function check(value, schema) {
            // 如果value为null, undefined, '', 不做检查
            if (!value && value !== 0) {
                return true;
            }

            var regex = new RegExp(schema[2].pattern);

            return regex.test(value);
        }

        return checker;
    }
);
