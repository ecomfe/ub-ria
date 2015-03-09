/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 只读页Action基类
 * @author lixiang(lixiang05@baidu.com)
 */
define(
    function (require) {
        /**
         * 只读Action基类
         *
         * @class mvc.ReadAction
         * @extends mvc.BaseAction
         */
        var exports = {};

        /**
         * 当前页面的分类，始终为`"read"`
         *
         * @member mvc.ReadAction#category
         * @type {string}
         * @readonly
         * @override
         */
        exports.category = 'read';

        /**
         * 点击返回后的处理
         *
         * @protected
         * @method mvc.ReadAction#returnBack
         */
        exports.returnBack = function () {
            // 默认返回列表页
            this.fire('back');
        };

        /**
         * @override
         */
        exports.initBehavior = function () {
            this.view.on('return', this.returnBack, this);
        };

        var BaseAction = require('./BaseAction');
        var ReadAction = require('eoo').create(BaseAction, exports);

        return ReadAction;
    }
);
