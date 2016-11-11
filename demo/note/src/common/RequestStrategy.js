/**
 * SSPP for APP
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 请求处理策略类
 * @author otakustay
 */
define(
    function (require) {
        var DEFAULT_URL_PREFIX = '/api/js';

        var u = require('common/util');

        var proto = {};

        /**
         * 项目级请求处理策略类
         *
         * @class common.RequestStrategy
         *
         * @param {string} entityName 对应的实体名
         * @param {string} [backendEntityName] 对应的后端实体名
         */
        proto.constructor = function (entityName, backendEntityName) {
            this.setEntityName(entityName);
            this.setBackendEntityName(backendEntityName);
        };

        /**
         * 获取当前负责的实体名称
         *
         * @return {string}
         */
        proto.getEntityName = function () {
            return this.entityName || '';
        };

        /**
         * 设置当前负责的实体名称
         *
         * @param {string} entityName 实体名称
         */
        proto.setEntityName = function (entityName) {
            this.entityName = entityName;
        };

        /**
         * 获取当前负责的后端实体名称
         *
         * @return {string}
         */
        proto.getBackendEntityName = function () {
            return this.backendEntityName || this.getEntityName();
        };

        /**
         * 获取当前负责的后端实体名称
         *
         * @param {string} backendEntityName 后端实体名称
         */
        proto.setBackendEntityName = function (backendEntityName) {
            this.backendEntityName = backendEntityName;
        };

        /**
         * 处理请求名称
         *
         * @param {string} name 当前请求的名称
         * @return {string}
         * @protected
         * @override
         */
        proto.formatName = function (name) {
            // 此处允许请求名称中有`$entity`占位符，处理后会变成当前`Data`类管理的实体名称
            return name.replace(/\$entity/g, this.getEntityName());

        };

        /**
         * 处理请求的URL
         *
         * @param {string} url 当前请求的URL
         * @param {Object} options 请求的配置对象
         * @return {string}
         * @protected
         * @override
         */
        proto.formatURL = function (url, options) {
            // 此处允许URL中有`$entity`占位符，处理后会变成当前`Data`类管理的后台实体名称
            url = url.replace(/\$entity/g, u.pluralize(this.getBackendEntityName()));


            // 所有前端接口，除登录用的几个外，和几个静态资源外，全部以`/api/js`作为前缀，
            // 因此除非有指定的`urlPrefix`配置，所有URL都加上统一的前缀
            var urlPrefix = options.urlPrefix || DEFAULT_URL_PREFIX;
            if (url.indexOf(urlPrefix) !== 0) {
                url = urlPrefix + url;
            }
            return url;
        };

        /**
         * 处理请求参数
         *
         * @param {Object} options 请求的参数
         * @return {Object}
         * @protected
         * @override
         */
        proto.formatOptions = function (options) {
            // 默认使用JSON作为响应格式
            if (!options.dataType) {
                options.dataType = 'json';
            }

            // 默认使用JSON作为请求格式
            if (options.method.toUpperCase() !== 'GET' && !options.contentType) {
                options.contentType = 'json';
            }

            return options;
        };

        var RequestStrategy = require('eoo').create(require('ub-ria/mvc/RequestStrategy'), proto);
        return RequestStrategy;
    }
);
