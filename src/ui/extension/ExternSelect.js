/**
 * UB RIA Base
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 使用外部下拉选择控件代理控件的搜索
 * @author lixiang
 */

import u from '../../util';
import ui from 'esui';
import lib from 'esui/lib';
import Extension from 'esui/Extension';

function search(e) {
    this.target.search();
}

function doSearch(e) {
    for (let select of this.resolveControls()) {
        let item = select.getSelectedItem();
        if (item.value !== '' && select.dataKey) {
            e.filterData.push({keys: [select.dataKey], value: item.value});
        }
    }

    e.preventDefault();
}

function clearQuery() {
    for (let select of this.resolveControls()) {
        select.un('change', search, this);
        select.setProperties({selectedIndex: 0});
        select.on('change', search, this);
    }
}

/**
 * 使用外部下拉选择控件代理控件的搜索
 *
 * @class ui.extension.ExternSelect
 * @extends esui.Extension
 */
export default class ExternSelect extends Extension {

    /**
     * 扩展的类型，始终为`"ExternSelect"`
     *
     * @member ui.extension.ExternSelect#type
     * @type {string}
     * @readonly
     * @override
     */
    get type() {
        return 'ExternSelect';
    }

    /**
     * 指定对应的一组select的id, 逗号或空格分隔，必须指定
     *
     * @member ui.extension.ExternSelect#selects
     * @type {string | null}
     */
    selects = null;

    /**
     * 找到代理控件
     *
     * @protected
     * @method ui.extension.ExternSelect#resolveControls
     * @return {esui.SearchBox}
     */
    resolveControls() {
        let controls = [];

        if (this.selects) {
            let selects = u.isString(this.selects) ? lib.splitTokenList(this.selects) : this.selects;

            if (Array.isArray(selects)) {
                for (let select of selects) {
                    let targetSelectControl = this.target.viewContext.get(select);
                    if (targetSelectControl) {
                        controls.push(targetSelectControl);
                    }
                    // 只有扩展处于激活状态才抛异常
                    else if (this.active) {
                        throw new Error(`Cannot find related select "#${select}" in view context`);
                    }
                }
            }
            else {
                throw new Error('selects can only be Array or String');
            }
        }
        else {
            throw new Error('selects cannot be null');
        }

        return controls;
    }

    /**
     * @override
     */
    activate() {
        this.resolveControls.forEach(select => select.on('change', search, this));

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

        this.resolveControls.forEach(select => select.un('change', search, this));

        this.target.un('clearquery', clearQuery, this);
        this.target.un('search', doSearch, this);
    }

    /**
     * 搜索控件的处理函数
     *
     * @param {Function} handler 处理句柄
     */
    handleControls(handler) {
        let controls = this.resolveControls();
        if (controls.length) {
            u.each(controls, handler, this);
        }
    }
}

ui.registerExtension(ExternSelect);
