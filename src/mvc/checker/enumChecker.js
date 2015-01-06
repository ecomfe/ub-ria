/**
 * UB RIA Base
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file 枚举字段校验器
 * @author yanghuabei(yanghuabei@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var checker = {
            name: 'enum',
            errorMessage: '${title}的值不合法',
            priority: 20,
            check: check
        };

        /**
         * 枚举类型字段值检验器，如果传入的value是undefined或null，返回true
         *
         * @param {number | undefined | null} value 要检验的数字
         * @param {Array} schema 字段的定义、约束, 长度为3的数组
         * @return {boolean} 检验成功返回true，失败返回false
         */
        function check(value, schema) {
            // 如果value为null、undefined, 不做检查
            if (!value && value !== 0) {
                return true;
            }

            var enumObject = schema[2].datasource;
            var item = enumObject.fromValue(value);

            return !!item;
        }

        return checker;
    }
);
