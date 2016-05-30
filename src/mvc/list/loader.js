/**
 * UB RIA Base
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 列表loader函数集
 * @author otakustay
 */

import u from '../../util';

/**
 * 加载列表
 *
 * @param {emc.Model} model 当前数据模型实例
 * @return {Object} 返回的数据
 */
export let list = async model => {
    let query = model.getQuery();
    query = u.purify(query, null, true);

    let response = await model.search(query);
    return response;
};

/**
 * 加载每页显示项目数
 *
 * @param {emc.Model} model 当前数据模型实例
 * @return {Object} 返回的数据
 */
export let pageSize = async model => {
    let globalData = model.data('global');
    let result = await globalData.getUser();
    return {pageSize: result.pageSize};
};
