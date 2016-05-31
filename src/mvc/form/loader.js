/**
 * UB RIA Base
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 列表loader函数集
 * @author otakustay
 */

/**
 * 加载实体
 *
 * @param {emc.Model} model 当前数据模型实例
 * @return {Object} 返回的数据
 */
export let entity = async model => {
    // 如新建页之类的是不需要这个实体的，因此通过是否有固定的`id`字段来判断
    let id = model.get('id');

    if (id) {
        // 可能作为子Action的时候，从外面传了进来一个实体，
        // 这个时候就不用自己加载了，直接展开用就行了
        let entity = model.get('entity');
        if (!entity) {
            entity = await model.findById(id);
        }

        return Object.assign({entity}, entity);
    }

    return {};
};
