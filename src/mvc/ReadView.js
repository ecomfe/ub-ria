/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 只读页视图基类
 * @author otakustay
 * @date $DATE$
 */
define(
    function (require) {
        var util = require('er/util');
        var BaseView = require('./BaseView');

        /**
         * 只读页视图基类
         *
         * @extends BaseView
         * @constructor
         */
        function ReadView() {
            BaseView.apply(this, arguments);
        }

        util.inherits(ReadView, BaseView);

        /**
         * 绑定控件事件
         *
         * @override
         */
        ReadView.prototype.bindEvents = function () {
            BaseView.prototype.bindEvents.apply(this, arguments);

            var returnButton = this.get('return');
            if (returnButton) {
                var delegate = require('mini-event').delegate;
                delegate(returnButton, 'click', this, 'return');
            }
        };
        
        return ReadView;
    }
);
