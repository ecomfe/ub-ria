/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 详情页Model基类
 * @author otakustay
 * @date $DATE$
 */
define(
    function (require) {
        var u = require('underscore');
        var util = require('er/util');
        var SingleEntityModel = require('./SingleEntityModel');

        /**
         * 频道列表数据模型类
         *
         * @constructor
         * @extends mvc/SingleEntityModel
         */
        function DetailModel() {
            SingleEntityModel.apply(this, arguments);
        }

        util.inherits(DetailModel, SingleEntityModel);

        /**
         * 构造树的数据源结构
         *
         * @param {Object} data 后端返回的列表数据
         * @return {Object} 符合树的数据源结构
         */
        DetailModel.prototype.buildTreeDatasource = function (data) {
            return data;
        };

        /**
         * 获取导航树的数据源
         *
         * @return {er.meta.Promise}
         */
        DetailModel.prototype.getTreeDatasource = function () {
            var data = this.data();
            if (!data) {
                throw new Error(
                    'No default data object attached to this Model');
            }
            if (typeof data.getTree !== 'function') {
                throw new Error(
                    'getTree method not implemented on defalut data object');
            }

            return data.getTree()
                .then(u.bind(this.buildTreeDatasource, this));
        };

        /**
         * 获取单个子实体标签页的链接
         *
         * @param {string} tab 标签页实体名称
         * @return {string}
         */
        DetailModel.prototype.getURLWithTab = function (tab) {
            var url = this.get('url');

            if (!url) {
                return '';
            }

            // 移动到其它标签页的时候，清除掉所有的查询参数，
            // 保留`id`字段并加上新的`tab`字段
            var query = { tab: tab };
            var id = url.getQuery().id;
            if (id) {
                query.id = id;
            }

            return '#' + require('er/URL').withQuery(url.getPath(), query) + '';
        };

        /**
         * 获取列表子Action的URL
         *
         * @return {string}
         */
        DetailModel.prototype.getListActionURL = function () {
            var tabs = this.get('tabs');
            var activeTab = this.get('tab')
                ? u.findWhere(tabs, { type: this.get('tab') })
                : tabs[0];

            if (!activeTab) {
                return '';
            }

            var activeTabType = activeTab.type;

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
                URL.withQuery('/' + activeTabType + '/list', args);
            return actionURL + '';
        };

        /**
         * 获取当前详情页对应树节点的的实体名称
         *
         * 默认使用`entityName`，但并不一定会相同，通过重写此方法覆盖
         *
         * @return {string}
         */
        DetailModel.prototype.getTreeNodeEntityName = function () {
            return this.entityName;
        };

        var defaultDatasource = {
            // 导航树的数据源
            treeDatasource: function (model) {
                return model.getTreeDatasource();
            },

            activeNode: function (model) {
                if (model.get('id')) {
                    var entityName = model.getTreeNodeEntityName();
                    entityName = entityName.replace(
                        /[A-Z]/,
                        function (word) {
                            return '-' + word.toLowerCase();
                        }
                    );

                    return entityName + '-' + model.get('id');
                }
                else {
                    return 'all';
                }
            }
        };

        /**
         * 默认数据源配置
         * 
         * @param {Object}
         * @override
         */
        DetailModel.prototype.defaultDatasource = u.extend(
            defaultDatasource, SingleEntityModel.prototype.defaultDatasource);

        /**
         * 调整Tab的数据源，加上`href`属性
         */
        function adjustTabs() {
            var tabs = this.get('tabs');
            if (tabs) {
                tabs = u.map(
                    tabs,
                    function (tab) {
                        tab = u.clone(tab);
                        tab.href = this.getURLWithTab(tab.type);
                        return tab;
                    },
                    this
                );
                this.set('tabs', tabs);
            }
            return this;
        }

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
         * @param {er.meta.Promise}
         */
        DetailModel.prototype.load = function () {
            var loading = 
                SingleEntityModel.prototype.load.apply(this, arguments);
            return loading
                .then(u.bind(adjustTabs, this))
                .then(u.bind(setListActionURL, this));
        };
        
        return DetailModel;
    }
);        
