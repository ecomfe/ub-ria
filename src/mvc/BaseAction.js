/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file Action基类
 * @author otakustay
 * @date $DATE$
 */
define(
    function (require) {
        var u = require('../util');

        /**
         * Action基类，提供实体名称和实体描述的维护
         *
         * @class mvc.BaseAction
         * @extends er.Action
         */
        var exports = {};

        /**
         * @constructs mvc.BaseAction
         * @override
         * @param {string} [entityName] 负责的实体名称
         */
        exports.constructor = function (entityName) {
            this.$super(arguments);

            this.entityName = entityName;
        };

        /**
         * 获取当前Action所处理的实体名称
         *
         * @return {string}
         */
        exports.getEntityName = function () {
            if (!this.entityName) {
                // 几乎所有的URL都是`/{entityName}/list|update|create|view`结构
                var path = this.context.url.getPath();
                this.entityName = path.split('/')[1];
            }

            return this.entityName;
        };

        /**
         * 获取当前Action的实体简介名称
         *
         * @type {string}
         * @protected
         */
        exports.entityDescription = '';

        /**
         * 获取实体的简介名称
         *
         * @return {string}
         */
        exports.getEntityDescription = function () {
            return this.entityDescription || '';
        };

        /**
         * 当前Action的所属分组名称，通常用于控制导航条的选中状态
         *
         * @type {string}
         */
        exports.group = '';

        /**
         * 获取当前Action的所属分组名称
         *
         * @return {string}
         */
        exports.getGroup = function () {
            return this.group;
        };

        /**
         * 当前页面的分类，如列表为`"list"`
         *
         * @type {string}
         */
        exports.category = '';

        /**
         * 获取当前页面的分类
         *
         * @return {string}
         */
        exports.getCategory = function () {
            return this.category || '';
        };

        /**
         * 获取当前页面所属包
         *
         * @return {string}
         */
        exports.getPackage = function () {
            return this.package;
        };

        /**
         * 设置当前页面所属包
         *
         * @param {string} package 所属包名
         */
        exports.setPackage = function (package) {
            this.package = package;
        };

        /**
         * 获取当前页面的分类
         *
         * 默认返回以下内容：
         *
         * - `{category}-page`
         * - `{entityName}-page`
         * - `{entityName}-{category}-page`
         * - `{package}-package`
         * - `{package}-pacakge-{category}`
         *
         * @return {string[]}
         */
        exports.getPageCategories = function () {
            var categories = [];
            var category = u.dasherize(this.getCategory());
            var entityName = u.dasherize(this.getEntityName());
            var package = u.dasherize(this.getPackage());

            if (category) {
                categories.push(category + '-page');
            }
            if (entityName) {
                categories.push(entityName + '-page');
            }
            if (category && entityName) {
                categories.push(entityName + '-' + this.category + '-page');
            }
            if (package) {
                categories.push(package + '-package');
            }
            if (package && category) {
                categories.push(package + '-package-' + category);
            }

            return categories;
        };

        /**
         * 创建数据模型对象
         *
         * 此方法会在返回的`Model`中加上`entityDescription`属性
         *
         * @param {Object} args 模型的初始化数据
         * @return {BaseModel}
         * @protected
         * @override
         */
        exports.createModel = function (args) {
            args.entityDescription = this.getEntityDescription();

            var model = this.$super(arguments);

            // Action基类的默认返回值是一个空对象`{}`，
            // 但是普通的`Model`对象因为方法和属性全在`prototype`上，也会被判断为空
            var Model = require('er/Model');
            if (!(model instanceof Model) && u.isEmpty(model)) {
                var BaseModel = require('./BaseModel');
                var entityName = this.getEntityName();
                model = new BaseModel(entityName, args);
            }

            return model;
        };

        /**
         * 设置数据模型对象，会给 `model` 增加 `entityDescription` 字段
         *
         * @param {er.Model} model 数据模型
         */
        exports.setModel = function (model) {
            model.set('entityDescription', this.getEntityDescription());
            this.model = model;
        };

        var Action = require('er/Action');
        var BaseAction = require('eoo').create(Action, exports);

        return BaseAction;
    }
);
