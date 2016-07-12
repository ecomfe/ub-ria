/**
 * UB RIA Base
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 入口模块
 * @author otakustay
 */

import er from 'er';
import mvcExtension from './extension/mvc';

/**
 * @property {string} 版本号
 * @readonly
 */
export let version = '4.0.2';

/**
 * 启动MVC程序
 *
 * @method main.start
 */
export let start = () => {
    mvcExtension.enable();
    er.start();
};
