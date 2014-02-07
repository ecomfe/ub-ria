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
        return {
            version: '0.8.0-alpha.1',

            start: function () {
                // TODO: 加载常用扩展
                require('er').start();
            }
        }
    }
);
