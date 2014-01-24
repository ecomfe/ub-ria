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
                id: this.model.get('id'),
                treeKeyword: this.model.get('treeKeyword')
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
         * @param {string} keyword 查询的关键词
         * @ignore
         */
        function searchTree(keyword) {
            this.model.set('treeKeyword', keyword);
            this.model.filterTreeDatasource();
            this.view.refreshTree();
        }

        function forwardToPage(e) {
            // 防止子Action自己跳转
            e.preventDefault();

            var url = this.getURLForPage(e.page);
            this.redirect(url);
        }

        function redirectToTreeKeyword(e) {
            var url = this.context.url;
            var path = url.getPath();
            var query = url.getQuery();

            if (!e.keyword) {
                query = u.omit(query, 'treeKeyword');
            }
            else {
                query.treeKeyword = e.keyword;
            }

            var targetURL = require('er/URL').withQuery(path, query);
            this.redirect(targetURL);
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
            this.view.on('searchtree', redirectToTreeKeyword, this);
            this.view.on('listpagechange', forwardToPage, this);
        };

        DetailAction.prototype.filterRedirect = function (targetURL) {
            var diff = this.context.url.compare(targetURL);
            // 如果只有`treeKeyword`有变化，那么拦截掉这一次的重定向，直接搜索导航树
            if (!diff.path
                && diff.queryDifference.length === 1
                && diff.query.treeKeyword
            ) {
                this.context.url = targetURL;
                var treeKeyword = diff.query.treeKeyword.other;
                searchTree.call(this, treeKeyword);
                return false;
            }
        };
        
        return DetailAction;
    }
);
