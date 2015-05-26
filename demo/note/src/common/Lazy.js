/**
 * DEMO
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 延迟加载类
 * @exports common.Lazy
 * @author otakustay
 */
define(
    function (require) {
        /**
         * 延迟加载类
         *
         * 这是一个工具类，可以将加载数据延迟到第一次调用的时候，且会缓存结果
         *
         * @class common.Lazy
         */
        var exports = {};

        /**
         * @constructs common.Lazy
         *
         * @param {Function} fetch 获取数据的函数，必须返回`Promise`对象
         */
        exports.constructor = function (fetch) {
            this.fetch = fetch;
        };

        /**
         * 获取值
         *
         * @public
         * @method common.Lazy#value
         * @return {er.meta.Promise}
         */
        exports.value = function () {
            if (this.fetchResult) {
                return require('promise').resolve(this.fetchResult);
            }

            this.fetchResult = this.fetch().thenBind(this.cacheResult, this);
            return this.fetchResult;
        };

        /**
         * 让缓存的值过期
         *
         * @public
         * @method common.Lazy#expire
         */
        exports.expire = function () {
            this.fetchResult = null;
        };

        /**
         * 重新加载数据
         *
         * @public
         * @method common.Lazy#reload
         * @return {er.meta.Promise}
         */
        exports.reload = function () {
            this.expire();
            return this.value();
        };

        /**
         * 缓存获取的结果
         *
         * @protected
         * @method common.Lazy#cacheResult
         * @param {*} result 获取的结果
         * @return {*} 缓存的结果
         */
        exports.cacheResult = function (result) {
            this.fetchResult = result;
            return this.fetchResult;
        };

        var Lazy = require('eoo').create(exports);
        return Lazy;
    }
);
