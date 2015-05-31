/**
 * UB RIA Base
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 筛选控件辅助函数
 * @author Exodia
 */

import u from '../util';

/**
 * 列表筛选控件辅助函数
 *
 * @namespace mvc.filterHelper
 */
let helper = {
    /**
     * 下拉单选辅助函数
     *
     * @namespace mvc.filterHelper.select
     */
    select: {
        /**
         * 获取筛选条件文本
         *
         * @method mvc.filterHelper.select.getText
         * @param {esui.Select} filter 对应的控件实例
         * @return {string}
         */
        getText(filter) {
            var item = u.find(
                filter.datasource,
                function (item) {
                    /* eslint-disable eqeqeq */
                    return item.value == filter.value;
                    /* eslint-enable eqeqeq */
                }
            );
            return item && item.text || '';
        }
    },

    /**
     * 多选辅助函数
     *
     * @namespace mvc.filterHelper.toggleSelector
     */
    toggleSelector: {
        /**
         * 获取筛选条件文本
         *
         * @method mvc.filterHelper.toggleSelector.getText
         * @param {ub-ria-ui.ToggleSelector} filter 对应的控件实例
         * @return {string}
         */
        getText(filter) {
            var item = u.find(
                filter.datasource,
                function (item) {
                    /* eslint-disable eqeqeq */
                    return item.id == filter.value;
                    /* eslint-enable eqeqeq */
                }
            );
            return item && item.name || '';
        }
    }
};

export default helper;
export let select = helper.select;
export let toggleSelector = helper.toggleSelector;
