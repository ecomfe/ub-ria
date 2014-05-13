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
        var Deferred = require('er/Deferred');
        var EntityValidator = require('./EntityValidator');

        /**
         * 表单数据模型基类
         *
         * @extends SingleEntityModel
         * @constructor
         */
        function FormModel() {
            SingleEntityModel.apply(this, arguments);

            this.createEntityValidator();
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
         * 为FormModel对象添加validator的函数，需要被重写
         *  XXXModel.prototype.createEntityValidator = function() {
         *      FormModel.prototype.createEntityValidator.apply(this, arguments);

         *      var schema = require('./schema');
         *      this.validator.set('schema', schema);
         *  }
         * 
         */
        FormModel.prototype.createEntityValidator = function () {
            var rule = this.model.get('rule');
            var EntityValidator = require('./EntityValidator');
            
            this.validator = new EntityValidator();
            this.validator.set('rule', rule);
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

            entity = this.fillEntity(entity);

            var deferred = new Deferred();

            syncValidateSubmit.call(this, entity, deferred, 'save'); 

            return deferred.promise; 
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

            entity = this.fillEntity(entity);

            // 更新默认加上id
            entity.id = this.get('id');

            var deferred = new Deferred();

            syncValidateSubmit.call(this, entity, deferred, 'update');

            return deferred.promise;  
        };

        /**
         * 根据实体定义验证传入的实体，若成功，调用update或save方法，
         * 若失败，reject错误消息；此外，将验证与提交的promise状态同步
         *
         * @param {object} entity 待提交的实体
         * @param {er.Deferred} deferred 用于同步验证、提交状态的deferred对象
         * @param {string} type 保存或更新
         * @ignore
         */
        function syncValidateSubmit(entity, deferred, type) {
            var data = this.data();
            var promise = this.validator.validate(entity);
            promise.then(
                function () {
                    data[type](entity).then(
                        deferred.resolver.resolve,
                        deferred.resolver.reject
                    );
                }, 
                function (errors) {
                    deferred.reject(errors);
                }
            );
        }

        return FormModel;
    }
);
