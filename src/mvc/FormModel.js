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
         * 为FormModel对象添加validator的函数，需要被重写
         *
         *    XxxModel.prototype.initEntityValidator = function() {
         *        FormModel.prototype.initEntityValidator.apply(this, arguments);
         *
         *        var schema = require('./schema');
         *        this.validator.set('schema', schema);
         *    }
         *
         */
        FormModel.prototype.initEntityValidator = function () {
            var rule = this.model.get('rule');
            var EntityValidator = require('./EntityValidator');

            this.validator = new EntityValidator();
            this.validator.setRule(rule);
        };

        /**
         * 校验实体
         *
         * @param {Object} entity 需要校验的实体
         * @return {Object[]}
         */
        FormModel.prototype.validateEntity = function (entity) {
            if (!this.validator) {
                this.initEntityValidator();
            }

            return this.validator.validate(entity);
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

            return data.save();
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

            return data.update();
        };

        return FormModel;
    }
);
