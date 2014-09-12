/**
 * UB RIA Base
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file 详情页视图基类
 * @class DetailView
 * @extends mvc.BaseView
 * @author otakustay
 */
define(
    function (require) {
        var exports = {};

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
                { preserveData: true, syncState: true }
            );
            // 其它操作都需要把页码置为1
            delegate(
                listActionPanel, 'action@pagechange',
                this, 'pagechange',
                { preserveData: true, syncState: true }
            );
            delegate(
                listActionPanel, 'action@statusupdate',
                this, 'listrefresh',
                { preserveData: true, syncState: true }
            );
            delegate(
                listActionPanel, 'action@pagesizechange',
                this, 'listrefresh',
                { preserveData: true, syncState: true }
            );
            delegate(
                listActionPanel, 'action@tablesort',
                this, 'listrefresh',
                { preserveData: true, syncState: true }
            );
            this.$super(arguments);
        };

        /**
         * 获取列表子Action的查询条件
         *
         * @method DetailView#.getListQuery
         * @return {object} 查询条件
         */
        exports.getListQuery = function () {
            var listAction = this.getSafely('detail-list').get('action');
            if (listAction) {
                return listAction.getSearchQuery();
            }
            else {
                return {};
            }
        };

        var BaseView = require('./BaseView');
        var DetailView = require('eoo').create(BaseView, exports);
        return DetailView;
    }
);
