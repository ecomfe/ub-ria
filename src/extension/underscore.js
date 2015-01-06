/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file underscore扩展
 * @author otakustay
 */
define(
    function (require) {
        var u = require('underscore');

        function enable() {
            // 模板配置
            u.templateSettings = {
                interpolate: /\$\{(.+?)\}/g, // `${name}`直接输出
                escape: /\$\{\:(.+?)\}/g // `${:name}`提供HTML转义
            };
        }

        return {
            enable: u.once(enable)
        };
    }
);
