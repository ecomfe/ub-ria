/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 只读页Action基类
 * @exports ub-ria.mvc.ReadAction
 * @author lixiang(lixiang05@baidu.com)
 */
define(
    function (require) {
        /**
         * @class ub-ria.mvc.ReadAction
         * @extends ub-ria.mvc.BaseAction
         */
        var exports = {};

        /**
         * 当前页面的分类，始终为`"read"`
         *
         * @type {string}
         * @readonly
         * @override
         */
        exports.category = 'read';

        /**
         * 点击返回后的处理
         *
         * @protected
         * @method ub-ria.mvc.ReadAction#returnBack
         */
        exports.returnBack = function () {
            // 默认返回列表页
            this.fire('back');
        };

        /**
         * 初始化交互行为
         *
         * @protected
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
