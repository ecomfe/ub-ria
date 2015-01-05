/**
 * UB RIA Base
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file 静态排序数据类
 * @exports ub-ria.mvc.StaticListData
 * @author lixiang
 *         shenbnin(bobshenbin@gmail.com)
 */
define(
    function (require) {
        var u = require('underscore');

        /**
         * @class ub-ria.mvc.StaticListData
         * @extends ub-ria.mvc.RequestManager
         */
        var exports = {};

        /**
         * 获取一个实体列表（不分页）
         *
         * @public
         * @method ub-ria.mvc.StaticListData#list
         * @param {Object} query 查询参数
         * @return {er.meta.FakeXHR}
         */
        exports.list = function (query) {
            return this.request(
                '$entity/list',
                query,
                {
                    method: 'GET',
                    url: '/$entity'
                }
            );
        };

        /**
         * 返回请求参数中非预期的参数列表
         *
         * @protected
         * @method ub-ria.mvc.StaticListData#getOtherKeys
         * @param {Object} query 查询参数
         * @return {Array.<string>} 请求参数中非预期参数列表
         */
        exports.getOtherKeys = function (query) {
            // 两种情况下要从后端取：
            // 1. 没有缓存数据
            // 2. 参数里不止 pageNo，pageSize, orderBy，order 这几个参数
            var keys = u.keys(query);
            var targetKeys = ['pageNo', 'pageSize', 'orderBy', 'order'];

            return u.difference(keys, targetKeys);
        };

        /**
         * 过滤数据
         *
         * @param {Object} query 查询条件
         * @return {number}
         */
        function filterData(query) {
            var sortData = u.clone(this.cacheList);
            var results = sortData.results;
            // 补上totalCount
            sortData.totalCount = results.length;

            // 先排序
            if (query.orderBy) {
                this.sort(results, query.order, query.orderBy);
            }

            // 再截断
            if (query.pageNo) {
                // 0代表起始
                var start =  (query.pageNo - 1) * query.pageSize;
                var end = Math.min(start + query.pageSize, results.length);
                results = results.slice(start, end);
                sortData.results = results;
            }

            return sortData;
        }

        /**
         * 检索一个实体列表，返回一个结果集
         *
         * @public
         * @method ub-ria.mvc.StaticListData#search
         * @param {Object} query 查询参数
         * @return {er.meta.FakeXHR}
         */
        exports.search = function (query) {
            var searching = null;

            var otherKeys = this.getOtherKeys(query);
            if (!this.cacheList || otherKeys.length) {
                var cache = function (data) {
                    this.cacheList = data;
                    return filterData.call(this, query);
                };

                searching = this.list(query).then(u.bind(cache, this));
            }
            else {
                searching = require('er/Deferred').resolved(filterData.call(this, query));
            }

            return searching;
        };

        /**
         * 返回全集
         *
         * @public
         * @method ub-ria.mvc.StaticListData#getCacheList
         * @return {Array}
         */
        exports.getCacheList = function () {
            return this.cacheList;
        };

        /**
         * 比较算法
         *
         * @param {string | number} a 原数据源第j个数据
         * @param {string | number} b 原数据源第j-1个数据
         * @param {string} order desc | asc
         * @return {number}
         */
        function compare(a, b, order) {
            var symbol = 1;

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

            var aIsNumber = !isNaN(a);
            var bIsNumber = !isNaN(b);

            // a, b 都是数字
            if (aIsNumber && bIsNumber) {
                return symbol * (parseFloat(a) - parseFloat(b));
            }

            // a, b 如果有一个能转成数字
            // 能转成数字的永远大。
            if (aIsNumber || bIsNumber) {
                return aIsNumber ? (symbol * 1) : (symbol * -1) ;
            }

            // 否则就是文字对比
            return symbol * (a + '').localeCompare(b);
        }

        /**
         * 排序
         * js原生的sort方法在不同浏览器上表现不同（稳定或不稳定）
         * 因此自己写一个稳定排序, 冒泡排序
         *
         * @public
         * @method ub-ria.mvc.StaticListData#sort
         * @param {array} array 待排序数组
         * @param {string} order desc | asc
         * @param {string} orderBy 排序字段
         */
        exports.sort = function (array, order, orderBy) {
            var length = array.length;
            for (var i = 0; i <= length - 2; i++) {
                for (var j = length - 1; j >= 1; j--) {
                    // 对两个元素进行交换
                    compare('', 0, 'desc');
                    var compareResult = compare(
                        array[j][orderBy],
                        array[j - 1][orderBy],
                        order
                    );

                    if (compareResult > 0) {
                        var temp = array[j];
                        array[j] = array[j - 1];
                        array[j - 1] = temp;
                    }
                }
            }
        };

        var RequestManager = require('ub-ria/mvc/RequestManager');
        var StaticListData = require('eoo').create(RequestManager, exports);

        return StaticListData;
    }
);
