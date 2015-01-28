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
            // 针对有些控件key-value的结构是id-name的，要先做一个兼容处理
            var innerDatasource = u.map(
                filter.datasource,
                function (item) {
                    var newItem = {};
                    newItem.value = item.value || item.id;
                    newItem.text = item.text || item.name;

                    return newItem;
                }
            );

            var item = u.find(
                innerDatasource,
                function (item) {
                    /* eslint-disable eqeqeq */
                    return item.value == filter.value;
                    /* eslint-enable eqeqeq */
                }
            );

            return item && item.text || '';
        };

        return helper;
    }
);
