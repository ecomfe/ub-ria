/**
 * UB RIA Base
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file 详情页视图基类
 * @author otakustay
 */
define(
    function (require) {
        require('../ui/DrawerActionPanel');

        /**
         * @class mvc.DetailView
         * @extends mvc.BaseView
         */
        var exports = {};

        exports.constructor = function () {
            this.$super(arguments);

            var uiEvents = {
                'create:click': popDrawerActionPanel,
                'modify:click': popDrawerActionPanel
            };
            this.addUIEvents(uiEvents);
        };

        /**
         * 弹出drawerActionPanel
         *
         * @event
         * @param {mini-event.Event} e 事件参数
         */
        function popDrawerActionPanel(e) {
            e.preventDefault();
            var url = e.target.get('href') + '';

            // 传给 ActionPanel 的 url 是不能带 hash 符号的。。
            if (url.charAt(0) === '#') {
                url = url.slice(1);
            }
            this.popDrawerAction({url: url}).show();
        }

        /**
         * @override
         */
        exports.popDrawerAction = function (options) {
            var drawerActionPanel = this.$super(arguments);

            drawerActionPanel.on('action@submitcancel', cancel);
            drawerActionPanel.on('action@back', back);

            return drawerActionPanel;
        };

        /**
         * 取消
         *
         * @event
         * @param {mini-event.Event} e 事件参数
         */
        function cancel(e) {
            e.preventDefault();
            this.dispose();
        }

        /**
         * 返回
         *
         * @event
         * @param {mini-event.Event} e 事件参数
         */
        function back(e) {
            e.stopPropagation();
            e.preventDefault();
            this.hide();
        }

        /**
         * 绑定控件事件
         *
         * @override
         */
        exports.bindEvents = function () {
            var delegate = require('mini-event').delegate;

            // 子Action提交查询请求转发出去
            var listActionPanel = this.getSafely('detail-list');
            delegate(
                listActionPanel, 'action@search',
                this, 'listrefresh',
                {preserveData: true, syncState: true}
            );
            // 其它操作都需要把页码置为1
            delegate(
                listActionPanel, 'action@pagechange',
                this, 'pagechange',
                {preserveData: true, syncState: true}
            );
            delegate(
                listActionPanel, 'action@statusupdate',
                this, 'listrefresh',
                {preserveData: true, syncState: true}
            );
            delegate(
                listActionPanel, 'action@pagesizechange',
                this, 'listrefresh',
                {preserveData: true, syncState: true}
            );
            delegate(
                listActionPanel, 'action@tablesort',
                this, 'listrefresh',
                {preserveData: true, syncState: true}
            );
            this.$super(arguments);
        };

        /**
         * 获取列表子Action的查询条件
         *
         * @public
         * @method mvc.DetailView#getListQuery
         * @return {Object} 查询条件
         */
        exports.getListQuery = function () {
            var listAction = this.getSafely('detail-list').get('action');
            if (listAction) {
                return listAction.getSearchQuery();
            }

            return {};
        };

        var BaseView = require('./BaseView');
        var DetailView = require('eoo').create(BaseView, exports);

        return DetailView;
    }
);
