/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 请求处理策略类
 * @author otakustay
 */
define(
    function (require) {
        /**
         * 请求处理策略类
         *
         * 该类用于按一定规则处理请求时的URL、请求名称、请求参数等，通常每个项目会根据自身的前后端接口约定有一个通用的实现
         *
         * 默认实现是不对输入进行任何处理，添加`"json"`作为默认响应格式
         *
         * @class mvc.RequestStrategy
         */
        var exports = {};

        /**
         * 处理请求名称，具体业务可以使用此方法对请求名称进行一些替换操作，
         * 如可以根据当前对象的`entityName`属性为请求名称加上前缀等
         *
         * @param {string} name 当前请求的名称
         * @param {Object} options 请求的配置，此配置为调用{@link mvc.RequestManager#request}时提供的初始配置
         * @return {string}
         * @protected
         */
        exports.formatName = function (name, options) {
            return name;
        };

        /**
         * 处理请求的URL，具体业务可以使用此方法对请求的URL进行一些替换操作，
         * 如可以根据当前对象的`entityName`来生成通用的URL等
         *
         * @param {string} url 当前请求的URL
         * @param {Object} options 请求的配置，此配置为已经被处理过的完整的配置
         * @return {string}
         * @protected
         */
        exports.formatURL = function (url, options) {
            return url;
        };

        /**
         * 处理请求参数
         *
         * @param {Object} options 请求的参数
         * @return {Object}
         * @protected
         */
        exports.formatOptions = function (options) {
            // 默认使用JSON作为响应格式
            if (!options.dataType) {
                options.dataType = 'json';
            }

            return options;
        };

        var RequestStrategy = require('eoo').create(exports);

        return RequestStrategy;
    }
);
