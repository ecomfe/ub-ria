/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 列表Action基类
 * @exports mvc.ListAction
 * @author otakustay
 *         wangyaqiong(catkin2009@gmail.com)
 */
define(
    function (require) {
        var eoo = require('eoo');
        var URL = require('er/URL');
        var u = require('../util');

        /**
         * @class mvc.ListAction
         * @extends mvc.BaseAction
         */
        var exports = {};

        /**
         * 当前页面的分类，始终为`"list"`
         *
         * @type {string}
         * @readonly
         * @override
         */
        exports.category = 'list';

        /**
         * 初始化交互行为
         *
         * @protected
         * @override
         */
        exports.initBehavior = function () {
            this.$super(arguments);

            this.view.on('search', search, this);
            this.view.on('pagesizechange', updatePageSize, this);
            this.view.on('pagechange', updatePage, this);
            this.view.on('batchmodify', batchModifyStatus, this);
            this.view.on('tablesort', updateTableSort, this);
            this.view.on('modifystatus', modifyStatus, this);
            this.getLayoutChangeNotifier().on('layoutchanged', this.adjustLayout, this);
        };

        /**
         * 查询的事件处理函数
         *
         * @event
         */
        function search() {
            this.performSearch();
        }

        /**
         * 进行查询
         *
         * @protected
         * @method mvc.ListAction#performSearch
         */
        exports.performSearch = function () {
            var event = this.fire('search');
            if (!event.isDefaultPrevented()) {
                var query = this.getSearchQuery();
                query.page = 1;
                this.reloadWithQueryUpdate(query);
            }
        };

        /**
         * 获取查询条件
         *
         * @protected
         * @method mvc.ListAction#getSearchQuery
         * @return {Object} 查询条件
         */
        exports.getSearchQuery = function () {
            var query = this.view.getSearchArgs();
            query.page = this.view.getPageIndex();

            return query;
        };

        /**
         * 页码更新后重新加载操作
         *
         * @protected
         * @method mvc.ListAction#reloadWithQueryUpdate
         * @param {Object} args 新的请求参数对象
         */
        exports.reloadWithQueryUpdate = function (args) {
            var url = getURLForQuery.call(this, args);
            this.redirect(url, {force: true});
        };

        /**
         * 更新每页显示条数
         *
         * @event
         * @param {mini-event.Event} e 事件对象
         * @param {number} e.pageSize 每页显示条目数
         */
        function updatePageSize(e) {
            // 先请求后端更新每页显示条数，然后直接刷新当前页
            this.model.updatePageSize(e.pageSize)
                .then(u.bind(afterPageSizeUpdate, this, e.pageSize));
        }

        /**
         * 每页大小更新后重新加载操作
         */
        function afterPageSizeUpdate() {
            var event = this.fire('pagesizechange');
            if (!event.isDefaultPrevented()) {
                var query = this.getSearchQuery();
                query.page = 1;
                this.reloadWithQueryUpdate(query);
            }
        }

        /**
         * 更新页码
         *
         * @event
         */
        function updatePage() {
            var event = this.fire('pagechange');
            if (!event.isDefaultPrevented()) {
                var query = this.getSearchQuery();
                this.reloadWithQueryUpdate(query);
            }
        }

        /**
         * 批量修改事件处理
         *
         * @event
         * @param {mini-event.Event} e 事件对象
         */
        function batchModifyStatus(e) {
            var items = this.view.getSelectedItems();
            this.modifyStatus(items, e.status);
        }

        /**
         * 修改实体状态
         *
         * @protected
         * @method mvc.ListAction#modifyStatus
         * @param {object[]} items 待修改状态的实体数组
         * @param {number} status 修改后实体的状态值
         */
        exports.modifyStatus = function (items, status) {
            var ids = u.pluck(items, 'id');
            var transitionItem = u.findWhere(
                this.model.getStatusTransitions(),
                {status: status}
            );
            var context = {
                ids: ids,
                items: items,
                status: status,
                statusName: transitionItem.statusName,
                command: transitionItem.command,
                reload: transitionItem.reload
            };

            if (this.requireAdviceFor(context)) {
                // 需要后端提示消息的，再额外加入用户确认的过程
                var action = u.pascalize(context.statusName);
                var adviceMethod = 'get' + action + 'Advice';

                this.model[adviceMethod](context.ids, context.items)
                    .then(u.bind(waitConfirmForAdvice, this, context))
                    .then(u.bind(updateEntities, this, context));
            }
            else {
                updateEntities.call(this, context);
            }
        };

        /**
         * 检查指定操作是否需要后端提示消息，默认删除操作时要求提示用户确认
         *
         * @protected
         * @method mvc.ListAction#requireAdviceFor
         * @param {meta.UpdateContext} context 操作的上下文对象
         * @return {boolean} 返回`true`表示需要提示用户
         */
        exports.requireAdviceFor = function (context) {
            return context.statusName === 'remove';
        };

        /**
         * 根据删除前确认
         *
         * @param {meta.UpdateContext} context 操作的上下文对象
         * @param {Object} advice 提示对象
         * @param {string} advice.message 提示信息
         * @return {er.Promise}
         */
        function waitConfirmForAdvice(context, advice) {
            var options = {
                title: context.command + this.getEntityDescription(),
                content: advice.message
            };
            return this.view.waitConfirm(options);
        }

        /**
         * 更新实体状态
         *
         * @param {meta.UpdateContext} context 操作的上下文对象
         */
        function updateEntities(context) {
            this.model[context.statusName](context.ids)
                .then(
                    u.bind(updateListStatus, this, context),
                    u.bind(this.notifyModifyFail, this, context)
                );
        }

        /**
         * 根据删除、启用的状态更新当前Action，默认行为为直接刷新当前的Action
         *
         * @param {meta.UpdateContext} context 操作的上下文对象
         */
        function updateListStatus(context) {
            this.notifyModifySuccess(context);

            var event = this.fire('statusupdate', context);
            if (context.reload === false) {
                this.updateItems(context);
            }
            else if (!event.isDefaultPrevented()) {
                this.reload();
            }
        }

        /**
         * 通知修改状态操作成功
         *
         * @protected
         * @method mvc.ListAction#notifyModifySuccess
         * @param {meta.UpdateContext} context 批量操作的上下文对象
         */
        exports.notifyModifySuccess = function (context) {};

        /**
         * 通知修改状态操作失败
         *
         * 默认提示用户“无法[操作名]部分或全部[实体名]”，或“无法[操作名]该[实体名]”
         *
         * @protected
         * @method mvc.ListAction#notifyModifyFail
         * @param {meta.UpdateContext} context 批量操作的上下文对象
         */
        exports.notifyModifyFail = function (context) {
            var entityDescription = this.getEntityDescription();
            if (context.ids.length > 1) {
                this.view.alert(
                    '无法' + context.command + '部分或全部' + entityDescription,
                    context.command + entityDescription
                );
            }
            else {
                this.view.alert(
                    '无法' + context.command + '该' + entityDescription,
                    context.command + entityDescription
                );
            }
        };

        /**
         * 更新列表中的实体的状态
         *
         * @protected
         * @method mvc.ListAction#updateItems
         * @param {meta.UpdateContext} context 操作的上下文对象
         */
        exports.updateItems = function (context) {
            var ids = context.ids;
            var targetStatus = context.status;
            var items = [];
            u.each(
                ids,
                function (id) {
                    var item = this.model.getItemById(id);
                    if (item) {
                        item.status = targetStatus;
                        items.push(item);
                    }
                },
                this
            );
            this.view.updateItems(items);
        };

        /**
         * 根据删除、启用的状态更新当前Action，默认行为为直接刷新当前的Action
         *
         * @event
         * @param {mini-event.Event} e 事件对象
         * @param {number} e.tableProperties 表格排序信息
         */
        function updateTableSort(e) {
            var event = this.fire('tablesort');
            if (!event.isDefaultPrevented()) {
                var query = this.getSearchQuery();
                query.page = 1;
                this.reloadWithQueryUpdate(query);
            }
        }

        /**
         * 处理状态修改
         *
         * @param {Object} e 包含待修改实体的id，以及更新到哪个状态
         */
        function modifyStatus(e) {
            var item = this.model.getItemById(e.id);
            this.modifyStatus([item], e.status);
        }

        /**
         * 进行查询引起的重定向操作
         *
         * @protected
         * @method mvc.ListAction#redirectForSearch
         * @param {Object} args 查询参数
         */
        exports.redirectForSearch = function (args) {
            var path = this.model.get('url').getPath();
            var url = URL.withQuery(path, args);
            this.redirect(url, {force: true});
        };

        /**
         * 获取指定页码的跳转URL(此接口目前不用了，但是为了防止外部已被调用，所以维持)
         *
         * @deprecated
         *
         * @param {number} page 指定的页码
         * @return {string}
         */
        exports.getURLForPage = function (page) {
            var url = this.context.url;
            var path = url.getPath();
            var query = url.getQuery();

            if (page === 1) {
                query = u.omit(query, 'page');
            }
            else {
                query.page = page;
            }

            return URL.withQuery(path, query).toString();
        };

        /**
         * 获取指定排序的跳转URL
         *
         * @param {Object} args 新的请求对象
         * @return {string}
         */
        function getURLForQuery(args) {
            var url = this.context.url;
            var path = url.getPath();

            // 如果跟默认的参数相同，去掉默认字段
            var defaultArgs = this.model.getDefaultArgs();
            args = u.purify(args, defaultArgs);

            return URL.withQuery(path, args).toString();
        }

        /**
         * 根据布局变化重新调整自身布局
         *
         * @protected
         * @method mvc.ListAction#adjustLayout
         */
        exports.adjustLayout = function () {
            this.view.adjustLayout();
        };

        /**
         * @override
         */
        exports.leave = function () {
            this.getLayoutChangeNotifier().un('layoutchanged', this.adjustLayout, this);

            this.$super(arguments);
        };

        /**
         * 获取table已经选择的列的数据
         *
         * @protected
         * @method mvc.ListAction#getSelectedItems
         * @return {Object[]} 当前table的已选择列对应的数据
         */
        exports.getSelectItems = function () {
            return this.view.getSelectedItems();
        };

        eoo.defineAccessor(exports, 'layoutChangeNotifier');

        var BaseAction = require('./BaseAction');
        var ListAction = eoo.create(BaseAction, exports);

        return ListAction;
    }
);
