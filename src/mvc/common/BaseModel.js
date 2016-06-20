/**
 * UB RIA Base
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 数据模型基类
 * @author otakustay
 */

import u from '../../util';
import {accessorProperty} from '../../decorator';
import {data} from '../decorator';
import Model from 'emc/Model';

const DATA_POOL = Symbol('dataPool');

/**
 * @class mvc.BaseModel
 * @extends emc.Model
 */
@accessorProperty('permission')
@accessorProperty('eventBus')
@data('global')
export default class BaseModel extends Model {

    loaders = [];

    constructor(context) {
        super(context);

        this[DATA_POOL] = new Map();

        this.defineComputedProperties();
    }

    defineComputedProperties() {
    }

    pick(...keys) {
        return keys.reduce((result, key) => Object.assign(result, {[key]: this.get(key)}), {});
    }

    fill(mixin, options) {
        return u.each(mixin, (value, key) => this.set(key, value, options));
    }

    /**
     * 添加一个数据对象，以便当前数据模型对象可以进行管理
     *
     * @protected
     * @method mvc.BaseModel#addData
     * @param {string} [name="default"] 数据对象的名称，没有则使用
     * @param {mvc.RequestManager} instance 一个数据对象
     */
    addData(name, instance) {
        /* eslint-disable prefer-rest-params */
        if (arguments.length < 2) {
            instance = name;
            name = 'default';
        }
        /* eslint-enable prefer-rest-params */
        if (!name) {
            name = 'default';
        }

        if (!this[DATA_POOL].has(name)) {
            this[DATA_POOL].set(name, instance);
        }
    }

    /**
     * 设置当前所属模块的默认`Data`实现
     *
     * 可选，一般由IoC统一配置
     *
     * @method mvc.BaseModel#setData
     * @param {mvc.RequestManager} instance 一个数据对象
     */
    setData(instance) {
        this.addData(instance);
    }

    /**
     * 获取关联在当前Model上的数据对象
     *
     * @protected
     * @method mvc.BaseModel#data
     * @param {string} [name] 需要的数据对象的名称，不提供则返回默认的数据对象
     * @return {mvc.RequestManager}
     */
    data(name = 'default') {
        return this[DATA_POOL].get(name) || null;
    }

    /**
     * 添加一个数据源
     *
     * @protected
     * @method mvc.BaseModel#putLoader
     * @param {Object} item 数据源配置，参考ER框架的说明
     * @param {number} [index] 数据源放置的位置，如果不提供则放在最后，提供则和那个位置的并行
     */
    putLoader(item, index) {
        if (index === undefined) {
            this.loaders.push(item);
        }
        else if (!this.loaders[index]) {
            // 如果要代码方便，这里使用`[item]`全部转为数组最合适，
            // 但是使用数组的话，在`load`阶段会需要`Promise.all`包一层，对效率和调用堆栈有影响
            this.loaders[index] = item;
        }
        else {
            this.loaders[index] = [].concat(this.loaders[index], item);
        }
    }

    /**
     * 简化版`er.Model#load`方法，`ub-ria`的`datasoruce`有固定格式，所以不需要太复杂的分析
     *
     * @protected
     * @return {Promise}
     */
    async load() {
        let runLoader = async loader => {
            let result = await loader(this);
            this.fill(result, {silent: true});
            return result;
        };

        for (let loader of this.loaders) {
            if (typeof loader === 'function') {
                await runLoader(loader);
            }
            else {
                // 一定是数组
                await Promise.all(loader.map(runLoader));
            }
        }

        this.prepare();
    }

    /**
     * 准备数据
     *
     * @protected
     */
    prepare() {
    }

    /**
     * 判断是否有给定的权限
     *
     * @public
     * @method mvc.BaseModel#checkPermission
     * @param {string} permissionName 需要判断的权限名称
     * @return {boolean}
     * @throws {Error} 没有关联的`permission`对象
     * @throws {Error} 关联的`permission`对象不提供`permissionName`对应的权限的判断
     */
    checkPermission(permissionName) {
        let permission = this.permission;

        if (!permission) {
            throw new Error('No attached permission object');
        }

        let method = permission[permissionName];

        if (!method) {
            throw new Error(`No "${method}" method on permission object`);
        }

        return method.call(permission);
    }

    /**
     * @override
     */
    dispose() {
        super.dispose();

        u.invoke(this[DATA_POOL].values(), 'dispose');
        this[DATA_POOL].clear();
        this[DATA_POOL] = null;
    }
}
