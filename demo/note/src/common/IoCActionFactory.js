/**
 * DEMO
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file Ioc Action 组装工厂类
 * @exports common.IoCActionFactory
 * @author exodia(dengxinxin@baidu.com)
 */
define(
    function (require) {
        var ioc = require('common/ioc');

        /**
         * @class common.IoCActionFactory
         * @extends ub-ria.mvc.IoCActionFactory
         */
        var exports = {};

        exports.constructor = function (actionComponents, options) {
            this.$super(arguments);

            this.setIocContainer(ioc);
        };

        var RIAIoCActionFactory = require('ub-ria/mvc/IoCActionFactory');
        var IoCActionFactory = require('eoo').create(RIAIoCActionFactory, exports);

        return IoCActionFactory;
    }
);
