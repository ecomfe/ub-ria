/**
 * UB RIA Base
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file 最大长度校验器
 * @author yanghuabei(yanghuabei@baidu.com)
 */
define(
    function (require) {
        var checker = {
            name: 'maxLength',
            errorMessage: {
                array: '${title}不能超过${maxLength}个',
                string: '${title}不能超过${maxLength}个字符'
            },
            priority: 20,
            check: check
        };

        /**
         * 字符串、数组最大长度检验器，value为undefind、null时返回true
         *
         * @param {string | Object | undefined | null} value 待校验的值
         * @param {Object[]} schema 字段的定义、约束, 长度为3的数组
         * @return {boolean} 检验成功返回true，失败返回false
         */
        function check(value, schema) {
            var maxLength = schema[2].maxLength;

            return !(value && value.length !== 0 && value.length > maxLength);
        }

        return checker;
    }
);
