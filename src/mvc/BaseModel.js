/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 数据模型基类
 * @exports mvc.BaseModel
 * @author otakustay
 */
define(
    function (require) {
        var u = require('../util');
        var eoo = require('eoo');

        /**
         * @class mvc.BaseModel
         * @extends ef.UIModel
         */
        var exports = {};

        /**
         * 添加一个数据对象，以便当前数据模型对象可以进行管理
         *
         * @protected
         * @method mvc.BaseModel#addData
         * @param {string} [name="default"] 数据对象的名称，没有则使用
         * @param {mvc.RequestManager} instance 一个数据对象
         */
        exports.addData = function (name, instance) {
            if (!this.dataPool) {
                this.dataPool = {};
            }

            if (arguments.length < 2) {
                instance = name;
                name = 'default';
            }
            if (!name) {
                name = 'default';
            }

            if (!this.dataPool[name]) {
                this.dataPool[name] = instance;
            }
        };

        /**
         * 设置当前所属模块的默认`Data`实现
         *
         * @public
         * @method mvc.BaseModel#setData
         * @param {mvc.RequestManager} instance 一个数据对象
         */
        exports.setData = function (instance) {
            this.addData(instance);
        };

        /**
         * 获取关联在当前Model上的数据对象
         *
         * @protected
         * @method mvc.BaseModel#data
         * @param {string} [name] 需要的数据对象的名称，不提供则返回默认的数据对象
         * @return {mvc.RequestManager}
         */
        exports.data = function (name) {
            if (!name) {
                name = 'default';
            }
            return this.dataPool[name] || null;
        };

        /**
         * 添加一个数据源
         *
         * @protected
         * @method mvc.BaseModel#putDatasource
         * @param {Object} item 数据源配置，参考ER框架的说明
         * @param {number} [index] 数据源放置的位置，如果不提供则放在最后，提供则和那个位置的并行
         */
        exports.putDatasource = function (item, index) {
            // 先复制一份，避免合并时相互污染
            item = u.clone(item);

            if (!this.datasource) {
                this.datasource = [];
            }
            else if (!u.isArray(this.datasource)) {
                this.datasource = [this.datasource];
            }

            if (index === undefined) {
                this.datasource.push(item);
            }
            else {
                var originalItem = this.datasource[index] || {};
                // 如果是数组就加到最后，是对象就混一起了，但我们并不希望这里是数组
                if (u.isArray(originalItem)) {
                    originalItem.push(item);
                }
                else {
                    u.extend(originalItem, item);
                }
                this.datasource[index] = originalItem;
            }
        };

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
        exports.checkPermission = function (permissionName) {
            var permission = this.getPermission();

            if (!permission) {
                throw new Error('No attached permission object');
            }

            var method = permission[permissionName];

            if (!method) {
                throw new Error('No "' + method + '" method on permission object');
            }

            return method.call(permission);
        };

        /**
         * 销毁
         *
         * @override
         */
        exports.dispose = function () {
            this.$super(arguments);

            u.each(
                this.dataPool,
                function (data) {
                    data.dispose();
                }
            );
            this.dataPool = null;
        };

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
        eoo.defineAccessor(exports, 'permission');

        var UIModel = require('ef/UIModel');
        var BaseModel = eoo.create(UIModel, exports);

        return BaseModel;
    }
);
