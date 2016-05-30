/**
 * UB RIA Base
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 以单个实体为主要数据源的页面的数据模型基类
 * @author otakustay
 */

import BaseModel from './BaseModel';

const ENTITY = {
    async entity(model) {
        // 如新建页之类的是不需要这个实体的，因此通过是否有固定的`id`字段来判断
        let id = model.get('id');

        if (id) {
            // 可能作为子Action的时候，从外面传了进来一个实体，
            // 这个时候就不用自己加载了，直接展开用就行了
            let entity = model.get('entity');
            if (!entity) {
                entity = await model.findById(id);
                // 而这个实体信息本身还要单独以`entity`为键保存一份，当取消编辑时用作比对
                model.set('entity', entity);
            }

            model.fill(entity);
            return entity;
        }

        return {};
    }
};

/**
 * 以单个实体为主要数据源的页面的数据模型基类
 *
 * @class mvc.SingleEntityModel
 * @extends mvc.BaseModel
 */
export default class SingleEntityModel extends BaseModel {

    /**
     * @constructs mvc.SingleEntityModel
     * @override
     */
    constructor() {
        super();

        this.putDatasource(ENTITY);
    }

    /**
     * 根据id获取实体
     *
     * @param {string | number} id 实体的id
     * @return {Promise.<Object>}
     */
    async findById(id) {
        let data = this.data();
        if (!data) {
            throw new Error('No default data object attached to this Model');
        }
        if (typeof data.findById !== 'function') {
            throw new Error('No findById method implemented on default data object');
        }

        return data.findById(id);
    }
}
