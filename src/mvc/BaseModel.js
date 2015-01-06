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
        var u = require('underscore');
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
         * 判断是否拥有指定的权限
         *
         * @protected
         * @method mvc.BaseModel#isAllow
         * @param {string} authority
         * @return {boolean}
         */
        exports.isAllow = function (authority) {
            return this.getPermissionProvider().isAllow(authority);
        };

        eoo.defineAccessor(exports, 'permissionProvider');

        var UIModel = require('ef/UIModel');
        var BaseModel = eoo.create(UIModel, exports);

        return BaseModel;
    }
);
