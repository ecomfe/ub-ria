/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 表单数据模型基类
 * @exports mvc.FormModel
 * @author otakustay
 */
define(
    function (require) {
        var Deferred = require('er/Deferred');

        /**
         * @class mvc.FormModel
         * @extends mvc.SingleEntityModel
         */
        var exports = {};

        /**
         * @public
         * @method mvc.FormModel#setGlobalData
         * @param {Object} data 全局数据对象
         */
        exports.setGlobalData = function (data) {
            this.addData('global', data);
        };

        /**
         * 检查实体数据完整性，可在此补充一些视图无法提供的属性
         *
         * @public
         * @method mvc.FormModel#fillEntity
         * @param {Object} entity 实体数据
         * @return {Object} 补充完整的实体数据
         */
        exports.fillEntity = function (entity) {
            return entity;
        };

        /**
         * 设置当前对象关联的{@link mvc.EntityValidator}实例
         *
         * @public
         * @method mvc.FormModel#setValidator
         * @param {mvc.EntityValidator} validator 关联的实例
         */
        exports.setValidator = function (validator) {
            if (validator && !validator.getRule()) {
                validator.setRule(this.get('rule'));
            }
            this.validator = validator;
        };

        /**
         * 获取当前对象关联的{@link mvc.EntityValidator}实例
         *
         * @public
         * @method mvc.FormModel#getValidator
         * @return {mvc.EntityValidator}
         */
        exports.getValidator = function () {
            return this.validator;
        };

        /**
         * 校验实体
         *
         * @public
         * @method mvc.FormModel#validateEntity
         * @param {Object} entity 需要校验的实体
         * @return {Array.<Object>}
         */
        exports.validateEntity = function (entity) {
            var validator = this.getValidator();
            if (!validator) {
                throw new Error('No validator object attached to this Model');
            }

            return validator.validate(entity);
        };

        /**
         * 保存新建的实体
         *
         * @protected
         * @method mvc.FormModel#save
         * @param {Object} entity 新建的实体对象
         * @return {er.meta.Promise}
         */
        exports.save = function (entity) {
            entity = this.fillEntity(entity);

            var validationResult = this.validateEntity(entity);

            if (validationResult.length > 0) {
                return Deferred.rejected({fields: validationResult});
            }

            return this.saveEntity(entity);
        };

        /**
         * 完成实体的保存操作
         *
         * @protected
         * @method mvc.FormModel#saveEntity
         * @param {Object} entity 已经补充完整并且验证通过的实体
         * @return {er.meta.Promise}
         */
        exports.saveEntity = function (entity) {
            var data = this.data();
            if (!data) {
                throw new Error('No default data object attached to this Model');
            }
            if (typeof data.save !== 'function') {
                throw new Error('No save method implemented on default data object');
            }

            return data.save(entity);
        }

        /**
         * 更新已有的实体
         *
         * @protected
         * @method mvc.FormModel#update
         * @param {Object} entity 待更新的实体对象
         * @return {er.meta.Promise}
         */
        exports.update = function (entity) {
            entity = this.fillEntity(entity);

            // 更新默认加上id
            entity.id = this.get('id');

            var validationResult = this.validateEntity(entity);

            if (validationResult.length > 0) {
                return Deferred.rejected({fields: validationResult});
            }

            return this.updateEntity(entity);
        };

        /**
         * 完成实体的更新操作
         *
         * @protected
         * @method mvc.FormModel#updateEntity
         * @param {Object} entity 已经补充完整并且验证通过的实体
         * @return {er.meta.Promise}
         */
        exports.updateEntity = function (entity) {
            var data = this.data();
            if (!data) {
                throw new Error('No default data object attached to this Model');
            }
            if (typeof data.update !== 'function') {
                throw new Error('No update method implemented on default data object');
            }

            return data.update(entity);
        }

        var SingleEntityModel = require('./SingleEntityModel');
        var FormModel = require('eoo').create(SingleEntityModel, exports);

        return FormModel;
    }
);
