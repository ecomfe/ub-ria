/**
 * UB RIA Base
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file 详情页Action基类
 * @exports mvc.DetailAction
 * @author otakustay
 */
define(
    function (require) {
        var u = require('../util');

        /**
         * @class mvc.DetailAction
         * @extends mvc.BaseAction
         */
        var exports = {};

        /**
         * 当前页面的分类，始终为`"detail"`
         *
         * @type {string}
         * @readonly
         * @override
         */
        exports.category = 'detail';

        /**
         * 获取指定的跳转URL
         *
         * @param {Object} args 新的请求对象
         * @return {string}
         */
        function getURLForQuery(args) {
            var url = this.context.url;
            var path = url.getPath();

            args = u.purify(args);

            return require('er/URL').withQuery(path, args).toString();
        }

        /**
         * 根据请求重新跳转
         *
         * @protected
         * @method mvc.DetailAction#reloadWithQueryUpdate
         * @param {Object} args 新的请求参数对象
         */
        exports.reloadWithQueryUpdate = function (args) {
            var url = getURLForQuery.call(this, args);
            this.redirect(url, { force: true });
        };

        /**
         * 列表搜索
         *
         * @param {mini-event.Event} e 事件对象
         * @param {boolean} withPage 列表是否用自己的page
         */
        function refreshList(e, withPage) {
            // 防止子Action自己跳转
            e.preventDefault();
            var args = {
                id: this.model.get('id')
            };

            var query = this.view.getListQuery();

            // 当为切换页数的操作，query能自己拿到正确的页数。
            // 否则回到第一页。
            if (!withPage) {
                query.page = 1;
            }

            // 所有列表参数加上`list.`前缀
            u.each(
                query,
                function (value, key) {
                    args['list.' + key] = value;
                }
            );
            this.reloadWithQueryUpdate(args);
        }

        /**
         * 切换页数引起的search
         *
         * @event
         * @param {mini-event.Event} e 事件对象
         */
        function changePage(e) {
            refreshList.call(this, e, true);
        }

        /**
         * 初始化交互行为
         *
         * @override
         */
        exports.initBehavior = function () {
            this.$super(arguments);
            this.view.on('listrefresh', refreshList, this);
            this.view.on('pagechange', changePage, this);
        };


        var BaseAction = require('./BaseAction');
        var DetailAction = require('eoo').create(BaseAction, exports);
        return DetailAction;
    }
);
