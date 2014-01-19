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
        var BaseView = require('common/BaseView');
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
         * @constructor
         * @extends common/BaseView
         */
        function ListView() {
            BaseView.apply(this, arguments);
        }

        util.inherits(ListView, BaseView);

        /**
         * 收集查询参数并触发查询事件
         *
         * @param {ListView} this 当前视图实例
         * @param {mini-event.Event} e 控件事件对象
         */
        ListView.prototype.submitSearch = function (e) {
            var args = this.getSearchArgs();

            // 如果是表格排序引发的，把新的排序放进去
            if (e.type === 'sort') {
                args.orderBy = e.field.field;
                args.order = e.order;
            }

            this.fire('search', { args: args });
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

            // 关键词去空格
            if (args.keyword) {
                args.keyword = require('../util').trim(args.keyword);
            }
            
            return args;
        };

        /**
         * 更新每页显示数
         *
         * @param {Object} e 事件对象
         * @ignore
         */
        function updatePageSize(e) {
            var pageSize = e.target.get('pageSize');
            this.fire('pagesizechange', { pageSize: pageSize });
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
                status: +e.target.getData('status'),
                // `statusName`是一个camelCase的格式
                statusName: e.target.id.replace(
                    /-[a-z]/g, 
                    function (w) { return w.charAt(1).toUpperCase(); }
                ),
                // `command`是操作的中文说明
                command: e.target.get('text')
            };

            this.fire('batchmodify', args);
        }

        /**
         * 绑定控件事件
         *
         * @override
         */
        ListView.prototype.bindEvents = function () {
            var pager = this.get('pager');
            if (pager) {
                // 切换每页大小
                pager.on('pagesizechange', updatePageSize, this);
            }

            var table = this.get('table');
            if (table) {
                // 选中表格行后控制批量更新按钮的启用/禁用状态
                table.on('select', this.updateBatchButtonStatus, this);
                // 表格排序触发查询
                table.on('sort', this.submitSearch, this);
            }

            u.each(
                this.getGroup('batch'),
                function (button) {
                    // 批量更新
                    button.on('click', batchModify, this);
                },
                this
            );

            var filter = this.get('filter');
            if (filter) {
                // 多条件查询
                filter.on('submit', this.submitSearch, this);
            }

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
