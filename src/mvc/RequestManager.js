/**
 * UB RIA Base
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 请求管理类
 * @author otakustay
 */

import u from '../util';
import oo from 'eoo';

const RUNNING_REQUESTS = Symbol('runningRequests');

let globalRunningRequests = new Map();

/**
 * 请求管理类
 *
 * 本类用户管理一系列的AJAX请求，控制多个同类（通过名称区分）请求发起时的处理
 *
 * @class mvc.RequestManager
 */
export default class RequestManager {

    /**
     * 构造函数
     *
     * @constructs mvc.RequestManager
     *
     * @param {string} entityName 实体名称
     * @param {string} [backendEntityName] 后端对应的实体名称，默认与`entityName`相同
     */
    constructor(entityName, backendEntityName) {
        this[RUNNING_REQUESTS] = new Map();
    }

    /**
     * 设置关联的{@link mvc.RequestStrategy}对象
     *
     * @method mvc.RequestManager#setRequestStrategy
     * @param {mvc.RequestStrategy} requestStrategy 设置的实例
     */
    setRequestStrategy(requestStrategy) {
        this.requestStrategy = requestStrategy;
    }

    /**
     * 获取关联的{@link mvc.RequestStrategy}对象
     *
     * @method mvc.RequestManager#getRequestStrategy
     * @return {mvc.RequestStrategy}
     */
    getRequestStrategy() {
        return this.requestStrategy;
    }

    /**
     * 获取请求对象
     *
     * @protected
     * @method mvc.RequestManager#getRequest
     * @param {string} name 请求配置名称
     * @param {Object} [data] 请求的数据
     * @param {Object} [options] 请求的配置
     * @return {meta.Request}
     */
    getRequest(name, data, options) {
        let strategy = this.getRequestStrategy();

        if (typeof name !== 'string') {
            options = name;
            name = null;
        }

        name = strategy.formatName(name, options);

        // 查找已经有的请求配置，如果存在的话需要把`options`进行合并
        let config = lookupRequestConfig(this, name);
        options = u.extend({}, config && config.options, options);
        // 如果`data`是个函数，那么执行一下得到完整的数据对象
        if (typeof data === 'function') {
            data = data(this, options);
        }
        if (typeof options.data === 'function') {
            options.data = options.data(this, options);
        }
        // 合并请求配置里的`data`和发起请求实时给的`data`
        if (data) {
            options.data = u.extend({}, options.data, data);
        }

        options = strategy.formatOptions(options);

        let request = {name, options, config};

        if (request.options.url) {
            request.options.url = strategy.formatURL(request.options.url, request.options);
        }

        return request;
    }

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
     * @method mvc.RequestManager#request
     * @param {string} [name] 请求名称
     * @param {Object} [data] 请求数据
     * @param {Object} [options] 请求配置项
     * @return {er.meta.FakeXHR}
     */
    request(name, data, options) {
        let context = this.getRequest(name, data, options);
        let ajax = this.getAjax();

        if (!context.config) {
            return ajax.request(context.options);
        }

        let xhr = resolveConflict(this, context.config, context.options);
        if (!xhr) {
            xhr = ajax.request(context.options);
            if (name) {
                // 根据管理的级别，把未完成的请求放到合适的容器里保留
                let runningRequests = context.config.scope === 'instance'
                    ? this[RUNNING_REQUESTS]
                    : globalRunningRequests;
                // 由于`options`是在`auto`模式下决定策略用的，所以也要保留起来
                runningRequests[name] = {
                    options: context.options,
                    xhr: xhr
                };
                // 有时候一个请求中带的数据会很大，因此要尽早让请求对象可回收，所以无论请求失败还是成功，统一进行一次移除操作。
                // 这里情况比较特殊不能用`await`，因为我要返回的是`xhr`本身而不是由`then`衍生出来的新的`Promise`
                let detachThisRequestFromManager = () => {
                    detachRunningRequest(this, context.name, xhr);
                };
                xhr.then(detachThisRequestFromManager, detachThisRequestFromManager);
            }
        }
        return xhr;
    }

    /**
     * 销毁当前实例
     *
     * @method mvc.RequestManager#dispose
     */
    dispose() {
        for (let cache of this[RUNNING_REQUESTS].values()) {
            cache.xhr.abort();
        }
        this[RUNNING_REQUESTS] = null;
    }

    // 以下是常用数据操作方法，方法均为抽象方法，业务系统需实现这些方法

    /**
     * 检索一个实体列表，返回一个分页的结果集
     *
     * @abstract
     * @method mvc.RequestManager#search
     * @param {Object} query 查询参数
     * @return {Promise.<meta.ListResponse>}
     */
    async search(query) {
        throw new Error('search method is not implemented');
    }

    /**
     * 获取一个实体列表（不分页）
     *
     * @abstract
     * @method mvc.RequestManager#list
     * @param {Object} query 查询参数
     * @return {Promise.<meta.ListResponse>}
     */
    async list(query) {
        throw new Error('list method is not implemented');
    }

    /**
     * 保存一个实体
     *
     * @abstract
     * @method mvc.RequestManager#save
     * @param {Object} entity 实体对象
     * @return {Promise.<Object>}
     */
    async save(entity) {
        throw new Error('save method is not implemented');
    }

    /**
     * 更新一个实体
     *
     * @abstract
     * @method mvc.RequestManager#update
     * @param {Object} entity 实体对象
     * @return {Promise.<Object>}
     */
    async update(entity) {
        throw new Error('update method is not implemented');
    }

    /**
     * 批量更新一个或多个实体的状态
     *
     * 这个方法不应该被直接调用，应该通过`bind`等方法生成明确的业务方法来使用，
     * 如“删除”操作是将状态改为`0`，因此可以按如下实现：
     *
     * ```javascript
     * X.prototype.remove = function (ids) {
           return this.updateStatus(0, ids);
     * };
     * ```
     *
     * 基类默认有`remove`将状态改为`0`，以及`restore`将状态改为`1`两个方法，如需其它修改状态的方法可以添加
     *
     * @abstract
     * @method mvc.RequestManager#updateStatus
     * @param {number} status 目标状态
     * @param {string[]} ids id集合
     * @return {Promise}
     */
    async updateStatus(status, ids) {
        // 让`status`在前是为了方便通过`bind`或`partial`生成其它的方法
        throw new Error('updateStatus method is not implemented');
    }

    /**
     * 删除一个或多个实体
     *
     * @method mvc.RequestManager#remove
     * @param {string[]} ids id集合
     * @return {Promise}
     */
    remove(ids) {
        return this.updateStatus(0, ids);
    }

    /**
     * 恢复一个或多个实体
     *
     * @method mvc.RequestManager#restore
     * @param {string[]} ids id集合
     * @return {Promise}
     */
    restore(ids) {
        return this.updateStatus(1, ids);
    }

    /**
     * 获取批量操作前的确认
     *
     * 这个方法不应该被直接调用，应该通过`bind`等方法生成明确的业务方法来使用，
     * 如“删除前询问后端是否满足条件”操作是将状态改为`0`时的情况，因此可以按如下实现：
     *
     * ```javascript
     * X.prototype.getRemoveAdvice = function (ids) {
     *     return this.getAdvice(0, ids);
     * };
     * ```
     *
     * 基类默认有`getRemoveAdvice`对应{@link mvc.RequestManager#remove}方法，
     * 以及`getRestoreAdvice`对应{@link mvc.RequestManager#restore}方法，如需其它修改状态的方法可以添加
     *
     * 需要注意的是，为了让系统正常运行，一个修改状态的`xxx`操作，其对应的询问后端方法应该为`getXxxAdvice`，名称一一对应
     *
     * @abstract
     * @method mvc.RequestManager#getAdvice
     * @param {number} status 目标状态
     * @param {string[]} ids id集合
     * @return {Promise.<meta.Advice>}
     */
    async getAdvice(status, ids) {
        throw new Error('getAdvice method is not implemented');
    }

    /**
     * 批量删除前确认
     *
     * @method mvc.RequestManager#getRemoveAdvice
     * @param {string[]} ids id集合
     * @return {Promise.<meta.Advice>}
     */
    getRemoveAdvice(ids) {
        return this.getAdvice(0, ids);
    }

    /**
     * 批量恢复前确认
     *
     * @method mvc.RequestManager#getRestoreAdvice
     * @param {string[]} ids id集合
     * @return {Promise.<meta.Advice>}
     */
    getRestoreAdvice(ids) {
        return this.getAdvice(1, ids);
    }

    /**
     * 根据id获取单个实体
     *
     * @abstract
     * @method mvc.RequestManager#findById
     * @param {string} id 实体的id
     * @return {Promise.<Object>}
     */
    async findById(id) {
        throw new Error('findById method is not implemented');
    }
}

let typeRequestConfigs = new Map();
let globalRequestConfig = {};

/**
 * 查找请求对应的预注册的配置项
 *
 * @param {mvc.RequestManager} instance 实例
 * @param {string} name 请求名称
 * @return {meta.RequestConfig | null}
 */
function lookupRequestConfig(instance, name) {
    if (!name) {
        return null;
    }

    let typeConfig = typeRequestConfigs.get(instance.constructor);
    return (typeConfig && typeConfig[name]) || globalRequestConfig[name] || null;
}

/**
 * 处理多个同名请求同时出现的情况
 *
 * @param {mvc.RequestManager} requestManager 实例
 * @param {meta.RequestConfig} config 请求预先注册的配置项
 * @param {Object} options 本次请求的相关参数
 * @return {er.meta.FakeXHR | null}
 */
function resolveConflict(requestManager, config, options) {
    let runningRequest = requestManager[RUNNING_REQUESTS].get(config.name);
    if (!runningRequest) {
        return null;
    }

    let policy = config.policy;
    if (policy === 'auto') {
        // `auto`模式的策略：
        //
        // 1. 如果请求的配置/参数均没有变化，则重用前一个请求
        // 2. 如果有变化：
        //     1. 如果是GET或PUT请求，则并行加载
        //     2. 如果是POST等非幂等的请求，则中断前一个
        let method = options.method.toUpperCase();
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
            return null;
        default:
            return null;
    }
}

/**
 * 在XHR完成后，将之从当前运行的XHR列表中移除
 *
 * @param {mvc.RequestManager} requestManager 实例
 * @param {string} name 请求名称
 * @param {er.meta.FakeXHR} xhr 负责请求的`FakeXHR`对象
 */
function detachRunningRequest(requestManager, name, xhr) {
    let instanceRunningRequest = requestManager[RUNNING_REQUESTS].get(name);
    if (instanceRunningRequest && instanceRunningRequest.xhr === xhr) {
        requestManager[RUNNING_REQUESTS].delete(name);
    }

    let globalRunningRequest = globalRunningRequests.get(name);
    if (globalRunningRequest && globalRunningRequest.xhr === xhr) {
        globalRunningRequests.delete(name);
    }
}

oo.defineAccessor(RequestManager.prototype, 'ajax');

/**
 * 注册一个请求配置
 *
 * @method mvc.RequestManager.register
 * @param {Function} Type 提供配置的类型对象
 * @param {string} name 配置名称
 * @param {meta.RequestConfig} config 配置项
 */
export let register = (Type, name, config) => {
    let defaults = {
        name: name,
        scope: 'instance',
        policy: 'auto'
    };
    config = u.extend(defaults, config);

    if (config.scope === 'instance') {
        let typeConfig = typeRequestConfigs.get(Type);
        if (!typeConfig) {
            typeConfig = {};
            typeRequestConfigs.set(Type, typeConfig);
        }

        if (typeConfig.hasOwnProperty(name)) {
            throw new Error(`An instance request config "${name}" has already been registered`);
        }
        typeConfig[name] = config;
    }
    else if (config.scope === 'global') {
        if (globalRequestConfig.hasOwnProperty(name)) {
            throw new Error(`A global request config "${name}" has already been registered`);
        }

        globalRequestConfig[name] = config;
    }
    else {
        throw new Error(`Invalid scope "${config.scope}"`);
    }
};
