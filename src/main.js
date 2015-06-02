/**
 * UB RIA Base
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 入口模块
 * @author otakustay
 */

import er from 'er';
import mvcExtension from './extension/mvc';
import uiExtension from './extension/ui';

/**
 * 模块入口
 *
 * @namespace main
 */
let main = {
    /**
     * @property {string} 版本号
     * @readonly
     */
    version: '3.0.0-alpha.2',

    /**
     * 启动MVC程序
     *
     * @method main.start
     */
    start() {
        mvcExtension.enable();
        uiExtension.enable();
        er.start();
    }
};

export default main;
