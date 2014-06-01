/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 入口模块
 * @author otakustay
 */
define(
    function (require) {
        var main = {
            version: '1.0.0-alpha.5',

            enableExtensions: function () {
                // 加载扩展
                require('./extension/underscore').enable();
                require('./extension/mvc').enable();
                require('./extension/ajax').enable();
                require('./extension/ui').enable();
            },

            start: function () {
                main.enableExtensions();

                // 启动ER
                require('er').start();
            }
        };

        return main;
    }
);
