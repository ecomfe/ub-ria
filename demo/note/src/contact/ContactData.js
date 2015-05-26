/**
 * DEMO
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 数据类
 * @exports contact.ContactData
 * @author lixiang(lixiang05@baidu.com)
 */
define(
    function (require) {
        var u = require('common/util');

        /**
         * @class company.CompanyData
         * @extends common.BaseData
         */
        var exports = {};
        /**
         * 检索一个实体列表，返回一个分页的结果集
         *
         * @public
         * @method ContactData#search
         * @param {Object} query 查询参数
         * @return {er.meta.FakeXHR}
         */
        exports.search = function (query) {
            return this.request(
                'contact/search',
                query,
                {
                    method: 'GET',
                    url: '/contacts'
                }
            );
        };

        /**
         * 根据id获取单个实体
         *
         * @public
         * @method ContactData#findById
         * @param {string} id 实体的id
         * @return {er.meta.FakeXHR}
         */
        exports.findById = function (id) {
            return this.request(
                'contact/findById',
                null,
                {
                    method: 'GET',
                    url: '/contacts/' + id
                }
            );
        };

        /**
         * 保存一个实体
         *
         * @public
         * @method ContactData#save
         * @param {Object} entity 实体对象
         * @return {er.meta.FakeXHR}
         */
        exports.save = function (entity) {
            return this.request(
                'contact/save',
                entity,
                {
                    method: 'POST',
                    url: '/contacts'
                }
            );
        };

        /**
         * 获取权限类别
         *
         * @public
         * @method ContactData#getRoles
         * @param {Object} entity 实体对象
         * @return {er.meta.FakeXHR}
         */
        exports.getRoles = function (entity) {
            return this.request(
                'contact/getRoles',
                entity,
                {
                    method: 'GET',
                    url: '/contacts/roles'
                }
            );
        };

        /**
         * 更新一个实体
         *
         * @public
         * @method ContactData#update
         * @param {Object} entity 实体对象
         * @return {er.meta.FakeXHR}
         */
        exports.update = function (entity) {
            var submitEntity = u.omit(entity, 'id');
            return this.request(
                'contact/update',
                submitEntity,
                {
                    method: 'PUT',
                    url: '/contacts/' + entity.id
                }
            );
        };


        var RequestManager = require('ub-ria/mvc/RequestManager');
        var ContactData = require('eoo').create(RequestManager, exports);
        
        var requests = [
            {
                name: 'contact/search',
                scope: 'instance',
                policy: 'auto'
            },
            {
                name: 'contact/findById',
                scope: 'instance',
                policy: 'auto'
            },
            {
                name: 'contact/save',
                scope: 'instance',
                policy: 'auto'
            },
            {
                name: 'contact/update',
                scope: 'instance',
                policy: 'auto'
            },
            {
                name: 'contact/gerRoles',
                scope: 'instance',
                policy: 'auto'
            }
        ];

        u.each(
            requests,
            function (config) {
                RequestManager.register(ContactData, config.name, config);
            }
        );

        return ContactData;
    }
);
