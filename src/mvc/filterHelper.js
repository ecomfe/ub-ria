/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 筛选控件辅助函数
 * @author Exodia
 */
define(
    function (require) {
        var u = require('../util');

        var helper = {};
        var select = helper.select = {};
        select.getText = function (filter) {
            var item = u.find(filter.datasource, function (item) {
                return item.value == filter.value;
            });
            return item && item.text || '';
        };

        return helper;
    }
);
