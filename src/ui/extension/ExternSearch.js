/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 使用外部搜索控件代理控件的搜索的扩展
 * @author lixiang
 */

import lib from 'esui/lib';
import Extension from 'esui/Extension';

function search(e) {
    this.target.search();
}

function doSearch(e) {
    let searchBox = this.resolveControl();
    let filter = {value: searchBox.getValue()};
    // 外部searchbox是不有配搜索包含关键字段
    if (searchBox.dataKeys) {
        filter.keys = lib.splitTokenList(searchBox.dataKeys);
    }
    e.filterData.push(filter);
    e.preventDefault();
}

function clearQuery() {
    let searchBox = this.resolveControl();
    searchBox.set('text', '');
}

/**
 * 使用外部搜索控件代理控件的搜索
 *
 * @class ui.extension.ExternSearch
 * @extends esui.Extension
 */
export default class ExternSearch extends Extension {
    /**
     * 指定对应的searchBox的id
     *
     * @member ui.extension.ExternSearch#searchBox
     * @type {string | null}
     */
    searchBox = null;

    /**
     * 找到控件对应的搜索类控件
     *
     * @protected
     * @method ui.extension.ExternSearch#resolveControl
     * @return {esui.SearchBox}
     */
    resolveControl() {
        if (this.searchBox) {
            let searchBox = this.target.viewContext.get(this.searchBox);
            // 只有扩展处于激活状态才抛异常
            if (!searchBox && this.active) {
                throw new Error(`Cannot find searchBox "#${this.searchBox}" in view context`);
            }
            return searchBox;
        }

        throw new Error('searchBox cannot be null');
    }

    /**
     * @override
     */
    activate() {
        let searchBox = this.resolveControl();
        searchBox.on('search', search, this);

        // 接收控件内清空搜索操作
        this.target.on('clearquery', clearQuery, this);
        // 接收控件的search事件
        this.target.on('search', doSearch, this);

        super.activate();
    }

    /**
     * @override
     */
    inactivate() {
        super.inactivate();

        let searchBox = this.resolveControl();
        if (searchBox) {
            searchBox.un('search', search, this);
        }

        this.target.un('clearquery', clearQuery, this);
        this.target.un('search', doSearch, this);
    }
}

/**
 * 扩展的类型，始终为`"ExternSearch"`
 *
 * @member ui.extension.ExternSearch#type
 * @type {string}
 * @readonly
 * @override
 */
ExternSearch.prototype.type = 'ExternSearch';

import ui from 'esui';

ui.registerExtension(ExternSearch);
