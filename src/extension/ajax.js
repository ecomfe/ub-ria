/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file AJAX模块扩展
 * @author otakustay
 */
define(
    function (require) {
        function enable() {
            var ajax = require('er/ajax');
            // 提供JSON格式请求的序列化功能
            var serializeAsForm = ajax.hooks.serializeData;
            // 支持JSON格式的提交
            ajax.hooks.serializeData = function (prefix, data, contentType) {
                if (!prefix && contentType === 'application/json') {
                    return JSON.stringify(data);
                }
                else {
                    return serializeAsForm.apply(ajax.hooks, arguments);
                }
            };
            // 有个`getKey`要弄回去
            ajax.hooks.serializeData.getKey = serializeAsForm.getKey;
        }

        return {
            enable: require('../util').once(enable)
        };
    }
);
