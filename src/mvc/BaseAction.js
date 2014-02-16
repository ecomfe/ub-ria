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
        var util = require('er/util');
        var u = require('underscore');
        var Action = require('er/Action');

        /**
         * Action基类，提供实体名称和实体描述的维护
         *
         * @param {string} [entityName] 负责的实体名称
         * @extends er.Action
         * @constructor
         */
        function BaseAction(entityName) {
            Action.apply(this, arguments);
            this.entityName = entityName;
        }

        util.inherits(BaseAction, Action);

        /**
         * 获取当前Action所处理的实体名称
         *
         * @return {string}
         */
        BaseAction.prototype.getEntityName = function () {
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
        BaseAction.prototype.entityDescription = '';

        /**
         * 获取实体的简介名称
         *
         * @return {string}
         */
        BaseAction.prototype.getEntityDescription = function () {
            return this.entityDescription || '';
        };

        /**
         * 当前Action的所属分组名称，通常用于控制导航条的选中状态
         *
         * @type {string}
         */
        BaseAction.prototype.group = '';

        /**
         * 获取当前Action的所属分组名称
         *
         * @return {string}
         */
        BaseAction.prototype.getGroup = function () {
            return this.group;
        };

        /**
         * 当前页面的分类，如列表为`"list"`
         *
         * @type {string}
         * @readonly
         */
        BaseAction.prototype.category = '';

        /**
         * 获取当前页面的分类
         *
         * 默认分类为`[{category}-page, {entityName}-{category}-page]`
         *
         * @return {string[]}
         */
        BaseAction.prototype.getPageCategories = function () {
            var categories = [];
            if (this.category) {
                categories.push(this.category + '-page');
                var entityName = this.getEntityName();
                if (entityName) {
                    categories.push(entityName + '-' + this.category + '-page');
                }
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
        BaseAction.prototype.createModel = function (args) {
            args.entityDescription = this.getEntityDescription();

            var model = Action.prototype.createModel.apply(this, arguments);

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
        
        return BaseAction;
    }
);        
