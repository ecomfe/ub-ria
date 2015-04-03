/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 列表视图基类
 * @author otakustay
 */
define(
    function (require) {
        require('ub-ria-ui/DrawerActionPanel');

        var u = require('../util');

        /**
         * @class mvc.ListView
         * @extends mvc.BaseView
         */
        var exports = {};

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
         */
        exports.constructor = function () {
            this.$super(arguments);

            // 批量绑定控件的事件
            /* eslint-disable fecs-camelcase */
            var uiEvents = {
                'pager': {
                    pagesizechange: onChangePageSize,
                    pagechange: onChangePage
                },
                'table': {
                    select: 'updateBatchButtonStatus',
                    sort: onSortTable
                },
                'filter:submit': 'submitSearch',
                'filter-switch:click': toggleFilter,
                'filter-cancel:click': cancelFilter,
                'filter-modify:click': toggleFilterPanelContent,
                'table:command': 'commandHandler',
                'create:click': popDrawerActionPanel
            };
            /* eslint-enable fecs-camelcase */
            this.addUIEvents(uiEvents);
        };

        /**
         * 每页条数变更监听函数
         *
         * @event
         * @param {mini-event.Event} e 事件对象
         */
        function onChangePageSize(e) {
            var pageSize = e.target.get('pageSize');
            this.updatePageSize(pageSize);
        }

        /**
         * 更新每页显示数
         *
         * @protected
         * @method mvc.ListView#updatePageSize
         * @fires mvc.ListView#pagesizechange
         * @param {number} pageSize 每页条数
         */
        exports.updatePageSize = function (pageSize) {
            this.fire('pagesizechange', {pageSize: pageSize});
        };

        /**
         * 页码变更监听函数
         *
         * @event
         * @param {mini-event.Event} e 事件对象
         */
        function onChangePage(e) {
            this.updatePageIndex();
        }

        /**
         * 更新页码
         *
         * @protected
         * @method mvc.ListView#updatePageIndex
         * @fires mvc.ListView#pagechange
         */
        exports.updatePageIndex = function () {
            this.fire('pagechange');
        };

        /**
         * 根据表格中所选择的行来控制批量更新按钮的启用/禁用状态
         *
         * @public
         * @method mvc.ListView#updateBatchButtonStatus
         */
        exports.updateBatchButtonStatus = function () {
            var items = this.getSelectedItems();

            u.each(
                this.getGroup('batch'),
                function (button) {
                    var status = +button.getData('status');
                    // 1. 没有任何选中项时，所有按钮肯定禁用
                    // 2. 使用`model.canUpdateToStatus`判断按钮是否能用
                    var disabled = u.isEmpty(items)
                        || !this.model.canUpdateToStatus(items, status);
                    button.set('disabled', disabled);
                },
                this
            );
        };

        /**
         * 获取table已经选择的列的数据
         *
         * @protected
         * @method mvc.ListView#getSelectedItems
         * @return {Array.<Object>} 当前table的已选择列对应的数据
         */
        exports.getSelectedItems = function () {
            var table = this.get('table');
            return table ? table.getSelectedItems() : [];
        };

        /**
         * 表格排序监听函数
         *
         * @event
         * @param {mini-event.Event} e 事件对象
         */
        function onSortTable(e) {
            var tableProperties = {
                order: e.order,
                orderBy: e.field.field
            };
            this.sortTable(tableProperties);
        }

        /**
         * 排列表格
         *
         * @protected
         * @method mvc.ListView#sortTable
         * @fires mvc.ListView#tablesort
         * @param {Object} tableProperties 表格参数
         */
        exports.sortTable = function (tableProperties) {
            this.fire('tablesort', {tableProperties: tableProperties});
        };

        /**
         * 收集查询参数并触发查询事件
         *
         * @protected
         * @method mvc.ListView#submitSearch
         * @fires mvc.ListView#search
         */
        exports.submitSearch = function () {
            this.fire('search');
        };

        /**
         * 收起筛选面板，当有筛选条件时清除筛选条件
         *
         * @event
         */
        function toggleFilter() {
            var filter = this.getSafely('filter');
            filter.isHidden() ? showFilter.call(this) : cancelFilter.call(this);
        }

        /**
         * 显示筛选条件区域
         */
        function showFilter() {
            this.getSafely('filter').show();
            this.getSafely('filter-switch').addState('expand');
        }

        /**
         * 隐藏筛选条件区域
         */
        function hideFilter() {
            this.getSafely('filter').hide();
            this.getSafely('filter-switch').removeState('expand');
        }

        /**
         * 有筛选条件时清除筛选条件
         *
         * @event
         */
        function cancelFilter() {
            if (this.model.get('filtersInfo').isAllFiltersDefault) {
                hideFilter.call(this);
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
        exports.submitSearchWithoutKey = function (name) {
            if (name) {
                this.clearFilterValue(name);
            }
            else {
                var view = this;
                this.getGroup('clear-button').each(
                    function (button) {
                        var name = button.get('name');
                        view.clearFilterValue(name);
                    }
                );
            }
            this.fire('search');
        };

        /**
         * 取消筛选，将条件设为默认值
         *
         * @method mvc.ListView#clearFilterValue
         * @param {string} name 需要取消的条件
         */
        exports.clearFilterValue = function (name) {
            var value = this.model.defaultArgs[name] || '';
            this.get(name).setValue(value);
        };

        /**
         * 切换筛选面板和筛选条件显示面板
         *
         * @event
         */
        function toggleFilterPanelContent() {
            this.getGroup('filter-content').toggle();
        }

        /**
         * 处理table的command事件，默认处理状态修改、实体修改
         *
         * @protected
         * @method mvc.ListView#commandHandler
         * @param {mini-event.Event} e command事件
         */
        exports.commandHandler = function (e) {
            if (e.triggerType === 'click') {
                var transition = u.findWhere(this.model.getStatusTransitions(), {statusName: e.name});
                // 处理状态修改
                if (transition) {
                    var args = {
                        id: e.args,
                        status: transition.status
                    };
                    this.fire('modifystatus', args);
                }
                // 处理实体修改和查看
                else if (e.name === 'modify' || e.name === 'read' || e.name === 'copy') {
                    var id = e.args;
                    var url = getActionURL.call(this, e.name, id);
                    var options = {url: url};

                    this.popDrawerAction(options).show();
                }
            }
        };

        /**
         * 根据id和当前url获取列表操作对应的url
         *
         * @param {string} actionName 操作名称, 包括modify, read
         * @param {string} id 待更新的实体id
         * @return {er.URL} 列表操作对应的url
         */
        function getActionURL(actionName, id) {
            var urlParts = {
                modify: 'update',
                read: 'view',
                copy: 'copy'
            };
            var urlPart = urlParts[actionName] || '';
            var path = this.model.get('url').getPath();
            var index = path.lastIndexOf('/');
            var url = require('er/URL').withQuery(
                path.substring(0, index + 1) + urlPart,
                {
                    id: id
                }
            );

            return url;
        }

        /**
         * 绑定控件事件
         *
         * @override
         */
        exports.bindEvents = function () {
            this.getGroup('batch').each(
                function (button) {
                    // 批量更新
                    button.on('click', batchModify, this);
                },
                this
            );
            this.getGroup('clear-button').each(
                function (button) {
                    var name = button.get('name');
                    button.on(
                        'click',
                        function (e) {
                            this.submitSearchWithoutKey(name);
                        },
                        this
                    );
                },
                this
            );

            this.$super(arguments);
        };

        /**
         * 获取批量操作状态
         *
         * @fires mvc.ListView#batchmodify
         * @param {Object} e 控件事件对象
         */
        function batchModify(e) {
            var args = {
                // `status`是`number`类型
                status: +e.target.getData('status')
            };

            this.fire('batchmodify', args);
        }

        /**
         * 表格的列配置，供重写
         *
         * @member {Array.<Object>} mvc.ListView#tableFields
         */
        exports.tableFields = [];

        /**
         * 获取表格的列配置
         *
         * @protected
         * @method mvc.ListView#getTableFields
         * @return {Array.<Object>}
         */
        exports.getTableFields = function () {
            return this.tableFields;
        };

        /**
         * 获取视图属性
         *
         * @protected
         * @override
         * @return {Object}
         */
        exports.getUIProperties = function () {
            var properties = this.$super(arguments) || {};

            if (!properties.table) {
                properties.table = {};
            }
            properties.table.fields = this.getTableFields();

            return properties;
        };

        /**
         * 控制元素展现
         *
         * @override
         */
        exports.enterDocument = function () {
            this.$super(arguments);

            this.updateBatchButtonStatus();
            this.updateFilterPanelStatus();
            this.updateSearchBoxStatus();
        };

        /**
         * view渲染完成后根据所有筛选条件是否都为默认值来控制展开或闭合
         *
         * @protected
         * @method mvc.ListView#updateFilterPanelStatus
         */
        exports.updateFilterPanelStatus = function () {
            if (!this.model.get('filtersInfo').isAllFiltersDefault) {
                showFilter.call(this);
                toggleFilterPanelContent.call(this);
            }
        };

        /**
         * view渲染完成后清空搜索框
         *
         * @protected
         * @method mvc.ListView#updateSearchBoxStatus
         */
        exports.updateSearchBoxStatus = function () {
            if (this.model.get('keyword')) {
                this.getSafely('keyword').addState('clear');
            }
        };

        /**
         * 弹出drawerActionPanel
         *
         * @event
         * @param {mini-event.Event} e 事件参数
         */
        function popDrawerActionPanel(e) {
            e.stopPropagation();
            e.preventDefault();
            var url = String(e.target.get('href'));

            // 传给 ActionPanel 的 url 是不能带 hash 符号的。。
            if (url.charAt(0) === '#') {
                url = url.slice(1);
            }
            this.popDrawerAction({url: url}).show();
        }

        /**
         * @override
         */
        exports.popDrawerAction = function (options) {
            var drawerActionPanel = this.$super(arguments);

            drawerActionPanel.on('action@submitcancel', cancel);
            drawerActionPanel.on('action@back', back);
            drawerActionPanel.on('action@saveandclose', saveAndClose);
            drawerActionPanel.on('close', closeDrawerActionPanel, this);

            return drawerActionPanel;
        };

        /**
         * 取消
         *
         * @event
         * @param {mini-event.Event} e 事件参数
         */
        function cancel(e) {
            e.preventDefault();
            this.dispose();
        }

        /**
         * 返回
         *
         * @event
         * @param {mini-event.Event} e 事件参数
         */
        function back(e) {
            e.stopPropagation();
            e.preventDefault();
            this.hide();
        }

        /**
         * 保留当前数据并退出
         *
         * @event
         * @param {mini-event.Event} e 事件参数
         */
        function saveAndClose(e) {
            e.target.hide();
        }

        /**
         * 关闭
         *
         * @event
         * @fires mvc.ListView#close
         * @param {mini-event.Event} e 事件参数
         */
        function closeDrawerActionPanel(e) {
            this.fire('close');
        }

        /**
         * 获取查询参数，默认是取`filter`表单的所有数据，加上表格的排序字段
         *
         * @public
         * @method mvc.ListView#getSearchArgs
         * @return {Object}
         */
        exports.getSearchArgs = function () {
            // 获取表单的字段
            var form = this.get('filter');
            var args = form ? form.getData() : {};
            // 加上原本的排序方向和排序字段名
            args.order = this.get('table').order;
            args.orderBy = this.get('table').orderBy;

            var keyword = this.get('keyword');
            if (keyword) {
                // 关键词去空格
                args.keyword = u.trim(keyword.getValue());
            }

            return args;
        };

        /**
         * 获取分页数据
         *
         * @protected
         * @method mvc.ListView#getPageIndex
         * @return {number}
         */
        exports.getPageIndex = function () {
            return this.getSafely('pager').get('page');
        };

        /**
         * 根据布局变化重新调整自身布局
         *
         * @protected
         * @method mvc.ListView#adjustLayout
         */
        exports.adjustLayout = function () {
            var table = this.get('table');
            if (table) {
                table.adjustWidth();
            }
        };

        /**
         * 更新列表某几行数据
         *
         * @protected
         * @method mvc.ListView#updateItem
         * @param {Array} items 行对应的数据
         */
        exports.updateItems = function (items) {
            var table = this.get('table');
            u.each(
                items,
                function (item) {
                    var index = this.model.indexOf(item);

                    if (index < 0) {
                        throw new Error('No row found');
                    }
                    table.updateRowAt(index, item);
                },
                this
            );
        };

        var BaseView = require('./BaseView');
        var ListView = require('eoo').create(BaseView, exports);

        return ListView;
    }
);
