/**
 * SSP for Web
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 配置入口
 * @author otakustay
 */

define(
    function (require) {
        // 通用模板
        require('tpl!common/tpl/common.tpl.html');
        require('tpl!common/tpl/list.tpl.html');
        require('tpl!common/tpl/form.tpl.html');

        // 各模块的入口配置
        require('contact/config');
    }
);
