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
        var SingleEntityModel = require('./SingleEntityModel');
        var Deferred = require('er/Deferred');

        /**
         * @class mvc.FormModel
         * @extends mvc.SingleEntityModel
         */
        var exports = {};

        /**
         * @public
         * @method mvc.FormModel#setGlobalData
         * @param {Object} data
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
            if (validator) {
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
         * @absctract
         * @method mvc.FormModel#save
         * @param {Object} entity 新建的实体对象
         * @return {er.Promise}
         */
        exports.save = function (entity) {
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
                return Deferred.rejected({fields: validationResult});
            }

            return data.save(entity);
        };

        /**
         * 更新已有的实体
         *
         * @protected
         * @absctract
         * @method mvc.FormModel#update
         * @param {Object} entity 待更新的实体对象
         * @return {er.Promise}
         */
        exports.update = function (entity) {
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

        var SingleEntityModel = require('ub-ria/mvc/SingleEntityModel');
        var FormModel = require('eoo').create(SingleEntityModel, exports);

        return FormModel;
    }
);
