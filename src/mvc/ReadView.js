/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 只读页视图基类
 * @author otakustay
 */
define(
    function (require) {
        /**
         * 只读页视图基类
         *
         * @class mvc.ReadView
         * @extends mvc.BaseView
         */
        var exports = {};

        /**
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
