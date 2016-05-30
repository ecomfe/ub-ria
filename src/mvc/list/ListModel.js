/**
 * UB RIA Base
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 列表数据模型基类
 * @author otakustay
 */

import u from '../../util';
import URL from 'er/URL';
import BaseModel from '../common/BaseModel';
import * as loader from './loader';

/**
 * 列表数据模型基类
 *
 * @class mvc.ListModel
 * @extends mvc.BaseModel
 */
export default class ListModel extends BaseModel {

    /**
     * 构造函数
     *
     * @constructs mvc.ListModel
     * @param {Object} [context] 初始化数据
     */
    constructor(context) {
        super(context);

        // 把默认参数补上，不然像表格的`orderBy`字段没值表格就不能正确显示
        u.each(
            this.defaultArgs,
            (value, key) => {
                if (!this.has(key)) {
                    this.set(key, value);
                }
            }
        );

        this.putLoader(loader.list, 0);
        this.putLoader(loader.pageSize, 0);
    }

    /**
     * 获取实体的状态迁移表
     *
     * 如果某一个{@link meta.StatusTransition}中同时存在`accept`和`deny`属性，则使用`accept`与`deny`的差集
     *
     * @protected
     * @member mvc.ListModel#statusTransitions
     * @type {meta.StatusTransition[]}
     */
    get statusTransitions() {
        return [
            {
                status: 0,
                deny: [0],
                statusName: 'remove',
                command: '删除'
            },
            {
                status: 1,
                deny: [1],
                statusName: 'restore',
                command: '启用'
            }
        ];
    }


    /**
     * 获取默认`status`参数值，即当URL中没有此参数时发给后端的代替值
     *
     * 通常“状态”的默认选项不是“全部”，而是“启用”等状态，就会遇上这样的情况：
     *
     * - 如果将“启用”项的值设为`""`，则不会给后端`status`参数，会查询到所有数据
     * - 如果将“启用”项的值设为`"1"`，则所有入口要加上`status=1`参数
     *
     * 为了保持前端URL的整洁以及不需要外部关注默认的`status`参数，同时保证后端的兼容性，列表在设计的时候采用以下方案：
     *
     * 1. 将“启用”之类未删除状态的值设为`""`
     * 2. 在`ListModel`上添加`defaultStatusValue`属性，默认为`1`表示“启用”
     * 3. 如果URL中没有`status`参数，则使用`defaultStatusValue`属性代替
     * 4. 如果URL中的`status`参数值为`"all"`，则请求后端时不带此参数以获取全集
     *
     * @protected
     * @member {number | string} mvc.ListModel#defaultStatusValue
     */
    get defaultStatusValue() {
        return 1;
    }

    /**
     * 配置默认查询参数
     *
     * 如果某个参数与这里的值相同，则不会加到URL中
     *
     * 创建`Model`时，如果某个参数不存在，则会自动补上这里的值
     *
     * @protected
     * @member mvc.ListModel#defaultArgs
     * @type {Object}
     */
    get defaultArgs() {
        return {status: this.defaultStatusValue};
    }

    /**
     * 返回原始筛选配置对象
     *
     * @protected
     * @member mvc.ListModel#filters
     * @return {Object}
     */
    get filters() {
        return {};
    }

    get tableFields() {
        return [];
    }

    defineComputedProperties() {
        super.defineComputedProperties();

        this.defineComputedProperty(
            'tableFields',
            [],
            () => this.tableFields
        );

        this.defineComputedProperty(
            'listWithoutKeywordURL',
            [],
            () => {
                let url = this.get('url');
                let path = url.getPath();
                let query = u.omit(url.getQuery(), 'keyword');
                let template = '#' + URL.withQuery(path, query);
                return template;
            }
        );

        this.defineComputedProperty(
            'hasResult',
            ['results'],
            () => {
                let results = this.get('results');
                // 有返回内容，或者有查询参数的情况下，认为是有内容的
                return (results && results.length) || !u.isEmpty(this.get('url').getQuery());
            }
        );

        this.defineComputedProperty(
            'selectMode',
            [],
            () => {
                if (!this.permission) {
                    return 'multi';
                }

                return this.checkPermission('canBatchModify') ? 'multi' : '';
            }
        );

        this.defineComputedProperty(
            'filtersInfo',
            [],
            () => this.filtersInfo
        );
    }

    /**
     * 获取指定状态的转换表
     *
     * @param {number} status 指定的状态码
     * @return {meta.StatusTransition}
     */
    getTransitionForStatus(status) {
        return u.findWhere(this.statusTransitions, {status});
    }

    /**
     * 获取请求后端时的查询参数
     *
     * @method mvc.ListModel#getQuery
     * @return {Object}
     */
    getQuery() {
        let query = {
            keyword: this.get('keyword'),
            status: this.get('status'),
            order: this.get('order'),
            orderBy: this.get('orderBy'),
            pageNo: this.get('page') || 1
        };

        // 调整“状态”属性
        if (!query.status) {
            query.status = this.defaultStatusValue;
        }
        else if (query.status === 'all') {
            query.status = '';
        }

        return query;
    }

    /**
     * 判断已经选择数据判断可以启用批量控件
     *
     * @protected
     * @method mvc.ListModel#canUpdateToStatus
     * @param {Object[]} items 待更新的实体列表
     * @param {number} status 修改的目标状态
     * @return {boolean}
     */
    canUpdateToStatus(items, status) {
        let checkStatusTransition = entity => {
            let config = this.getTransitionForStatus(status);

            if (config.accept) {
                let accept = u.difference(config.accept, config.deny || []);
                return u.contains(accept, entity.status);
            }
            else if (config.deny) {
                return !u.contains(config.deny, entity.status);
            }

            return true;
        };

        return u.any(items, checkStatusTransition);
    }

    /**
     * 更新全局每页显示条数
     *
     * @abstract
     * @method mvc.ListModel#updatePageSize
     * @param {number} pageSize 每页显示条数
     * @return {Promise}
     */
    async updatePageSize(pageSize) {
        let data = this.data('global');
        if (!data) {
            throw new Error('No global data object attached to this Model');
        }
        if (typeof data.updatePageSize !== 'function') {
            throw new Error('No updatePageSize method implemented on global data object');
        }
        return data.updatePageSize(pageSize);
    }

    /**
     * 获取列表全部数据
     *
     * @protected
     * @method mvc.ListModel#getAllItems
     * @return {Object[]}
     */
    getAllItems() {
        return this.get('results');
    }

    /**
     * 根据id获取列表中的对象
     *
     * @protected
     * @method mvc.ListModel#getItemById
     * @param {string | number} id 元素的id
     * @return {Object | null}
     */
    getItemById(id) {
        let list = this.getAllItems();

        /* eslint-disable eqeqeq */
        return u.find(list, item => item.id == id);
        /* eslint-enable eqeqeq */
    }

    /**
     * 获取元素（或指定id的元素）在列表中的下标
     *
     * @protected
     * @method mvc.ListModel#indexOf
     * @param {Object | string | number} item 要查找的元素或其id
     * @return {number} 无查找结果则返回`-1`
     */
    indexOf(item) {
        let list = this.getAllItems();

        if (!list) {
            return -1;
        }

        if (typeof item === 'object') {
            return list.indexOf(item);
        }

        for (let i = 0; i < list.length; i++) {
            if (list[i].id === item) {
                return i;
            }
        }

        return -1;
    }

    /**
     * 查询列表
     *
     * @abstract
     * @method mvc.ListModel#search
     * @param {Object} [query] 查询参数
     * @return {Promise.<meta.ListResponse>}
     */
    async search(query = {}) {
        let data = this.data();
        if (!data) {
            throw new Error('No default data object attached to this Model');
        }
        if (typeof data.search !== 'function') {
            throw new Error('No search method implemented on default data object');
        }

        return data.search(query);
    }

    /**
     * 批量更新一个或多个实体的状态
     *
     * @abstract
     * @method mvc.ListModel#updateStatus
     * @param {number} status 目标状态
     * @param {string[]} ids id集合
     * @return {Promise}
     */
    async updateStatus(status, ids) {
        let data = this.data();
        if (!data) {
            throw new Error('No default data object attached to this Model');
        }
        if (typeof data.updateStatus !== 'function') {
            throw new Error('No updateStatus method implemented on default data object');
        }

        return data.updateStatus(status, ids);
    }

    /**
     * 删除一个或多个实体
     *
     * @method mvc.ListModel#remove
     * @param {string[]} ids id集合
     * @return {Promise}
     */
    remove(ids) {
        return this.updateStatus(0, ids);
    }

    /**
     * 恢复一个或多个实体
     *
     * @method mvc.ListModel#restore
     * @param {string[]} ids id集合
     * @return {Promise}
     */
    restore(ids) {
        return this.updateStatus(1, ids);
    }

    /**
     * 获取批量操作前的确认
     *
     * @abstract
     * @method mvc.ListModel#getAdvice
     * @param {number} status 目标状态
     * @param {string[]} ids id集合
     * @return {Promise.<meta.Advice>}
     */
    async getAdvice(status, ids) {
        let config = this.getTransitionForStatus(status);

        if (config && config.statusName) {
            let adviceMethod = this['get' + u.pascalize(config.statusName) + 'Advice'];
            if (adviceMethod) {
                return adviceMethod.call(this, ids);
            }
        }

        let data = this.data();
        if (!data) {
            throw new Error('No default data object attached to this Model');
        }
        if (typeof data.getAdvice !== 'function') {
            throw new Error('No getAdvice method implemented on default data object');
        }

        return data.getAdvice(status, ids);
    }

    /**
     * 删除前确认
     *
     * 此方法默认用于前端确认，如需后端检验则需要重写为调用`data().getRemoveAdvice`
     *
     * @param {string[]} ids id集合
     * @return {Promise.<meta.Advice>}
     */
    async getRemoveAdvice(ids) {
        // 默认仅本地提示，有需要的子类重写为从远程获取信息
        let count = ids.length;
        let description = this.get('entityDescription');

        let message = '您确定要删除已选择的' + count + '个' + description + '吗？';
        if (count <= 1) {
            message = '您确定要删除该' + description + '吗？';
        }
        let advice = {message};

        return advice;
    }

    /**
     * 返回经过处理的筛选数组
     *
     * @protected
     * @member mvc.ListModel#filtersInfo
     * @return {Object}
     */
    get filtersInfo() {
        let isAllFiltersDefault = true;
        let defaultArgs = this.defaultArgs;
        let filters = {};
        u.each(
            this.filters,
            (rawFilter, name) => {
                let filter = {
                    text: typeof rawFilter.text === 'function' ? rawFilter.text(rawFilter) : rawFilter.text,
                    defaultValue: defaultArgs[name],
                    name: name
                };

                u.defaults(filter, rawFilter);
                /* eslint-disable eqeqeq */
                filter.isDefaultValue = filter.hasOwnProperty('isDefaultValue')
                    ? filter.isDefaultValue
                    : filter.defaultValue == filter.value;
                /* eslint-enable eqeqeq */

                if (!filter.isDefaultValue) {
                    isAllFiltersDefault = false;
                }

                filters[name] = filter;
            }
        );

        return {filters, isAllFiltersDefault};
    }
}
