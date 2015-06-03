/**
 * UB RIA Base
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 表单数据模型基类
 * @author otakustay
 */

import SingleEntityModel from './SingleEntityModel';

/**
 * 表单数据模型基类
 *
 * @class mvc.FormModel
 * @extends mvc.SingleEntityModel
 */
export default class FormModel extends SingleEntityModel {
    /**
     * 设置全局数据对象
     *
     * @method mvc.FormModel#setGlobalData
     * @param {Object} data 全局数据对象
     */
    setGlobalData(data) {
        this.addData('global', data);
    }

    /**
     * 检查实体数据完整性，可在此补充一些视图无法提供的属性
     *
     * @protected
     * @method mvc.FormModel#fillEntity
     * @param {Object} entity 实体数据
     * @return {Object} 补充完整的实体数据
     */
    fillEntity(entity) {
        return entity;
    }

    /**
     * 校验实体
     *
     * @method mvc.FormModel#validateEntity
     * @param {Object} entity 需要校验的实体
     * @return {Object[]}
     */
    validateEntity(entity) {
        return [];
    }

    /**
     * 保存新建的实体
     *
     * @method mvc.FormModel#save
     * @param {Object} entity 新建的实体对象
     * @return {Promise}
     */
    async save(entity) {
        entity = this.fillEntity(entity);

        var validationResult = this.validateEntity(entity);

        if (validationResult.length > 0) {
            throw {type: 'validationConflict', fields: validationResult};
        }

        return this.saveEntity(entity);
    }

    /**
     * 更新已有的实体
     *
     * @method mvc.FormModel#update
     * @param {Object} entity 待更新的实体对象
     * @return {Promise}
     */
    async update(entity) {
        entity = this.fillEntity(entity);

        // 更新默认加上id
        entity.id = this.get('id');

        var validationResult = this.validateEntity(entity);

        if (validationResult.length > 0) {
            throw {type: 'validationConflict', fields: validationResult};
        }

        return this.updateEntity(entity);
    }

    /**
     * 完成实体的保存操作
     *
     * @protected
     * @method mvc.FormModel#saveEntity
     * @param {Object} entity 已经补充完整并且验证通过的实体
     * @return {Promise}
     */
    async saveEntity(entity) {
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
     * 完成实体的更新操作
     *
     * @protected
     * @method mvc.FormModel#updateEntity
     * @param {Object} entity 已经补充完整并且验证通过的实体
     * @return {Promise}
     */
    async updateEntity(entity) {
        var data = this.data();
        if (!data) {
            throw new Error('No default data object attached to this Model');
        }
        if (typeof data.update !== 'function') {
            throw new Error('No update method implemented on default data object');
        }

        return data.update(entity);
    }
}
