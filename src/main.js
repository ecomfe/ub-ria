/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 入口模块
 * @author otakustay
 */
define(
    function (require) {
        /**
         * 模块入口
         *
         * @namespace main
         */
        var main = {
            /**
             * @property {string} 版本号
             * @readonly
             */
            version: '2.0.0-beta.5',

            /**
             * 启动所有扩展
             *
             * @method main.enableExtensions
             */
            enableExtensions: function () {
                // 加载扩展
                require('./extension/mvc').enable();
                require('./extension/ui').enable();
            },

            /**
             * 启动MVC程序
             *
             * @method main.start
             */
            start: function () {
                main.enableExtensions();

                // 启动ER
                require('er').start();
            }
        };

        return main;
    }
);
