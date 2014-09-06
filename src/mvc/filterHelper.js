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
        var u = require('underscore');

        var helper = {};
        var select = helper.select = {};
        select.getText = function (filter) {
            var item = u.find(filter.datasource, function (item) {
                return item.value == filter.value;  // jshint ignore:line
            });
            return item && item.text || '';
        };

        return helper;
    }
);
