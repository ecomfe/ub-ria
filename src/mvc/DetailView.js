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
        var u = require('underscore');
        var util = require('er/util');

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
                this, 'search',
                { preserveData: true, syncState: true }
            );
            delegate(
                listActionPanel, 'action@pagechange',
                this, 'listpagechange',
                { preserveData: true, syncState: true }
            );
            delegate(
                listActionPanel, 'action@statusupdate',
                this, 'liststatusupdate',
                { preserveData: true, syncState: true }
            );

            this.$super(arguments);
        };

        var BaseView = require('./BaseView');
        var DetailView = require('eoo').create(BaseView, exports);
        return DetailView;
    }
);
