/**
 * SSP for WEB
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 工具对象
 * @namespace common.util
 * @author otakustay
 */
define(
    function (require) {
        /**
         * 工具对象
         *
         * @namespace common.util
         */
        var util = require('eoo').static(require('ub-ria/util'));

        /**
         * 通用权限函数生成器
         * @param {string} auth 权限字符串
         * @return {Function} 权限验证函数
         */
        util.permission = function (auth) {
            return function () {
                return this.getSystemPermission().isAllow(auth);
            };
        };

        return util;
    }
);
