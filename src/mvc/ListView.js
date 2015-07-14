/**
 * UB RIA Base
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 列表视图基类
 * @author otakustay
 */

import u from '../util';
import {definePropertyAccessor} from '../meta';
import URL from 'er/URL';
import BaseView from './BaseView';
import {bindControlEvent as on, control} from './decorator';

const EMPTY_ARRAY = Object.freeze([]);

/**
 * 列表视图基类
 *
 * 使用列表视图，有以下要求：
 *
 * - 有id为`"filter"`的`Form`控件，此控件可选
 * - 有id为`"pager"`的`Pager`控件，此控件可选
 * - 有id为`"table"`的`Table`控件
 * - 所有触发查询的条件控件，会触发`filter`的`submit`事件，
 * 对于非按钮但要触发表单提交的，可使用{@link ui.extension.AutoSubmit}扩展
 * - 所有批量操作按钮的`group`属性值均为`"batch"`
 * - 批量操作按钮需使用`CustomData`扩展，并设置`data-ui-data-status`属性，
 * 属性值即点击该按钮后实体将更新的目标状态数字，如`data-ui-data-status="0"`
 *
 * @class mvc.ListView
 * @extends mvc.BaseView
 */
export default class ListView extends BaseView {
    tableFields = EMPTY_ARRAY;

    @control();
    get pager() {}

    @control();
    get table() {}

    @control('filter', true);
    get filterPanel() {}

    @control('filter-switch', true);
    get filterSwitch() {}

    @control('keyword', true);
    get keyword() {}

    /**
     * 更新每页显示数
     *
     * @protected
     * @method mvc.ListView#updatePageSize
     * @fires mvc.ListView#pagesizechange
     * @param {number} pageSize 每页条数
     */
    updatePageSize() {
        this.fire('pagesizechange', {pageSize: this.pager.get('pageSize')});
    }

    /**
     * 更新页码
     *
     * @protected
     * @method mvc.ListView#updatePageIndex
     * @fires mvc.ListView#pagechange
     */
    updatePageIndex() {
        this.fire('pagechange');
    }

    /**
     * 根据表格中所选择的行来控制批量更新按钮的启用/禁用状态
     *
     * @public
     * @method mvc.ListView#updateBatchButtonStatus
     */
    updateBatchButtonStatus() {
        let items = this.getSelectedItems();

        u.each(
            this.getGroup('batch'),
            (button) => {
                let status = +button.getData('status');
                // 1. 没有任何选中项时，所有按钮肯定禁用
                // 2. 使用`model.canUpdateToStatus`判断按钮是否能用
                let disabled = u.isEmpty(items) || !this.model.canUpdateToStatus(items, status);
                button.set('disabled', disabled);
            }
        );
    }

    /**
     * 获取table已经选择的列的数据
     *
     * @protected
     * @method mvc.ListView#getSelectedItems
     * @return {Array.<Object>} 当前table的已选择列对应的数据
     */
    getSelectedItems() {
        let table = this.get('table');
        return table ? table.getSelectedItems() : [];
    }

    /**
     * 排列表格
     *
     * @protected
     * @method mvc.ListView#sortTable
     * @fires mvc.ListView#tablesort
     * @param {Object} tableProperties 表格参数
     */
    sortTable(tableProperties) {
        this.fire('tablesort', {tableProperties});
    }

    /**
     * 显示筛选条件区域
     *
     * @protected
     * @method mvc.ListView#showFilterPanel
     */
    showFilterPanel() {
        this.filterPanel.show();
        this.filterSwitch.addState('expand');
    }

    /**
     * 隐藏筛选条件区域
     *
     * @protected
     * @method mvc.ListView#hideFilterPanel
     */
    hideFilterPanel() {
        this.filterPanel.hide();
        this.filterSwitch.removeState('expand');
    }

    /**
     * 收集查询参数并触发查询事件
     *
     * @protected
     * @method mvc.ListView#submitSearch
     * @fires mvc.ListView#search
     */
    submitSearch() {
        this.fire('search');
    }

    /**
     * 有筛选条件时清除筛选条件
     *
     * @event
     */
    cancelFilter() {
        if (this.model.get('filtersInfo').isAllFiltersDefault) {
            this.hideFilterPanel();
        }
        else {
            this.submitSearchWithoutKey();
        }
    }

    /**
     * 取消某个或全部条件时，触发查询事件
     * 同时应该把页数置为 1
     *
     * @protected
     * @method mvc.ListView#submitSearchWithoutKey
     * @param {string} name 要清除的查询条件。为空时表示取消全部filter内条件。
     */
    submitSearchWithoutKey(name) {
        if (name) {
            this.clearFilterValue(name);
        }
        else {
            this.getGroup('clear-button').each(
                (button) => {
                    let name = button.get('name');
                    this.clearFilterValue(name);
                }
            );
        }

        this.fire('search');
    }

    /**
     * 取消筛选，将条件设为默认值
     *
     * @method mvc.ListView#clearFilterValue
     * @param {string} name 需要取消的条件
     */
    clearFilterValue(name) {
        let value = this.model.defaultArgs[name] || '';
        this.get(name).setValue(value);
    }

    /**
     * 切换筛选面板和筛选条件显示面板
     *
     * @protected
     * @method mvc.ListView#toggleFilterPanelContent
     */
    toggleFilterPanelContent() {
        this.getGroup('filter-content').toggle();
    }

    /**
     * 处理table的command事件，默认处理状态修改、实体修改
     *
     * @protected
     * @method mvc.ListView#handleTableCommand
     * @param {Object} e command事件
     */
    handleTableCommand({triggerType, name, args}) {
        if (triggerType === 'click') {
            let transition = u.findWhere(this.model.statusTransitions, {statusName: name});
            // 处理状态修改
            if (transition) {
                let eventArgs = {
                    id: args,
                    status: transition.status
                };
                this.fire('modifystatus', eventArgs);
            }
            // 处理实体修改和查看
            else if (name === 'modify' || name === 'read' || name === 'copy') {
                let id = args;
                let url = this.getActionURL(name, id);

                this.popDrawerAction({url}).show();
            }
        }
    }

    /**
     * 根据id和当前url获取列表操作对应的url
     *
     * @protected
     * @method mvc.ListView#getActionURL
     * @param {string} actionName 操作名称, 包括modify, read
     * @param {string} id 待更新的实体id
     * @return {er.URL} 列表操作对应的url
     */
    getActionURL(actionName, id) {
        let urlParts = {
            modify: 'update',
            read: 'view',
            copy: 'copy'
        };
        let urlPart = urlParts[actionName] || '';
        let path = this.model.get('url').getPath();
        let index = path.lastIndexOf('/');
        let url = URL.withQuery(path.substring(0, index + 1) + urlPart, {id});

        return url;
    }

    /**
     * @override
     */
    bindEvents() {
        // 批量更新
        this.getGroup('batch').on(
            'click',
            (e) => {
                let args = {
                    // `status`是`number`类型
                    status: +e.target.getData('status')
                };

                this.fire('batchmodify', args);
            }
        );

        this.getGroup('clear-button').on(
            'click',
            (e) => {
                let name = e.target.get('name');
                this.submitSearchWithoutKey(name);
            }
        );

        super.bindEvents();
    }

    /**
     * @override
     */
    getUIProperties() {
        let properties = super.getUIProperties() || {};

        let table = properties.table || (properties.table = {});
        table.fields = this.tableFields;

        return properties;
    }

    /**
     * @override
     */
    enterDocument() {
        super.enterDocument();

        this.updateBatchButtonStatus();
        this.updateFilterPanelStatus();
        this.updateSearchBoxStatus();
    }

    /**
     * view渲染完成后根据所有筛选条件是否都为默认值来控制展开或闭合
     *
     * @protected
     * @method mvc.ListView#updateFilterPanelStatus
     */
    updateFilterPanelStatus() {
        if (!this.model.get('filtersInfo').isAllFiltersDefault) {
            this.showFilterPanel();
            this.toggleFilterPanelContent();
        }
    }

    /**
     * view渲染完成后清空搜索框
     *
     * @protected
     * @method mvc.ListView#updateSearchBoxStatus
     */
    updateSearchBoxStatus() {
        if (this.model.get('keyword')) {
            this.keyword.addState('clear');
        }
    }

    /**
     * @override
     */
    popDrawerAction(options) {
        let drawerActionPanel = super.popDrawerAction(options);

        drawerActionPanel.on(
            'action@submitcancel',
            (e) => {
                e.preventDefault();
                e.target.dispose();
            }
        );
        drawerActionPanel.on(
            'action@back',
            (e) => {
                e.stopPropagation();
                e.preventDefault();
                e.target.hide();
            }
        );
        drawerActionPanel.on('action@saveandclose', (e) => e.target.hide());
        drawerActionPanel.on('close', () => this.fire('close'));

        return drawerActionPanel;
    }

    /**
     * 获取查询参数，默认是取`filter`表单的所有数据，加上表格的排序字段
     *
     * @method mvc.ListView#getSearchArgs
     * @return {Object}
     */
    getSearchArgs() {
        // 获取表单的字段
        let form = this.filterPanel;
        let args = form.get('type') === 'Form' ? form.getData() : {};
        // 加上原本的排序方向和排序字段名
        args.order = this.table.order;
        args.orderBy = this.table.orderBy;

        let keyword = this.keyword.getValue().trim();
        if (keyword) {
            // 关键词去空格
            args.keyword = keyword;
        }

        return args;
    }

    /**
     * 获取分页数据
     *
     * @method mvc.ListView#getPageIndex
     * @return {number}
     */
    getPageIndex() {
        return this.pager.get('page');
    }

    /**
     * 根据布局变化重新调整自身布局
     *
     * @method mvc.ListView#adjustLayout
     */
    adjustLayout() {
        if (this.table) {
            this.table.adjustWidth();
        }
    }

    /**
     * 更新列表某几行数据
     *
     * @method mvc.ListView#updateItem
     * @param {Array} items 行对应的数据
     */
    updateItems(items) {
        let table = this.table;
        for (let item of items) {
            let index = this.model.indexOf(item);

            if (index < 0) {
                throw new Error('No row found');
            }

            table.updateRowAt(index, item);
        }
    }

    /**
     * 修改状态前确认提示
     *
     * @method mvc.ListView#waitModifyStatusConfirm
     * @param {meta.UpdateContext} context 操作的上下文对象
     * @param {Object} advice 提示对象
     * @return {Promise}
     */
    waitModifyStatusConfirm(context, advice) {
        var entityDescription = this.model.get('entityDescription');
        let options = {
            title: `${context.command}${entityDescription}`,
            content: advice.message
        };
        return this.waitConfirm(options);
    }

    @on('pager', 'pagesizechange');
    [Symbol()]() {
        this.updatePageSize();
    }

    @on('pager', 'pagechange');
    [Symbol()]() {
        this.updatePageIndex();
    }

    @on('table', 'select');
    [Symbol()]() {
        this.updateBatchButtonStatus();
    }

    @on('table', 'sort');
    [Symbol()](e) {
        let tableProperties = {
            order: e.order,
            orderBy: e.field.field
        };
        this.sortTable(tableProperties);
    }

    @on('filter', 'submit');
    [Symbol()]() {
        this.submitSearch();
    }

    @on('filter-switch', 'click');
    [Symbol()]() {
        this.filterPanel.isHidden() ? this.showFilterPanel() : this.cancelFilter();
    }

    @on('filter-cancel', 'click');
    [Symbol()]() {
        this.cancelFilter();
    }

    @on('filter-modify', 'click');
    [Symbol()]() {
        this.toggleFilterPanelContent();
    }

    @on('table', 'command');
    [Symbol()](e) {
        this.handleTableCommand(e);
    }

    @on('create', 'click');
    [Symbol()](e) {
        e.stopPropagation();
        e.preventDefault();
        let url = String(e.target.get('href'));

        // 传给 ActionPanel 的 url 是不能带 hash 符号的。。
        if (url[0] === '#') {
            url = url.slice(1);
        }
        this.popDrawerAction({url}).show();
    }
}

/**
 * 表格的列配置
 *
 * @member mvc.ListView#tableFields
 * @type {Array.<Object>}
 */
definePropertyAccessor(ListView.prototype, 'tableFields');
