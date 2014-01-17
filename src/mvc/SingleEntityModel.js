/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 以单个实体为主要数据源的页面的数据模型基类
 * @author otakustay
 * @date $DATE$
 */
define(
    function (require) {
        var u = require('underscore');
        var util = require('er/util');
        var BaseModel = require('common/BaseModel');

        /**
         * 以单个实体为主要数据源的页面的数据模型基类
         *
         * @extends BaseModel
         * @constructor
         */
        function SingleEntityModel() {
            BaseModel.apply(this, arguments);
        }

        util.inherits(SingleEntityModel, BaseModel);

        /**
         * 把实体信息展开到`Model`自身上，以便直接访问到某些属性
         *
         * @param {Object} entity 加载来的实体信息
         * @return {Object} 返回`entity`自身
         * @ignore
         */
        function fillEntityToModel(entity) {
            // 而这个实体信息本身还要单独以`entity`为键保存一份，当取消编辑时用作比对
            this.fill(entity);
            return entity;
        }

        /**
         * 默认数据源配置
         * 
         * 为了方便子类覆盖或者串行加载时放在指定位置，暴露到外面
         *
         * @param {Object}
         */
        SingleEntityModel.prototype.defaultDatasource = {
            entity: function (model) {
                // 如新建页之类的是不需要这个实体的，因此通过是否有固定的`id`字段来判断
                var id = model.get('id');

                if (id) {
                    // 可能作为子Action的时候，从外面传了进来一个实体，
                    // 这个时候就不用自己加载了，直接展开用就行了
                    var entity = model.get('entity');
                    if (entity) {
                        return fillEntityToModel.call(model, entity);
                    }
                    else {
                        return model.findById(id)
                            .then(u.bind(fillEntityToModel, model));
                    }
                }
                else {
                    return {};
                }
            }
        };

        /**
         * 根据id获取实体
         *
         * @param {string | number} id 实体的id
         * @return {er.Promise}
         */
        SingleEntityModel.prototype.findById = function (id) {
            if (!this.data) {
                throw new Error('No data object attached to this FormModel');
            }
            if (typeof this.data.findById !== 'function') {
                throw new Error(
                    'No findById method implemented on data object');
            }

            return this.data.findById(id);
        };
        
        return SingleEntityModel;
    }
);        
