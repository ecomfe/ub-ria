/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file Action基类
 * @author otakustay
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
         * @param {string} [entityName] 负责的实体名称
         * @override
         */
        exports.constructor = function (entityName) {
            this.$super(arguments);

            this.entityName = entityName;
        };

        /**
         * 获取当前Action所处理的实体名称
         *
         * @method mvc.BaseAction#getEntityName
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
         * @protected
         * @member mvc.BaseAction#entityDescription
         * @type {string}
         */
        exports.entityDescription = '';

        /**
         * 获取实体的简介名称
         *
         * @method mvc.BaseAction#getEntityDescription
         * @return {string}
         */
        exports.getEntityDescription = function () {
            return this.entityDescription || '';
        };

        /**
         * 当前Action的所属分组名称，通常用于控制导航条的选中状态
         *
         * @protected
         * @member mvc.BaseAction#group
         * @type {string}
         */
        exports.group = '';

        /**
         * 获取当前Action的所属分组名称
         *
         * @method mvc.BaseAction#getGroup
         * @return {string}
         */
        exports.getGroup = function () {
            return this.group;
        };

        /**
         * 当前页面的分类，如列表为`"list"`
         *
         * @protected
         * @member mvc.BaseAction#category
         * @type {string}
         */
        exports.category = '';

        /**
         * 获取当前页面的分类
         *
         * @method mvc.BaseAction#getCategory
         * @return {string}
         */
        exports.getCategory = function () {
            return this.category || '';
        };

        /**
         * 获取当前页面的分类
         *
         * 默认返回以下内容：
         *
         * - `{category}-page`
         * - `{entityName}-page`
         * - `{entityName}-{category}-page`
         * - `{packageName}-package`
         * - `{packageName}-pacakge-{category}`
         *
         * @method mvc.BaseAction#getPageCategories
         * @return {string[]}
         */
        exports.getPageCategories = function () {
            var categories = [];
            var category = u.dasherize(this.getCategory());
            var entityName = u.dasherize(this.getEntityName());
            var packageName = u.dasherize(this.getPackageName());

            if (category) {
                categories.push(category + '-page');
            }
            if (entityName) {
                categories.push(entityName + '-page');
            }
            if (category && entityName) {
                categories.push(entityName + '-' + this.category + '-page');
            }
            if (packageName) {
                categories.push(packageName + '-package');
            }
            if (packageName && category) {
                categories.push(packageName + '-package-' + category);
            }

            return categories;
        };

        /**
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
         * 设置数据模型对象，会给`model`增加`entityDescription`字段
         *
         * @method mvc.BaseAction#setModel
         * @param {er.Model} model 数据模型
         */
        exports.setModel = function (model) {
            model.set('entityDescription', this.getEntityDescription());
            this.model = model;
        };

        var oo = require('eoo');

        oo.defineAccessor(exports, 'packageName');

        var Action = require('er/Action');
        var BaseAction = oo.create(Action, exports);

        return BaseAction;
    }
);
