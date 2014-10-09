/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 只读页Action基类
 * @author lixiang(lixiang05@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var util = require('er/util');
        var BaseAction = require('./BaseAction');

        /**
         * 只读页Action基类
         *
         * @extends BaseAction
         * @constructor
         */
        function ReadAction(entityName) {
            BaseAction.apply(this, arguments);
        }

        util.inherits(ReadAction, BaseAction);

        /**
         * 当前页面的分类，始终为`"read"`
         *
         * @type {string}
         * @readonly
         * @override
         */
        ReadAction.prototype.category = 'read';

        function returnBack() {
            // 默认返回列表页
            this.back('/' + this.getEntityName() + '/list');
        }

        /**
         * 初始化交互行为
         *
         * @protected
         * @override
         */
        ReadAction.prototype.initBehavior = function () {
            this.view.on('return', returnBack, this);
        };

        return ReadAction;
    }
);
