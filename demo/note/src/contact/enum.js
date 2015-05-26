/**
 * DEMP
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 通讯模块枚举
 * @author dddbear(dddbear@aliyun.com)
 */
define(
    function (require) {
        var Enum = require('er/Enum');

        var exports = {};
        
        /**
         * 权限类型
         *
         * @enum
         */
        exports.AuthTypes = new Enum(
            /**
             * @property {number} [PERSONAL=1]
             *
             * 私有
             */
            {alias: 'PERSONAL', text: '私有', value: 1},
            /**
             * @property {number} [PUBLIC=1]
             *
             * 公开
             */
            {alias: 'PUBLIC', text: '公开', value: 2}
        );

        return exports;
    }
);
