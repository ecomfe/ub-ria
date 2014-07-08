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

        // 加载列表
        var LIST_DATASOURCE = {
            list: {
                retrieve: function (model) {
                    var query = model.getQuery();
                    query = require('../util').purify(query, null, true);

                    return model.search(query);
                },
                dump: true
            }
        };

        // 加载没有搜索词时的URL，用于搜索词后的“清空”链接
        var LIST_WITHOUT_KEYWORD_URL_DATASOURCE = {
            listWithoutKeywordURL: function (model) {
                var url = model.get('url');
                var path = url.getPath();
                var query = url.getQuery();
                query = u.omit(query, 'keyword');
                var template = '#' + require('er/URL').withQuery(path, query);
                return template;
            }
        };

        // 加载是否有列表数据的值
        var HAS_RESULT_DATASOURCE = {
            hasResult: function (model) {
                // 有返回内容，或者有查询参数的情况下，认为是有内容的
                return model.get('results').length || !u.isEmpty(model.get('url').getQuery());
            }
        };

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

            this.putDatasource(LIST_DATASOURCE, 0);
            this.putDatasource(LIST_WITHOUT_KEYWORD_URL_DATASOURCE, 0);
            this.putDatasource(HAS_RESULT_DATASOURCE, 1);
        }

        util.inherits(ListModel, BaseModel);

        /**
         * 设定实体的状态迁移表
         *
         * 状态迁移每一项可包含以下5个属性
         *
         * - `status`表示目标状态，必须
         * - `deny`表示不能从其指定的状态进行迁移
         * - `accept`表示仅能从其指定的状态进行迁移
         * - `statusName`表示`status`对应的操作名, 是一个camelCase的格式，必须
         * - `command`表示`status`对应操作的中文描述，必须
         *
         * 如果`accept`和`deny`同时存在，则使用`accept`与`deny`的差集
         * `status`, `statusName`, `command`三项必须有
         *
         * @type {Object[]}
         */
        ListModel.prototype.statusTransitions = [
            { status: 0, deny: [0], statusName: 'remove', command: '删除' },
            { status: 1, deny: [1], statusName: 'restore', command: '启用' }
        ];

        /**
         * 获取实体的状态迁移表
         *
         * @return {object[]}
         */
        ListModel.prototype.getStatusTransitions = function () {
            return this.statusTransitions;
        };

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
            return BaseModel.prototype.load.apply(this, arguments).then(u.bind(processUIData, this));
        };

        /**
         * 处理加载后的数据
         * @return {er.Promise}
         * @override
         */
        ListModel.prototype.prepare = function () {
            this.set('filtersInfo', this.getFiltersInfo());
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
                this.getStatusTransitions(),
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
         * 删除前确认
         *
         * 此方法默认用于前端确认，如需后端检验则需要重写为调用`data().getRemoveAdvice`
         *
         * @param {string[]} ids id集合
         * @return {er.meta.FakeXHR}
         */
        ListModel.prototype.getRemoveAdvice = function (ids, entityName) {
            // 默认仅本地提示，有需要的子类重写为从远程获取信息
            var Deferred = require('er/Deferred');
            var count = ids.length;
            var description = this.get('entityDescription');

            var message = '您确定要删除已选择的' + count + '个' + description + '吗？';
            if (count <= 1) {
                message = '您确定要删除该' + description + '吗？';
            }
            var advice = {
                message: message
            };

            return Deferred.resolved(advice);
        };

        /**
         * 恢复前确认
         *
         * @param {string[]} ids id集合
         * @return {er.meta.FakeXHR}
         */
        ListModel.prototype.getRestoreAdvice = u.partial(ListModel.prototype.getAdvice, 1);

        function getClearURL(model, name) {
            var url = model.get('url');
            var query = u.omit(url.getQuery(), name);
            return '#' + require('er/URL').withQuery(url.getPath(), query);
        }

        /**
         * 返回原始筛选配置数组
         * @override
         * @returns {Object}
         *
         */
        ListModel.prototype.getFilters = function () {
            return {};
        };

        /**
         * 返回经过处理的筛选数组
         * @returns {Object}
         */
        ListModel.prototype.getFiltersInfo = function () {
            var isAllFiltersDefault = true;
            var defaultArgs = this.getDefaultArgs();
            var filters = {};
            u.each(
                this.getFilters(),
                function (rawFilter, name) {
                    var filter = {
                        text: typeof rawFilter.text === 'function' ? rawFilter.text(rawFilter) : rawFilter.text,
                        clearURL: getClearURL(this, name),
                        defaultValue: defaultArgs[name]
                    };

                    u.defaults(filter, rawFilter);
                    filter.isDefaultValue = filter.hasOwnProperty('isDefaultValue')
                        ? filter.isDefaultValue
                        : filter.defaultValue == filter.value;

                    if (!filter.isDefaultValue) {
                        isAllFiltersDefault = false;
                    }

                    filters[name] = filter;
                },
                this
            );

            return {
                filters: filters,
                isAllFiltersDefault: isAllFiltersDefault
            };
        };

        return ListModel;
    }
);
