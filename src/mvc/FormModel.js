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

        var datasource = require('er/datasource');
        var defaultDatasource = {
            rule: datasource.constant(require('./rule'))
        };

        /**
         * 默认数据源配置
         *
         * @param {Object}
         * @override
         */
        FormModel.prototype.defaultDatasource = u.extend(
            defaultDatasource, SingleEntityModel.prototype.defaultDatasource);

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
            var data = this.data();
            if (!data) {
                throw new Error(
                    'No default data object attached to this Model');
            }
            if (typeof data.save !== 'function') {
                throw new Error(
                    'No save method implemented on default data object');
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
                throw new Error(
                    'No default data object attached to this Model');
            }
            if (typeof data.update !== 'function') {
                throw new Error(
                    'No update method implemented on default data object');
            }

            // 更新默认加上id
            entity.id = this.get('id');

            return data.update(entity);
        };

        return FormModel;
    }
);
