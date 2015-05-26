/**
 * SSP for Web
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file Ajax实现类
 * @author otakustay
 */
define(
    function (require) {
        var u = require('./util');

        /**
         * Ajax实现类
         *
         * @class common.Ajax
         * @extends er.ajax.Ajax
         */
        var exports = {};

        /**
         * @constructs common.Ajax
         * @override
         */
        exports.constructor = function () {
            this.$super(arguments);

            this.setDefaultConfig();
            this.enableJSONRequest();
            this.enableContentTypeShortcut();
        };

        /**
         * 进行默认配置
         *
         * @private
         * @method common.Ajax#setDefaultConfig
         */
        exports.setDefaultConfig = function () {
            // RIA系统的前后端接口应该有完善的缓存设置，因此默认开启GET请求的缓存
            this.config.cache = true;
            // 默认超时15秒，用于调试时可适当降低
            this.config.timeout = 15 * 1000;
            // 默认编码为utf-8
            this.config.charset = 'utf-8';
        };

        /**
         * 启用JSON请求
         *
         * @private
         * @method common.Ajax#enableJSONRequest
         */
        exports.enableJSONRequest = function () {
            // 提供JSON格式请求的序列化功能
            var serializeAsForm = this.hooks.serializeData;

            var serializeAsJSON = function (prefix, data, contentType) {
                if (!prefix && contentType === 'application/json') {
                    return JSON.stringify(data);
                }

                return serializeAsForm.apply(this.hooks, arguments);
            };

            // 支持JSON格式的提交
            this.hooks.serializeData = u.bind(serializeAsJSON, this);
            // 有个`getKey`要弄回去
            this.hooks.serializeData.getKey = serializeAsForm.getKey;
        };

        var CONTENT_TYPE_ALIAS = {
            json: 'application/json'
        };

        /**
         * 自动转换`contentType`
         *
         * @private
         * @method common.Ajax#enableContentTypeShortcut
         */
        exports.enableContentTypeShortcut = function () {
            this.hooks.beforeExecute = function (options) {
                if (options.contentType && CONTENT_TYPE_ALIAS.hasOwnProperty(options.contentType)) {
                    options.contentType = CONTENT_TYPE_ALIAS[options.contentType];
                }
            };
        };

        var oo = require('eoo');
        var Ajax = oo.create(require('er/ajax').Ajax, exports);
        return Ajax;
    }
);
