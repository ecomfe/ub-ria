/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 列表视图基类
 * @author otakustay, wangyaqiong(catkin2009@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseView = require('./BaseView');
        var util = require('er/util');
        var u = require('underscore');

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
         * @extends mvc/BaseView
         * @constructor
         */
        function ListView() {
            BaseView.apply(this, arguments);
        }

        util.inherits(ListView, BaseView);

        /**
         * 收集查询参数并触发查询事件
         *
         * @param {mini-event.Event} e 控件事件对象
         */
        ListView.prototype.submitSearch = function (e) {
            var args = this.getSearchArgs();
            this.fire('search', { args: args });
        };

        /**
         * 取消某个条件并触发查询事件
         *
         * @param {string} key 要清除的查询条件
         */
        ListView.prototype.submitSearchWithoutKey = function (key) {
            var args = this.getSearchArgs();
            args = u.omit(args, key);
            this.fire('search', { args: args });
        };

        /**
         * 排列表格
         *
         * @param {mini-event.Event} e 控件事件对象
         */
        ListView.prototype.sortTable = function (e) {
            var tableProperties = {
                orderBy: e.field.field,
                order: e.order
            };
            this.fire('tablesort', { tableProperties: tableProperties });
        };


        /**
         * 根据表格中所选择的行来控制批量更新按钮的启用/禁用状态
         */
        ListView.prototype.updateBatchButtonStatus = function () {
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
         * view渲染完成后根据所有筛选条件是否都为默认值来控制展开或闭合
         *
         */
        ListView.prototype.updateFilterPanelStatus = function () {
            if (!this.model.get('filtersInfo').isAllFiltersDefault) {
                showFilter.call(this);
                toggleFilterPanelContent.call(this);
            }
        };

        ListView.prototype.updateSearchBoxStatus = function () {
            if (this.model.get('keyword')) {
                this.getSafely('keyword').addState('clear');
            }
        };

        /**
         * 获取table已经选择的列的数据
         *
         * @return {Object[]} 当前table的已选择列对应的数据
         */
        ListView.prototype.getSelectedItems = function () {
            var table = this.get('table');
            return table ? table.getSelectedItems() : [];
        };

        /**
         * 获取查询参数，默认是取`filter`表单的所有数据，加上表格的排序字段
         *
         * @return {Object}
         */
        ListView.prototype.getSearchArgs = function () {
            // 获取表单的字段
            var form = this.get('filter');
            var args = form ? form.getData() : {};
            // 加上原本的排序方向和排序字段名
            args.order = this.model.get('order');
            args.orderBy = this.model.get('orderBy');

            var keyword = this.get('keyword');
            if (keyword) {
                // 关键词去空格
                args.keyword = require('../util').trim(keyword.getValue());
            }

            return args;
        };

        /**
         * 表格的列配置，供重写
         *
         * @type {Object[]}
         */
        ListView.prototype.tableFields = [];

        /**
         * 获取表格的列配置
         *
         * @return {Object[]}
         */
        ListView.prototype.getTableFields = function () {
            return this.tableFields;
        };

        /**
         * 获取视图属性
         *
         * @return {Object}
         * @protected
         * @override
         */
        ListView.prototype.getUIProperties = function () {
            var properties = BaseView.prototype.getUIProperties.apply(this, arguments) || {};

            if (!properties.table) {
                properties.table = {};
            }
            properties.table.fields = this.getTableFields();

            return properties;
        };

        /**
         * 更新每页显示数
         *
         * @param {mini-event.Event} e 事件对象
         * @ignore
         */
        function updatePageSize(e) {
            var pageSize = e.target.get('pageSize');
            this.fire('pagesizechange', { pageSize: pageSize });
        }

        /**
         * 更新页码
         *
         * @param {mini-event.Event} e 事件对象
         * @ignore
         */
        function updatePageIndex(e) {
            var page = e.target.get('page');
            this.fire('pagechange', { page: page });
        }

        /**
         * 获取批量操作状态
         *
         * @param {Object} e 控件事件对象
         * @ignore
         */
        function batchModify(e) {
            var args = {
                // `status`是`number`类型
                status: +e.target.getData('status')
            };

            this.fire('batchmodify', args);
        }

        /**
         * 收起筛选面板，当有筛选条件时清除筛选条件
         *
         */
        function toggleFilter() {
            var filter = this.getSafely('filter');
            filter.isHidden() ? showFilter.call(this) : cancelFilter.call(this);
        }

        function showFilter() {
            this.getSafely('filter').show();
            this.getSafely('filter-switch').addState('expand');
        }

        function hideFilter() {
            this.getSafely('filter').hide();
            this.getSafely('filter-switch').removeState('expand');
        }

        /**
         * 有筛选条件时清除筛选条件
         *
         * @ignore
         */

        function cancelFilter() {
            if (this.model.get('filtersInfo').isAllFiltersDefault) {
                hideFilter.call(this);
            }
            else {
                this.fire('filterreset');
            }
        }

        /**
         * 切换筛选面板和筛选条件显示面板
         *
         * @ignore
         */

        function toggleFilterPanelContent() {
            this.getGroup('filter-content').toggle();
        }

        /**
         * 绑定控件事件
         *
         * @override
         */
        ListView.prototype.bindEvents = function () {
            var pager = this.getSafely('pager');
            pager.on('pagesizechange', updatePageSize, this);
            pager.on('pagechange', updatePageIndex, this);

            var table = this.getSafely('table');
            // 选中表格行后控制批量更新按钮的启用/禁用状态
            table.on('select', this.updateBatchButtonStatus, this);
            // 表格排序触发查询
            table.on('sort', this.sortTable, this);

            this.getGroup('batch').each(
                function (button) {
                    // 批量更新
                    button.on('click', batchModify, this);
                },
                this
            );
            var view = this;

            this.getGroup('clear-button').each(
                function (button) {
                    var name = button.get('name');
                    button.on(
                        'click',
                        function (e) {
                            view.submitSearchWithoutKey(name);
                        },
                        this
                    );
                },
                this
            );

            this.getSafely('filter').on('submit', this.submitSearch, this);

            // 展开或收起面板，或者清除筛选条件
            this.getSafely('filter-switch').on('click', toggleFilter, this);

            // 取消筛选，收起面板或者清除筛选条件
            this.getSafely('filter-cancel').on('click', cancelFilter, this);

            // 切换到筛选面板
            this.getSafely('filter-modify').on('click', toggleFilterPanelContent, this);

            BaseView.prototype.bindEvents.apply(this, arguments);
        };

        /**
         * 控制元素展现
         *
         * @override
         */
        ListView.prototype.enterDocument = function () {
            BaseView.prototype.enterDocument.apply(this, arguments);
            this.updateBatchButtonStatus();
            this.updateFilterPanelStatus();
            this.updateSearchBoxStatus();
        };

        /**
         * 根据布局变化重新调整自身布局
         */
        ListView.prototype.adjustLayout = function () {
            var table = this.get('table');
            if (table) {
                table.adjustWidth();
            }
        };

        return ListView;
    }
);
