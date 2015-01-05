/**
 * UB RIA Base
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file 数据类基类
 * @exports ub-ria.mvc.BaseData
 * @author otakustay(otakustay@gmail.com)
 */
define(
    function (require) {
        /**
         * @class ub-ria.mvc.BaseData
         * @extends ub-ria.mvc.RequestManager
         */
        var exports = {};

        // 以下是常用数据操作方法，这些方法的前提是有按以下规则注册相关请求：
        //
        // - 查询：/{entities}/search
        // - 列表：/{entities}/list
        // - 树：/{entities}/tree
        // - 保存：/{entities}/save
        // - 更新：/{entities}/update
        // - 更改状态: /{entities}/updateStatus
        // - 批量操作确认: /{entities}/getAdvice
        // - 获取单个实体: /{entities}/findById
        //
        // 注册配置时可以不写明`url`和`method`，但依旧建议写上，当作文档看，
        // 如果没注册，也可正常使用，但无法使用AJAX管理机制

        /**
         * 检索一个实体列表，返回一个分页的结果集
         *
         * @public
         * @method ub-ria.mvc.BaseData#search
         * @param {Object} query 查询参数
         * @return {er.meta.FakeXHR}
         */
        exports.search = function (query) {
            return this.request(
                '$entity/search',
                query,
                {
                    method: 'GET',
                    url: '/$entity'
                }
            );
        };

        /**
         * 获取一个实体列表（不分页）
         *
         * @public
         * @method ub-ria.mvc.BaseData#list
         * @param {Object} query 查询参数
         * @return {er.meta.FakeXHR}
         */
        exports.list = function (query) {
            return this.request(
                '$entity/list',
                query,
                {
                    method: 'GET',
                    url: '/$entity/list'
                }
            );
        };

        /**
         * 检索一个实体树结构
         *
         * @public
         * @method ub-ria.mvc.BaseData#tree
         * @param {Object} query 查询参数
         * @return {er.meta.FakeXHR}
         */
        exports.tree = function (query) {
            return this.request(
                '$entity/tree',
                query,
                {
                    method: 'GET',
                    url: '/$entity/tree'
                }
            );
        };

        /**
         * 保存一个实体
         *
         * @public
         * @method ub-ria.mvc.BaseData#save
         * @param {Object} entity 实体对象
         * @return {er.meta.FakeXHR}
         */
        exports.save = function (entity) {
            return this.request(
                '$entity/save',
                entity,
                {
                    method: 'POST',
                    url: '/$entity'
                }
            );
        };

        /**
         * 更新一个实体
         *
         * @public
         * @method ub-ria.mvc.BaseData#update
         * @param {Object} entity 实体对象
         * @return {er.meta.FakeXHR}
         */
        exports.update = function (entity) {
            return this.request(
                '$entity/update',
                entity,
                {
                    method: 'PUT',
                    url: '/$entity/' + entity.id
                }
            );
        };

        /**
         * 批量更新一个或多个实体的状态
         *
         * @public
         * @method ub-ria.mvc.BaseData#updateStatus
         * @param {string} action 操作名称
         * @param {number} status 目标状态
         * @param {Array.<string>} ids id集合
         * @return {er.meta.FakeXHR}
         */
        exports.updateStatus = function (action, status, ids) {
            return this.request(
                '$entity/' + action,
                {
                    ids: ids,
                    status: status
                },
                {
                    method: 'POST',
                    url: '/$entity/status'
                }
            );
        };

        /**
         * 获取批量操作前的确认
         *
         * @public
         * @method ub-ria.mvc.BaseData#getAdvice
         * @param {number} status 目标状态
         * @param {Array.<string>} ids id集合
         * @return {er.meta.FakeXHR}
         */
        exports.getAdvice = function (status, ids) {
            return this.request(
                '$entity/advice',
                {
                    ids: ids,
                    status: status
                },
                {
                    method: 'GET',
                    url: '/$entity/status/advice'
                }
            );
        };

        /**
         * 根据id获取单个实体
         *
         * @public
         * @method ub-ria.mvc.BaseData#findById
         * @param {string} id 实体的id
         * @return {er.meta.FakeXHR}
         */
        exports.findById = function (id) {
            return this.request(
                '$entity/findById',
                null,
                {
                    method: 'GET',
                    url: '/$entity/' + id
                }
            );
        };

        var RequestManager = require('ub-ria/mvc/RequestManager');
        var BaseData = require('eoo').create(RequestManager, exports);

        return BaseData;
    }
);
