/**
 * SSP for APP
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 模板加载插件
 * @author otakustay(otakustay@gmail.com)
 */
define(
    function (require) {
        // 这一层为了可以在`paths`中设置别名，所以不能没有这个文件
        var tpl = require('ub-ria/tpl');
        return tpl;
    }
);
