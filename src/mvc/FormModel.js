/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 表单数据模型基类
 * @author otakustay
 * @date $DATE$
 */
define(
    function (require) {
        var u = require('underscore');
        var util = require('er/util');
        var SingleEntityModel = require('./SingleEntityModel');

        /**
         * 表单数据模型基类
         *
         * @extends SingleEntityModel
         * @constructor
         */
        function FormModel() {
            SingleEntityModel.apply(this, arguments);
        }

        util.inherits(FormModel, SingleEntityModel);

        /**
         * 判断实体是否有变化
         *
         * 默认实现使用最简单的比较提交的实体和预先存放在`Model`中的实体，
         * 基本上所有表单都要重写此方法来进行符合业务逻辑的相等性判断
         *
         * @param {Object} entity 新的实体
         * @return {boolean}
         */
        FormModel.prototype.isEntityChanged = function (entity) {
            var original = this.get('entity');
            return !u.isEqual(original, entity);
        };

        /**
         * 检查实体数据完整性，可在此补充一些视图无法提供的属性
         *
         * @param {Object} entity 实体数据
         * @return {Object} 补充完整的实体数据
         */
        FormModel.prototype.fillEntity = function (entity) {
            // 如果是更新则添加一个`id`字段
            if (this.get('formType') === 'update') {
                entity.id = this.model.get('id');
            }

            return entity;
        };

        /**
         * 检验实体有效性
         *
         * @param {Object} entity 提交的实体
         * @return {meta.FieldError[] | true} 返回`true`则验证通过，否则返回错误集合
         */
        FormModel.prototype.validateEntity = function (entity) {
            return true;
        };

        /**
         * 保存新建的实体
         *
         * @param {Object} 新建的实体对象
         * @return {er.Promise}
         */
        FormModel.prototype.save = function (entity) {
            if (!this.data) {
                throw new Error('No data object attached to this Model');
            }
            if (typeof this.data.save !== 'function') {
                throw new Error('No save method implemented on data object');
            }

            return this.data.save(entity);
        };

        /**
         * 更新已有的实体
         *
         * @param {Object} 待更新的实体对象
         * @return {er.Promise}
         */
        FormModel.prototype.update = function (entity) {
            if (!this.data) {
                throw new Error('No data object attached to this Model');
            }
            if (typeof this.data.update !== 'function') {
                throw new Error('No update method implemented on data object');
            }

            return this.data.update(entity);
        };
        
        return FormModel;
    }
);
