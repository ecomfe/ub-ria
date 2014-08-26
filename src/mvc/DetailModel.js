/**
 * UB RIA Base
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file 详情页Model基类
 * @class DetailModel
 * @extends mvc.SingleEntityModel
 * @author otakustay
 */
define(
    function (require) {
        var u = require('underscore');
        var util = require('er/util');

        var exports = {};

        /**
         * 获取列表子Action的URL
         *
         * @return {string}
         */
        exports.getListActionURL = function () {
            var query = this.get('url').getQuery();
            // 所有给列表用的参数加上`list.`为前缀
            var args = {};
            u.each(
                query,
                function (value, key) {
                    if (key.indexOf('list.') === 0) {
                        args[key.substring(5)] = value;
                    }
                }
            );
            if (query.id) {
                // 原`id`字段用于详情页，传递给列表页要变为`xxxIds`的查询条件
                args[this.entityName + 'Id'] = query.id;
            }
            var URL = require('er/URL');
            var actionURL =
                URL.withQuery('/' + this.getListActionName() + '/list', args);
            return actionURL + '';
        };

        exports.getListActionName = function () {
            return this.entityName;
        };

        /**
         * 获取当前详情页对应树节点的的实体名称
         *
         * 默认使用`entityName`，但并不一定会相同，通过重写此方法覆盖
         *
         * @return {string}
         */
        exports.getTreeNodeEntityName = function () {
            return this.entityName;
        };

        /**
         * 设置列表子Action的URL
         */
        function setListActionURL() {
            var url = this.getListActionURL();
            this.set('listActionURL', url);
        }

        /**
         * 加载数据
         *
         * @return {er.meta.Promise}
         */
        exports.load = function () {
            var loading = this.$super(arguments);
            return loading.then(u.bind(setListActionURL, this));
        };

        var SingleEntityModel = require('./SingleEntityModel');
        var DetailModel = require('eoo').create(SingleEntityModel, exports);
        return DetailModel;
    }
);
