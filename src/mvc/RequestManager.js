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
         * @param {string=} entityName 该数据类管理的主要实体的类型名称
         * @param {string=} backendEntityName 后端的实体名称，默认与`entityName`相同
         *
         * @constructor
         */
        function RequestManager(entityName, backendEntityName) {
            this.entityName = entityName;
            this.backendEntityName = backendEntityName;

            this.runningRequests = {};
        }

        RequestManager.defaultURLPrefix = '/api/js';

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
         * 获取当前数据类负责的实体名称
         *
         * @return {string}
         */
        RequestManager.prototype.getEntityName = function () {
            return this.entityName || '';
        };

        /**
         * 获取当前数据类负责的后端实体名称
         *
         * @return {string}
         */
        RequestManager.prototype.getBackendEntityName = function () {
            return this.backendEntityName || this.getEntityName();
        };

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

            // 名称中可以有`$entity`作为占位，此时将其格式化
            name = name.replace(/\$entity/g, this.getEntityName());

            // 查找已经有的请求配置，如果存在的话需要把`options`进行合并
            var config = lookupRequestConfig(this, name);
            options = util.mix({}, config && config.options, options);
            // 如果`data`是个函数，那么执行一下得到完整的数据对象
            if (typeof data === 'function') {
                data = data(this, options);
            }
            if (typeof options.data === 'function') {
                options.data = options.data(this, options);
            }
            // 合并请求配置里的`data`和发起请求实时给的`data`
            if (data) {
                options.data = util.mix({}, options.data, data);
            }

            // 默认使用JSON作为响应格式
            if (!options.dataType) {
                options.dataType = 'json';
            }

            var request = {
                name: name,
                options: options,
                config: config
            };

            var url = request.options.url;
            // URL中可以有`$entity`作为占位，此时将其格式化
            url = url.replace(
                /\$entity/g,
                require('../util').pluralize(this.getBackendEntityName())
            );

            // 所有前端接口，除登录用的几个外，和几个静态资源外，
            // 除非特别设置`urlPrefix`值，否则全部以`/api/js`作为前缀，
            // 登录的几个接口不会使用`Data`发起，因此这边对所有未设置
            // `urlPrefix`的请求统一加前缀
            var urlPrefix = 
                request.options.urlPrefix || RequestManager.defaultURLPrefix;
            if (url.indexOf(urlPrefix !== 0)) {
                url = urlPrefix + url;
            }
            request.options.url = url;

            return request;
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

        // 以下是常用数据操作方法，这些方法的前提是有按以下规则注册相关请求：
        //
        // - 查询：/{entities}/search
        // - 列表：/{entities}/list
        // - 保存：/{entities}/save
        // - 更新：/{entities}/update
        // - 删除：/{entities}/remove
        // - 恢复：/{entities}/restore
        //
        // 注册配置时可以不写明`url`和`method`，但依旧建议写上，当作文档看，
        // 如果没注册，也可正常使用，但无法使用AJAX管理机制

        /**
         * 检索一个实体列表，返回一个分页的结果集
         *
         * @param {Object} query 查询参数
         * @return {er.meta.FakeXHR}
         */
        RequestManager.prototype.search = function (query) {
            return this.request(
                '$entity/search',
                query,
                {
                    method: 'GET',
                    url: '/$entity'
                }
            );
        };

        /**
         * 获取一个实体列表（不分页）
         *
         * @param {Object} query 查询参数
         * @return {er.meta.FakeXHR}
         */
        RequestManager.prototype.list = function (query) {
            return this.request(
                '$entity/list',
                query,
                {
                    method: 'GET',
                    url: '/$entity/list'
                }
            );
        };

        /**
         * 保存一个实体
         *
         * @param {Object} entity 实体对象
         * @return {er.meta.FakeXHR}
         */
        RequestManager.prototype.save = function (entity) {
            return this.request(
                '$entity/save',
                entity,
                {
                    method: 'POST',
                    url: '/$entity'
                }
            );
        };

        /**
         * 更新一个实体
         *
         * @param {Object} entity 实体对象
         * @return {er.meta.FakeXHR}
         */
        RequestManager.prototype.update = function (entity) {
            return this.request(
                '$entity/update',
                entity,
                {
                    method: 'PUT',
                    url: '/$entity/' + entity.id
                }
            );
        };

        /**
         * 批量更新一个或多个实体的状态
         *
         * @param {string} action 操作名称
         * @param {number} status 目标状态
         * @param {string[]} ids id集合
         * @return {FakeXHR}
         */
        RequestManager.prototype.updateStatus = function (action, status, ids) {
            return this.request(
                '$entity/' + action,
                {
                    ids: ids,
                    status: status
                },
                {
                    method: 'POST',
                    url: '/$entity/status'
                }
            );
        };

        /**
         * 删除一个或多个实体
         *
         * @param {string[]} ids id集合
         * @return {er.meta.FakeXHR}
         */
        RequestManager.prototype.remove =
            u.partial(RequestManager.prototype.updateStatus, 'remove', 0);

        /**
         * 恢复一个或多个实体
         *
         * @param {string[]} ids id集合
         * @return {er.meta.FakeXHR}
         */
        RequestManager.prototype.restore =
            u.partial(RequestManager.prototype.updateStatus, 'restore', 1);

        /**
         * 获取批量操作前的确认
         *
         * @param {string} action 操作名称
         * @param {number} status 目标状态
         * @param {string[]} ids id集合
         * @return {er.meta.FakeXHR}
         */
        RequestManager.prototype.getAdvice = function (action, status, ids) {
            return this.request(
                '$entity/' + action + '/advice',
                {
                    ids: ids,
                    status: status
                },
                {
                    method: 'GET',
                    url: '/$entity/status/advice'
                }
            );
        };

        /**
         * 批量删除前确认
         *
         * @param {string[]} ids id集合
         * @return {er.meta.FakeXHR}
         */
        RequestManager.prototype.getRemoveAdvice = 
            u.partial(RequestManager.prototype.getAdvice, 'remove', 0);

        /**
         * 批量恢复前确认
         *
         * @param {string[]} ids id集合
         * @return {er.meta.FakeXHR}
         */
        RequestManager.prototype.getRestoreAdvice =
            u.partial(RequestManager.prototype.getAdvice, 'restore', 1);

        /**
         * 根据id获取单个实体
         *
         * @param {String} id 实体的id
         * @return {er.meta.FakeXHR}
         */
        RequestManager.prototype.findById = function (id) {
            return this.request(
                '$entity/findById',
                null,
                {
                    method: 'GET',
                    url: '/$entity/' + id
                }
            );
        };

        /**
         * 获取实体信息树
         *
         * @return {er.meta.FakeXHR}
         */
        RequestManager.prototype.getTree = function () {
            return this.request(
                '$entity/tree',
                null,
                {
                    method: 'GET',
                    url: '/$entity/tree'
                }
            );
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
