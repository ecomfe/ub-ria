/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 列表Action基类
 * @author otakustay, wangyaqiong(catkin2009@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseAction = require('./BaseAction');
        var util = require('er/util');
        var u = require('underscore');
        var URL = require('er/URL');

        /**
         * 列表Action基类
         *
         * @param {string} [entityName] 负责的实体名称
         * @extends BaseAction
         * @constructor
         */
        function ListAction(entityName) {
            BaseAction.apply(this, arguments);
        }

        util.inherits(ListAction, BaseAction);

        ListAction.prototype.modelType = './ListModel';

        /**
         * 当前页面的分类，始终为`"list"`
         *
         * @type {string}
         * @readonly
         * @override
         */
        ListAction.prototype.category = 'list';

        /**
         * 进行查询
         */
        ListAction.prototype.performSearch = function () {
            var event = this.fire('search');
            if (!event.isDefaultPrevented()) {
                var query = this.getSearchQuery();
                query.page = 1;
                this.reloadWithQueryUpdate(query);
            }
        };

        /**
         * 进行查询引起的重定向操作
         *
         * @param {Object} args 查询参数
         */
        ListAction.prototype.redirectForSearch = function (args) {
            var path = this.model.get('url').getPath();
            var url = URL.withQuery(path, args);
            this.redirect(url, { force: true });
        };

        /**
         * 获取指定页码的跳转URL(此接口目前不用了，但是为了防止外部已被调用，所以维持)
         *
         * @deprecated
         *
         * @param {number} page 指定的页码
         * @return {string}
         */
        ListAction.prototype.getURLForPage = function (page) {
            var url = this.context.url;
            var path = url.getPath();
            var query = url.getQuery();

            if (page === 1) {
                query = u.omit(query, 'page');
            }
            else {
                query.page = page;
            }

            return require('er/URL').withQuery(path, query).toString();
        };

        /**
         * 查询的事件处理函数
         *
         * @ignore
         */
        function search() {
            this.performSearch();
        }

        /**
         * 获取查询条件
         *
         * @return {object} 查询条件
         */
        ListAction.prototype.getSearchQuery = function () {
            var query = this.view.getSearchArgs();
            query.page = this.view.getPageIndex();

            return query;
        };

        /**
         * 更新每页显示条数
         *
         * @param {mini-event.Event} e 事件对象
         * @param {number} e.pageSize 每页显示条目数
         * @ignore
         */
        function updatePageSize(e) {
            // 先请求后端更新每页显示条数，然后直接刷新当前页
            this.model.updatePageSize(e.pageSize)
                .then(u.bind(afterPageSizeUpdate, this, e.pageSize));
        }

        /**
         * 每页大小更新后重新加载操作
         *
         * @ignore
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
         * @ignore
         */
        function updatePage() {
            var event = this.fire('pagechange');
            if (!event.isDefaultPrevented()) {
                var query = this.getSearchQuery();
                this.reloadWithQueryUpdate(query);
            }
        }

        /**
         * 更新表格排序
         *
         * @param {mini-event.Event} e 事件对象
         * @param {number} e.tableProperties 表格排序信息
         * @ignore
         */
        function updateTableSort(e) {
            this.model.set('order', e.tableProperties.order);
            this.model.set('orderBy', e.tableProperties.orderBy);
            var event = this.fire('tablesort');
            if (!event.isDefaultPrevented()) {
                var query = this.getSearchQuery();
                query.page = 1;
                this.reloadWithQueryUpdate(query);
            }
        }

        /**
         * 页码更新后重新加载操作
         *
         * @param {Object} args 新的请求参数对象
         * @protected
         */
        ListAction.prototype.reloadWithQueryUpdate = function (args) {
            var url = getURLForQuery.call(this, args);
            this.redirect(url, { force: true });
        };

        /**
         * 批量修改事件处理
         *
         * @param {mini-event.Event} e 事件对象
         * @ignore
         */
        function batchModifyStatus(e) {
            var items = this.view.getSelectedItems();
            this.modifyStatus(items, e.status);
        }

        /**
         * 修改实体状态
         *
         * @param {object[]} items 待修改状态的实体数组
         * @param {number} status 修改后实体的状态值
         */
        ListAction.prototype.modifyStatus = function (items, status) {
            var ids = u.pluck(items, 'id');
            var transitionItem = u.findWhere(
                this.model.getStatusTransitions(),
                { status: status }
            );
            var context = {
                ids: ids,
                items: items,
                status: status,
                statusName: transitionItem.statusName,
                command: transitionItem.command
            };

            if (this.requireAdviceFor(context)) {
                // 需要后端提示消息的，再额外加入用户确认的过程
                var action = require('../util').pascalize(context.statusName);
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
         * 根据删除前确认
         *
         * @param {meta.UpdateContext} context 操作的上下文对象
         */
        function waitConfirmForAdvice(context, advice) {
            var options = {
                title: context.command + this.getEntityDescription(),
                content: advice.message
            };
            return this.view.waitConfirm(options);
        }

        /**
         * 通知修改状态操作成功
         *
         * @param {meta.UpdateContext} context 批量操作的上下文对象
         */
        ListAction.prototype.notifyModifySuccess = function (context) {
        };

        /**
         * 通知修改状态操作失败
         *
         * 默认提示用户“无法[操作名]部分或全部[实体名]”，或“无法[操作名]该[实体名]”
         *
         * @param {meta.UpdateContext} context 批量操作的上下文对象
         */
        ListAction.prototype.notifyModifyFail = function (context) {
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
         * 根据删除、启用的状态更新当前Action，默认行为为直接刷新当前的Action
         *
         * @param {meta.UpdateContext} context 操作的上下文对象
         */
        function updateListStatus(context) {
            this.notifyModifySuccess(context);

            var event = this.fire('statusupdate', context);
            if (!event.isDefaultPrevented()) {
                this.reload();
            }
        }

        /**
         * 检查指定操作是否需要后端提示消息，默认删除操作时要求提示用户确认
         *
         * @param {meta.UpdateContext} context 操作的上下文对象
         * @return {boolean} 返回`true`表示需要提示用户
         */
        ListAction.prototype.requireAdviceFor = function (context) {
            return context.statusName === 'remove';
        };

        /**
         * 初始化交互行为
         *
         * @protected
         * @override
         */
        ListAction.prototype.initBehavior = function () {
            BaseAction.prototype.initBehavior.apply(this, arguments);
            this.view.on('search', search, this);
            this.view.on('pagesizechange', updatePageSize, this);
            this.view.on('batchmodify', batchModifyStatus, this);
            this.view.on('pagechange', updatePage, this);
            this.view.on('tablesort', updateTableSort, this);
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
            args = require('../util').purify(args, defaultArgs);

            return require('er/URL').withQuery(path, args).toString();
        }

        /**
         * 根据布局变化重新调整自身布局
         */
        ListAction.prototype.adjustLayout = function () {
            this.view.adjustLayout();
        };

        return ListAction;
    }
);
