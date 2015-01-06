/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 只读页视图基类
 * @exports mvc.ReadView
 * @author otakustay
 */
define(
    function (require) {
        /**
         * @class mvc.ReadView
         * @extends mvc.BaseView
         */
        var exports = {};

        /**
         * 绑定控件事件
         *
         * @override
         */
        exports.bindEvents = function () {
            this.$super(arguments);

            var returnButton = this.get('return');
            if (returnButton) {
                var delegate = require('mini-event').delegate;
                delegate(returnButton, 'click', this, 'return');
            }
        };

        var BaseView = require('./BaseView');
        var ReadView = require('eoo').create(BaseView, exports);

        return ReadView;
    }
);
