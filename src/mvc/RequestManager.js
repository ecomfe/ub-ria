/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 请求管理类
 * @author otakustay
 * @date $DATE$
 */
define(
    function (require) {
        var u = require('underscore');
        var util = require('er/util');

        /**
         * 请求管理类
         *
         * 本类用户管理一系列的AJAX请求，控制多个同类（通过名称区分）请求发起时的处理
         *
         * @constructor
         */
        function RequestManager() {
            this.runningRequests = {};
        }

        var typeRequestConfigs = [];

        var globalRequestConfig = {};
        var globalRunningRequests = {};

        /**
         * 注册一个请求配置
         *
         * @param {Function} Type 提供配置的类型对象
         * @param {string} name 配置名称
         * @param {meta.RequestConfig} config 配置项
         */
        RequestManager.register = function (Type, name, config) {
            var defaults = {
                name: name,
                scope: 'instance',
                policy: 'auto'
            };
            config = util.mix(defaults, config);

            if (config.scope === 'instance') {
                var typeConfig =
                    u.findWhere(typeRequestConfigs, { type: Type });
                if (!typeConfig) {
                    typeConfig = { type: Type, config: {} };
                    typeRequestConfigs.push(typeConfig);
                }

                var configContainer = typeConfig.config;
                if (configContainer.hasOwnProperty(name)) {
                    throw new Error(
                        'An instance request config "' + name + '" '
                        + 'has already been registered'
                    );
                }
                configContainer[name] = config;
            }
            else {
                if (globalRequestConfig.hasOwnProperty(name)) {
                    throw new Error(
                        'A global request config "' + name + '" '
                        + 'has already been registered'
                    );
                }

                globalRequestConfig[name] = config;
            }
        };

        /**
         * 查找请求对应的预注册的配置项
         *
         * @param {Object} data 实例
         * @param {string} name 请求名称
         * @return {Object | null}
         */ 
        function lookupRequestConfig(instance, name) {
            if (!name) {
                return null;
            }

            var typeConfig =
                u.findWhere(typeRequestConfigs, { type: instance.constructor });
            return (typeConfig && typeConfig.config[name])
                || globalRequestConfig[name]
                || null;
        }

        /**
         * 处理多个同名请求同时出现的情况
         *
         * @param {RequestManager} requestManager 实例
         * @param {Object} config 请求预先注册的配置项
         * @param {Object} options 本次请求的相关参数
         * @return {er.meta.FakeXHR | undefined}
         */
        function resolveConflict(requestManager, config, options) {
            var runningRequest = requestManager.runningRequests[config.name];
            if (!runningRequest) {
                return;
            }

            var policy = config.policy;
            if (policy === 'auto') {
                // `auto`模式的策略：
                // 
                // 1. 如果请求的配置/参数均没有变化，则重用前一个请求
                // 2. 如果有变化：
                //     1. 如果是GET或PUT请求，则并行加载
                //     2. 如果是POST等非幂等的请求，则中断前一个
                var method = options.method.toUpperCase();
                policy = u.isEqual(options, runningRequest.options)
                    ? 'reuse'
                    : (
                        (method === 'GET' || method === 'PUT') 
                        ? 'parallel' 
                        : 'abort'
                    );
            }

            switch (policy) {
                case 'reuse':
                    return runningRequest.xhr;
                case 'abort':
                    runningRequest.xhr.abort();
                    return;
                default:
                    return;
            }
        }

        /**
         * 在XHR完成后，将之从当前运行的XHR列表中移除
         *
         * @param {RequestManager} requestManager 实例
         * @param {string} name 请求名称
         * @param {er.meta.FakeXHR} xhr 负责请求的`er.meta.FakeXHR`对象
         */
        function detachRunningRequest(requestManager, name, xhr) {
            if (requestManager.runningRequests 
                && requestManager.runningRequests[name]
                && requestManager.runningRequests[name].xhr === xhr
            ) {
                requestManager.runningRequests[name] = null;
            }
            if (globalRunningRequests
                && globalRunningRequests[name]
                && globalRunningRequests[name].xhr === xhr
            ) {
                globalRunningRequests[name] = null;
            }
        }

        /**
         * 获取请求对象
         *
         * @return {meta.Request}
         * @protected
         */
        RequestManager.prototype.getRequest = function (name, data, options) {
                if (typeof name !== 'string') {
                    options = name;
                    name = null;
                }

                var config = lookupRequestConfig(this, name);

                options = util.mix({}, config && config.options, options);
                if (typeof data === 'function') {
                    data = data(this, options);
                }
                if (typeof options.data === 'function') {
                    options.data = options.data(this, options);
                }
                if (data) {
                    options.data = util.mix({}, options.data, data);
                }

                if (!options.dataType) {
                    options.dataType = 'json';
                }

                return {
                    name: name,
                    options: options,
                    config: config
                };
            };

        var ajax = require('er/ajax');

        /**
         * 发起一个AJAX请求
         * 
         * 重载方式：
         * 
         * - `.request(name, data, options)`
         * - `.request(name, data)`
         * - `.request(name)`
         * - `.request(options, data)`
         * - `.request(options)`
         *
         * @param {string} [name] 请求名称
         * @param {Object} [data] 请求数据
         * @param {Object} [options] 请求配置项
         * @return {er.FakeXHR}
         */
        RequestManager.prototype.request = function (name, data, options) {
            var context = this.getRequest(name, data, options);

            if (!context.config) {
                return ajax.request(context.options);
            }

            var xhr = resolveConflict(this, context.config, context.options);
            if (!xhr) {
                xhr = ajax.request(context.options);
                if (name) {
                    // 根据管理的级别，把未完成的请求放到合适的容器里保留
                    var runningRequests = context.config.scope === 'instance'
                        ? this.runningRequests
                        : globalRunningRequests;
                    // 由于`options`是在`auto`模式下决定策略用的，所以也要保留起来
                    runningRequests[name] = {
                        options: context.options,
                        xhr: xhr
                    };
                    // 有时候一个请求中带的数据会很大，因此要尽早让请求对象可回收，
                    // 所以无论请求失败还是成功，统一进行一次移除操作
                    xhr.ensure(
                        u.partial(detachRunningRequest, this, context.name, xhr)
                    );
                }
            }
            return xhr;
        };

        /**
         * 销毁当前实例
         *
         * @override
         * @protected
         */
        RequestManager.prototype.dispose = function () {
            u.each(
                this.runningRequests,
                function (cache) { cache && cache.xhr.abort(); }
            );
            this.runningRequests = null;
        };

        return RequestManager;
    }
);
