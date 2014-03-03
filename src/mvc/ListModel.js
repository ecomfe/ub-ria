/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 列表数据模型基类
 * @author otakustay
 * @date $DATE$
 */
define(
    function (require) {
        var BaseModel = require('./BaseModel');
        var util = require('er/util');
        var u = require('underscore');

        /**
         * 列表数据模型基类
         *
         * @extends mvc.BaseModel
         * @constructor
         */
        function ListModel() {
            BaseModel.apply(this, arguments);

            // 把默认参数补上，不然像表格的`orderBy`字段没值表格就不能正确显示
            u.each(
                this.getDefaultArgs(),
                function (value, key) {
                    if (!this.has(key)) {
                        this.set(key, value);
                    }
                },
                this
            );
        }

        util.inherits(ListModel, BaseModel);

        /**
         * 设定实体的状态迁移表
         *
         * 状态迁移每一项饱含以下3个属性：
         *
         * - `status`表示目标状态
         * - `deny`表示不能从其指定的状态进行迁移
         * - `accept`表示仅能从其指定的状态进行迁移
         *
         * 如果`accept`和`deny`同时存在，则使用`accept`与`deny`的差集
         *
         * @type {Object[]}
         */
        ListModel.prototype.statusTransitions = [
            { status: 0, deny: [0] },
            { status: 1, deny: [1] }
        ];

        /**
         * 配置默认`status`参数值，即当URL中没有此参数时发给后端的代替值
         *
         * 通常“状态”的默认选项不是“全部”，而是“启用”等状态，就会遇上这样的情况：
         *
         * - 如果将“启用”项的值设为`""`，则不会给后端`status`参数，会查询到所有数据
         * - 如果将“启用”项的值设为`"1"`，则所有入口要加上`status=1`参数
         *
         * 未了保持前端URL的整洁以及不需要外部关注默认的`status`参数，
         * 同时保证后端的兼容性，列表在设计的时候采用以下方案：
         *
         * 1. 将“启用”之类未删除状态的值设为`""`
         * 2. 在`ListModel`上添加`defaultStatusValue`属性，默认为`1`表示“启用”
         * 3. 如果URL中没有`status`参数，则使用`defaultStatusValue`属性代替
         * 4. 如果URL中的`status`参数值为`"all"`，则请求后端时不带此参数以获取全集
         *
         * @type {number | string}
         * @protected
         */
        ListModel.prototype.defaultStatusValue = 1;

        /**
         * 获取默认`status`参数值，即当URL中没有此参数时发给后端的代替值
         *
         * @return {string | number}
         * @protected
         */
        ListModel.prototype.getDefaultStatusValue = function () {
            return this.defaultStatusValue || '';
        };

        /**
         * 配置默认查询参数
         *
         * 如果某个参数与这里的值相同，则不会加到URL中
         *
         * 创建`Model`时，如果某个参数不存在，则会自动补上这里的值
         *
         * @type {Object}
         * @protected
         */
        ListModel.prototype.defaultArgs = {};

        /**
         * 默认查询参数
         *
         * 参考{@link ListModel#defaultArgs}属性的说明
         *
         * @return {Object}
         * @protected
         */
        ListModel.prototype.getDefaultArgs = function () {
            var args = this.defaultArgs || {};
            var defaultStatusValue = this.getDefaultStatusValue();
            if (!args.hasOwnProperty('status') && defaultStatusValue) {
                args.status = defaultStatusValue;
            }
            return args;
        };

        ListModel.prototype.defaultDatasource = {
            list: [
                {
                    retrieve: function (model) {
                        var query = model.getQuery();
                        query = require('../util').purify(query, null, true);

                        return model.search(query);
                    },
                    dump: true
                },
                {
                    name: 'hasResult',
                    retrieve: function (model) {
                        // 有返回内容，或者有查询参数的情况下，认为是有内容的
                        return model.get('results').length
                            || !u.isEmpty(model.get('url').getQuery());
                    }
                }
            ],

            pageSize: function (model) {
                return model.getPageSize();
            },

            // 分页URL模板，就是当前URL中把`page`字段替换掉
            urlTemplate: function (model) {
                var url = model.get('url');
                var path = url.getPath();
                // 由于`withQuery`会做URL编码，因此不能直接`query.page = '${page}'`，
                // 会被编码成`%24%7Bpage%7D`，此处只能直接操作字符串
                var query = url.getQuery();
                delete query.page;
                var template = '#' + require('er/URL').withQuery(path, query);
                var delimiter = u.isEmpty(query) ? '~' : '&';
                template += delimiter + 'page=${page}';
                return template;
            },

            // 清除搜索选项的html
            listWithoutKeywordURL: function(model) {
                var url = model.get('url');
                var path = url.getPath();
                var query = url.getQuery();
                query = u.omit(query, 'keyword');
                var template = '#' + require('er/URL').withQuery(path, query);
                return template;
            }
        };

        /**
         * 处理后续和UI有关的数据
         */
        function processUIData() {
            var canBatchModify = this.get('canBatchModify');
            this.set('selectMode', canBatchModify ? 'multi' : '');
        }

        /**
         * 加载数据
         *
         * @return {er.Promise}
         * @override
         */
        ListModel.prototype.load = function () {
            return BaseModel.prototype.load.apply(this, arguments)
                .then(u.bind(processUIData, this));
        };

        /**
         * 获取请求后端时的查询参数
         *
         * @return {Object}
         */
        ListModel.prototype.getQuery = function () {
            var query = {
                keyword: this.get('keyword'),
                status: this.get('status'),
                order: this.get('order'),
                orderBy: this.get('orderBy'),
                pageNo: this.get('page') || 1
            };

            // 调整“状态”属性
            if (!query.status) {
                query.status = this.getDefaultStatusValue();
            }
            else if (query.status === 'all') {
                query.status = '';
            }

            return query;
        };

        /**
         * 检查单个实体是否可以切换至目标状态
         *
         * @param {number} targetStatus 目标状态
         * @param {Object} entity 单个实体
         * @param {number} entity.status 实体的当前状态
         * @return boolean
         */
        function checkStatusTransition(targetStatus, entity) {
            var config = u.findWhere(
                this.statusTransitions,
                { status: targetStatus }
            );

            if (config.accept) {
                var accept = u.difference(config.accept, config.deny || []);
                return u.contains(accept, entity.status);
            }
            else if (config.deny) {
                return !u.contains(config.deny, entity.status);
            }
            else {
                return true;
            }
        }

        /**
         * 判断已经选择数据判断可以启用批量控件
         *
         * @param {Object[]} items 待更新的实体列表
         * @param {number} status 修改的目标状态
         */
        ListModel.prototype.canUpdateToStatus = function (items, status) {
            return u.any(items, u.bind(checkStatusTransition, this, status));
        };

        /**
         * 更新全局每页显示条数
         *
         * @param {number} pageSize 每页显示条数
         * @return {er.Promise}
         * @abstract
         */
        ListModel.prototype.updatePageSize = function (pageSize) {
            var data = this.data('global');
            if (!data) {
                throw new Error('No global data object attached to this Model');
            }
            if (typeof data.updatePageSize !== 'function') {
                throw new Error('No updatePageSize method implemented on global data object');
            }
            return data.updatePageSize(pageSize);
        };

        /**
         * 获取每页显示条数
         *
         * @return {number}
         * @abstract
         */
        ListModel.prototype.getPageSize = function () {
            var data = this.data('global');
            if (!data) {
                throw new Error('No global data object attached to this Model');
            }
            if (typeof data.getPageSize !== 'function') {
                throw new Error('No getPageSize method implemented on global data object');
            }
            return data.getPageSize();
        };

        /**
         * 获取列表全部数据
         *
         * @return {Object[]}
         */
        ListModel.prototype.getAllItems = function () {
            return this.get('results');
        };

        /**
         * 根据id获取列表中的对象
         *
         * @param {string | number} id 元素的id
         * @return {Object | null}
         */
        ListModel.prototype.getItemById = function (id) {
            var list = this.getAllItems();

            return list ? u.findWhere(list, { id: id }) : null;
        };

        /**
         * 获取元素（或指定id的元素）在列表中的下标
         *
         * @param {Object | string | number} item 要查找的元素或其id
         * @return {number} 无查找结果则返回`-1`
         */
        ListModel.prototype.indexOf = function (item) {
            var list = this.getAllItems();

            if (!list) {
                return -1;
            }

            if (typeof item === 'object') {
                return u.indexOf(list, item);
            }
            else {
                for (var i = 0; i < list.length; i++) {
                    if (list[i].id === item) {
                        return i;
                    }
                }
                return -1;
            }
        };

        /**
         * 查询列表
         *
         * @param {Object} [query] 查询参数
         * @return {er.Promise}
         */
        ListModel.prototype.search = function (query) {
            var data = this.data();
            if (!data) {
                throw new Error('No default data object attached to this Model');
            }
            if (typeof data.search !== 'function') {
                throw new Error('No search method implemented on default data object');
            }

            return data.search(query || {});
        };

        /**
         * 批量更新一个或多个实体的状态
         *
         * @param {number} status 目标状态
         * @param {string[]} ids id集合
         * @return {er.meta.FakeXHR}
         */
        ListModel.prototype.updateStatus = function (status, ids) {
            var data = this.data();
            if (!data) {
                throw new Error('No default data object attached to this Model');
            }
            if (typeof data.updateStatus !== 'function') {
                throw new Error('No updateStatus method implemented on default data object');
            }

            return data.updateStatus(status, ids);
        };

        /**
         * 删除一个或多个实体
         *
         * @param {string[]} ids id集合
         * @return {er.meta.FakeXHR}
         */
        ListModel.prototype.remove = u.partial(ListModel.prototype.updateStatus, 0);

        /**
         * 恢复一个或多个实体
         *
         * @param {string[]} ids id集合
         * @return {er.meta.FakeXHR}
         */
        ListModel.prototype.restore = u.partial(ListModel.prototype.updateStatus, 1);

        /**
         * 获取批量操作前的确认
         *
         * @param {number} status 目标状态
         * @param {string[]} ids id集合
         * @return {er.meta.FakeXHR}
         */
        ListModel.prototype.getAdvice = function (status, ids) {
            var data = this.data();
            if (!data) {
                throw new Error('No default data object attached to this Model');
            }
            if (typeof data.getAdvice !== 'function') {
                throw new Error('No getAdvice method implemented on default data object');
            }

            return data.getAdvice(status, ids);
        };

        /**
         * 批量删除前确认
         *
         * 此方法默认用于前端确认，如需后端检验则需要重写为调用`data().getRemoveAdvice`
         *
         * @param {string[]} ids id集合
         * @return {er.meta.FakeXHR}
         */
        ListModel.prototype.getRemoveAdvice = function (ids, entityName) {
            // 默认仅本地提示，有需要的子类重写为从远程获取信息
            var Deferred = require('er/Deferred');
            var advice = {
                message: '您确定要删除已选择的' + ids.length + '个'
                    + this.get('entityDescription') + '吗？'
            };
            return Deferred.resolved(advice);
        };

        /**
         * 批量恢复前确认
         *
         * @param {string[]} ids id集合
         * @return {er.meta.FakeXHR}
         */
        ListModel.prototype.getRestoreAdvice = u.partial(ListModel.prototype.getAdvice, 1);

        return ListModel;
    }
);
