/**
 * UB RIA Base
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file 详情页Action基类
 * @class DetailAction
 * @extends mvc.BaseAction
 * @author otakustay
 */
define(
    function (require) {
        var u = require('underscore');

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
            // 扩展原有url
            args = u.extend(url.getQuery(), args);
            args = require('../util').purify(args);

            return require('er/URL').withQuery(path, args).toString();
        }

        /**
         * 根据请求重新跳转
         *
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
         * @param {Object} e.args 查询参数
         * @ignore
         */
        function search(e) {
            // 防止子Action自己跳转
            e.preventDefault();
            var args = {
                id: this.model.get('id')
            };
            // 所有列表参数加上`list.`前缀
            u.each(
                e.args,
                function (value, key) {
                    args['list.' + key] = value;
                }
            );
            this.reloadWithQueryUpdate(args);
        }

        /**
         * - 详情页列表中切换页面后，必须让整个`detail`页刷新。
         * - 否则`f5`后，列表又会回到第一页。
         */
        function forwardToPage(e) {
            // 防止子Action自己跳转
            e.preventDefault();
            this.reloadWithQueryUpdate({ 'list.page': e.page });
        }

        /**
         * - 详情页列表中的数据，切换状态后，必须让整个`detail`页刷新。
         * - 否则`detail`上方的统计信息将得不到更新。
         */
        function reloadEntityStatus(e) {
            // 防止子Action自己跳转
            e.preventDefault();
            this.reloadWithQueryUpdate({});
        }

        /**
         * 初始化交互行为
         *
         * @override
         */
        exports.initBehavior = function () {
            this.$super(arguments);

            this.view.on('search', search, this);
            this.view.on('listpagechange', forwardToPage, this);
            this.view.on('liststatusupdate', reloadEntityStatus, this);
        };


        var BaseAction = require('./BaseAction');
        var DetailAction = require('eoo').create(BaseAction, exports);
        return DetailAction;
    }
);
