/**
 * UB RIA Base
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file 静态排序数据类
 * @exports mvc.StaticListData
 * @author lixiang
 *         shenbnin(bobshenbin@gmail.com)
 */
define(
    function (require) {
        var u = require('../util');

        /**
         * 静态搜索相关搜索参数
         * @type {Array}
         */
        var STATIC_KEYS = ['order', 'orderBy', 'pageNo', 'pageSize'];

        /**
         * @class mvc.StaticListData
         * @extends mvc.RequestManager
         */
        var exports = {};

        /**
         * 获取一个实体列表（不分页）
         *
         * @public
         * @method mvc.StaticListData#list
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
         * 过滤数据
         *
         * @protected
         * @method mvc.StaticListData#filterData
         * @param {Object} query 查询条件
         * @return {Object}
         */
        exports.filterData = function (query) {
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
        };

        /**
         * 检索一个实体列表，返回一个结果集
         *
         * @public
         * @method mvc.StaticListData#search
         * @param {Object} query 查询参数
         * @return {er.meta.FakeXHR}
         */
        exports.search = function (query) {
            var isStaticKeyChanged = this.checkStaticKeyChanged(query);
            if (isStaticKeyChanged) {
                u.extend(this, u.pick(query, STATIC_KEYS));
            }
            if (!this.cacheList || !isStaticKeyChanged) {
                var cache = function (data) {
                    return this.doCache(data, query);
                };
                return this.list(query).then(u.bind(cache, this));
            }
            return require('er/Deferred').resolved(this.filterData(query));
        };

        /**
         * 数据缓存方法
         *
         * @protected
         * @param {Object} data 要做cache的数据
         * @param {Object} query 过滤参数
         * @return {Object} 过滤后数据
         */
        exports.doCache = function (data, query) {
            this.cacheList = data;
            return this.filterData(query);
        };

        /**
         * 判断静态搜索相关的字段是否变化
         *
         * @public
         * @method mvc.StaticListData#checkStaticKeyChanged
         * @param  {Object} query 搜索参数
         * @return {boolean}
         */
        exports.checkStaticKeyChanged = function (query) {
            return u.some(
                STATIC_KEYS,
                function (key) {
                    return this[key] !== query[key];
                },
                this
            );
        };

        /**
         * 返回全集
         *
         * @public
         * @method mvc.StaticListData#getCacheList
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
         * @method mvc.StaticListData#sort
         * @param {Array} array 待排序数组
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

        var RequestManager = require('./RequestManager');
        var StaticListData = require('eoo').create(RequestManager, exports);

        return StaticListData;
    }
);
