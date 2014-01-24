/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 详情页Action基类
 * @author otakustay
 * @date $DATE$
 */
define(
    function (require) {
        var util = require('er/util');
        var u = require('underscore');
        var BaseAction = require('./BaseAction');

        /**
         * 详情页Action基类
         *
         * @extends mvc/BaseAction
         * @constructor
         */
        function DetailAction(entityName) {
            BaseAction.apply(this, arguments);
        }

        util.inherits(DetailAction, BaseAction);

        DetailAction.prototype.modelType = './DetailModel';

        /**
         * 获取指定页码的跳转URL
         *
         * @param {number} page 指定的页码
         * @return {string}
         */
        DetailAction.prototype.getURLForPage = function (page) {
            var url = this.context.url;
            var path = url.getPath();
            var query = url.getQuery();
            
            if (page === 1) {
                query = u.omit(query, 'list.page');
            }
            else {
                query['list.page'] = page;
            }

            return require('er/URL').withQuery(path, query).toString();
        };

        /**
         * 列表搜索
         *
         * @param {mini-event.Event} e 事件对象
         * @param {Object} e.args 查询参数
         * @ignore
         */
        function search(e) {
            // 禁止子Action自己跳转
            e.preventDefault();

            var args = {
                tab: this.model.get('tab'),
                id: this.model.get('id')
            };
            // 所有列表参数加上`list.`前缀
            u.each(
                e.args,
                function (value, key) {
                    args['list.' + key] = value;
                }
            );
            args = u.purify(args);
            var path = this.model.get('url').getPath();
            var URL = require('er/URL');
            var url = URL.withQuery(path, args);
            this.redirect(url, { force: true });
        }

        /**
         * 根据侧边栏导航树选中的项目进行跳转
         *
         * @param {mini-event.Event} e 事件对象
         * @parma {Object} e.node 选中的节点
         * @ignore
         */
        function redirectToItem(e) {
            var node = e.node;
            // 每个节点的id的规则是`{type}-{entityId}`，所以分解后最后一个就是实体id
            var id = node.id.split('-').pop();
            var url = node.href
                ? node.href
                : '/' + node.type + '/detail~id=' + id;
            this.redirect(url);
        }

        /**
         * 对左侧导航树进行检索
         *
         * @param {Object} e 事件对象
         * @param {string} e.keyword 检索的关键词
         * @ignore
         */
        function searchTree(e) {
            var filterTree = require('../filterTree');
            var tree = this.model.get('treeDatasource');
            if (e.keyword) {
                tree = u.deepClone(tree);
                // 保留第1个“全部xxx”
                var all = tree.children[0];
                tree = filterTree.byKeyword(tree, e.keyword);
                if (all && all.id === 'all') {
                    tree.children.unshift(all);
                }
            }

            this.model.set('treeKeyword', e.keyword);
            this.model.set('filteredTreeDatasource', tree);
            this.view.refreshTree();
        }

        function forwardToPage(e) {
            // 防止子Action自己跳转
            e.preventDefault();

            var url = this.getURLForPage(e.page);
            this.redirect(url);
        }

        /**
         * 初始化交互行为
         *
         * @override
         */
        DetailAction.prototype.initBehavior = function () {
            BaseAction.prototype.initBehavior.apply(this, arguments);

            this.view.on('search', search, this);
            this.view.on('selectitem', redirectToItem, this);
            this.view.on('searchtree', searchTree, this);
            this.view.on('listpagechange', forwardToPage, this);
        };
        
        return DetailAction;
    }
);
