/**
 * UB RIA Base
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 数据模型基类
 * @author otakustay
 */

import u from '../util';
import oo from 'eoo';
import UIModel from 'ef/UIModel';

const DATA_POOL = Symbol('dataPool');

/**
 * @class mvc.BaseModel
 * @extends ef.UIModel
 */
export default class BaseModel extends UIModel {
    /**
     * 添加一个数据对象，以便当前数据模型对象可以进行管理
     *
     * @protected
     * @method mvc.BaseModel#addData
     * @param {string} [name="default"] 数据对象的名称，没有则使用
     * @param {mvc.RequestManager} instance 一个数据对象
     */
    addData(name, instance) {
        if (!this[DATA_POOL]) {
            this[DATA_POOL] = new Map();
        }

        if (arguments.length < 2) {
            instance = name;
            name = 'default';
        }
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
     * @method mvc.BaseModel#putDatasource
     * @param {Object} item 数据源配置，参考ER框架的说明
     * @param {number} [index] 数据源放置的位置，如果不提供则放在最后，提供则和那个位置的并行
     */
    putDatasource(item, index) {
        // 先复制一份，避免合并时相互污染
        item = u.clone(item);

        if (!this.datasource) {
            this.datasource = [];
        }
        else if (!Array.isArray(this.datasource)) {
            this.datasource = [this.datasource];
        }

        if (index === undefined) {
            this.datasource.push(item);
        }
        else {
            let originalItem = this.datasource[index] || {};
            // 如果是数组就加到最后，是对象就混一起了，但我们并不希望这里是数组
            if (Array.isArray(originalItem)) {
                originalItem.push(item);
            }
            else {
                u.extend(originalItem, item);
            }
            this.datasource[index] = originalItem;
        }
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
        let permission = this.getPermission();

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

        for (let data of this[DATA_POOL].values()) {
            data.dispose();
        }
        this[DATA_POOL].clear();
        this[DATA_POOL] = null;
    }
}

/**
 * 获取权限对象
 *
 * @method mvc.BaseModel#getPermission
 * @return {Object} 权限对象，其中不同权限对应不同方法，由实际需要的模块定义接口
 */

/**
 * 设置权限对象
 *
 * @method mvc.BaseModel#setPermission
 * @param {Object} permission 权限对象，其中不同权限对应不同方法，由实际需要的模块定义接口
 */
oo.defineAccessor(BaseModel.prototype, 'permission');

/**
 * 获取事件总线对象
 *
 * @method  mvc.BaseAction#getEventBus
 * @return {mini-event.EventTarget}
 */

/**
 * 设置事件总线对象
 *
 * @method  mvc.BaseAction#getEventBus
 * @param {mini-event.EventTarget} eventBus 事件总线对象
 */
oo.defineAccessor(BaseModel.prototype, 'eventBus');
