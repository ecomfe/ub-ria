/**
 * UB RIA Base
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file 最大值校验器
 * @author yanghuabei(yanghuabei@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var checker = {
            name: 'max',
            errorMessage: '${title}不能大于${max}',
            priority: 20,
            check: check
        };

        /**
         * 数字上界检验器，如果value为undefined、null，返回true
         *
         * @param {number | undefined | null} value 待检验的数值
         * @param {Array} schema 字段的定义、约束, 长度为3的数组
         * @return {boolean} 检验成功返回true，失败返回false
         */
        function check(value, schema) {
            // 如果value为null、undefined, 不做检查
            if (!value && value !== 0) {
                return true;
            }

            var max = schema[2].max;

            return value <= max;
        }

        return checker;
    }
);
