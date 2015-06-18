/**
 * UB RIA Base
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 静态排序数据类
 * @author lixiang, shenbnin
 */

import u from '../util';
import RequestManager from './RequestManager';

/**
 * 静态搜索相关搜索参数
 *
 * @const
 * @type {Array}
 */
const STATIC_KEYS = ['order', 'orderBy', 'pageNo', 'pageSize'];

const CACHE_LIST = Symbol('cacheList');

/**
 * 比较算法
 *
 * @param {string | number} a 原数据源第j个数据
 * @param {string | number} b 原数据源第j-1个数据
 * @param {string} order desc | asc
 * @return {number}
 */
let compare = (a, b, order) => {
    let symbol = 1;

    if (order === 'asc') {
        symbol = -1;
    }

    // 相等，返回0
    if (a === b) {
        return 0;
    }

    if (a == null && b == null) {
        return 0;
    }

    // b是null，desc时排在最后
    if (b == null) {
        return symbol * 1;
    }
    else if (a == null) {
        return symbol * (-1);
    }

    let aIsNumber = !isNaN(a);
    let bIsNumber = !isNaN(b);

    // a, b 都是数字
    if (aIsNumber && bIsNumber) {
        return symbol * (parseFloat(a) - parseFloat(b));
    }

    // a, b 如果有一个能转成数字
    // 能转成数字的永远大。
    if (aIsNumber || bIsNumber) {
        return aIsNumber ? (symbol * 1) : (symbol * -1);
    }

    // 否则就是文字对比
    return symbol * (a + '').localeCompare(b);
};

/**
 * 静态排序数据类
 *
 * @class mvc.StaticListData
 * @extends mvc.RequestManager
 */
export default class StaticListData extends RequestManager {

    /**
     * 获取一个实体列表（不分页）
     *
     * @method mvc.StaticListData#list
     * @param {Object} query 查询参数
     * @return {Promise.<meta.ListResponse>}
     */
    list(query) {
        return this.request(
            '$entity/list',
            query,
            {
                method: 'GET',
                url: '/$entity'
            }
        );
    }

    /**
     * 过滤数据
     *
     * @protected
     * @method mvc.StaticListData#filterData
     * @param {Object} query 查询条件
     * @return {Object}
     */
    filterData(query) {
        let sortData = u.clone(this[CACHE_LIST]);
        let results = sortData.results;
        // 补上totalCount
        sortData.totalCount = results.length;

        // 先排序
        if (query.orderBy) {
            this.sort(results, query.order, query.orderBy);
        }

        // 再截断
        if (query.pageNo) {
            // 0代表起始
            let start = (query.pageNo - 1) * query.pageSize;
            let end = Math.min(start + query.pageSize, results.length);
            results = results.slice(start, end);
            // 深克隆一下，免得外部对数据的修改影响到cache
            sortData.results = u.deepClone(results);
        }

        return sortData;
    }

    /**
     * 检索一个实体列表，返回一个结果集
     *
     * @method mvc.StaticListData#search
     * @param {Object} query 查询参数
     * @return {Promise.<meta.ListResponse>}
     */
    async search(query) {
        let isStaticKeyChanged = this.checkStaticKeyChanged(query);
        if (isStaticKeyChanged) {
            u.extend(this, u.pick(query, STATIC_KEYS));
        }

        if (!this[CACHE_LIST] || !isStaticKeyChanged) {
            let list = await this.list(query);
            return this.doCache(list, query);
        }

        return this.filterData(query);
    }

    /**
     * 数据缓存方法
     *
     * @protected
     * @param {Object} data 要做cache的数据
     * @param {Object} query 过滤参数
     * @return {meta.ListResponse} 过滤后数据
     */
    doCache(data, query) {
        this[CACHE_LIST] = data;
        return this.filterData(query);
    }

    /**
     * 判断静态搜索相关的字段是否变化
     *
     * @method mvc.StaticListData#checkStaticKeyChanged
     * @param  {Object} query 搜索参数
     * @return {boolean}
     */
    checkStaticKeyChanged(query) {
        return STATIC_KEYS.some((key) => this[key] !== query[key]);
    }

    /**
     * 排序js原生的sort方法在不同浏览器上表现不同（稳定或不稳定），因此自己写一个稳定排序, 冒泡排序
     *
     * @method mvc.StaticListData#sort
     * @param {Array} array 待排序数组
     * @param {string} order desc | asc
     * @param {string} orderBy 排序字段
     */
    sort(array, order, orderBy) {
        let length = array.length;
        for (let i = 0; i <= length - 2; i++) {
            for (let j = length - 1; j >= 1; j--) {
                // 对两个元素进行交换
                compare('', 0, 'desc');
                let compareResult = compare(
                    array[j][orderBy],
                    array[j - 1][orderBy],
                    order
                );

                if (compareResult > 0) {
                    let temp = array[j];
                    array[j] = array[j - 1];
                    array[j - 1] = temp;
                }
            }
        }
    }
}
