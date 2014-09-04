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
        var util = require('er/util');
        var SingleEntityModel = require('./SingleEntityModel');
        var Deferred = require('er/Deferred');

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
         * 检查实体数据完整性，可在此补充一些视图无法提供的属性
         *
         * @param {Object} entity 实体数据
         * @return {Object} 补充完整的实体数据
         */
        FormModel.prototype.fillEntity = function (entity) {
            return entity;
        };

        /**
         * 设置当前对象关联的{@link mvc.EntityValidator}实例
         *
         * @param {mvc.EntityValidator} 关联的实例
         */
        FormModel.prototype.setValidator = function (validator) {
            validator.setRule(this.get('rule'));
            this.validator = validator;
        };

        /**
         * 获取当前对象关联的{@link mvc.EntityValidator}实例
         *
         * @return {mvc.EntityValidator}
         */
        FormModel.prototype.getValidator = function () {
            return this.validator;
        };

        /**
         * 校验实体
         *
         * @param {Object} entity 需要校验的实体
         * @return {Object[]}
         */
        FormModel.prototype.validateEntity = function (entity) {
            var validator = this.getValidator();
            if (!validator) {
                throw new Error('No validator object attached to this Model');
            }

            return validator.validate(entity);
        };

        /**
         * 保存新建的实体
         *
         * @param {Object} 新建的实体对象
         * @return {er.Promise}
         */
        FormModel.prototype.save = function (entity) {
            var data = this.data();
            if (!data) {
                throw new Error('No default data object attached to this Model');
            }
            if (typeof data.save !== 'function') {
                throw new Error('No save method implemented on default data object');
            }

            entity = this.fillEntity(entity);

            var validationResult = this.validateEntity(entity);

            if (validationResult.length > 0) {
                return Deferred.rejected({ fields: validationResult });
            }

            return data.save(entity);
        };

        /**
         * 更新已有的实体
         *
         * @param {Object} 待更新的实体对象
         * @return {er.Promise}
         */
        FormModel.prototype.update = function (entity) {
            var data = this.data();
            if (!data) {
                throw new Error('No default data object attached to this Model');
            }
            if (typeof data.update !== 'function') {
                throw new Error('No update method implemented on default data object');
            }

            entity = this.fillEntity(entity);

            // 更新默认加上id
            entity.id = this.get('id');

            var validationResult = this.validateEntity(entity);

            if (validationResult.length > 0) {
                return Deferred.rejected({ fields: validationResult });
            }

            return data.update(entity);
        };

        return FormModel;
    }
);
