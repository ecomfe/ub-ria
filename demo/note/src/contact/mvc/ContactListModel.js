/**
 * DEMO
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 列表数据模型
 * @exports contact.mvc.ContactListModel
 * @author dddbear(dddbear@aliyun.com)
 */
define(
    function (require) {
        var u = require('underscore');
        var datasource = require('er/datasource');
        var filterHelper = require('ub-ria/mvc/filterHelper');

        /**
         * 把Type枚举值转化成数组，并增加”全部“的元素，方便下拉选择控件直接使用
         *
         * @type {Array}
         */
        var authTypes = require('../enum').AuthTypes.toArray(
            {text: '全部', value: 'all'},
            'PERSONAL',
            'PUBLIC'
        );

        /**
         * 角色类型，动态的，需要从后端获取
         *
         * @type {Object}
         */
        var ROLE_TYPE_DATASOURCE = {
            roleTypes: function (model) {
                return model.data().getRoles();
            }
        };

        /**
         * 权限类型，静态的，从枚举变量获取
         *
         * @type {Object}
         */
        var AUTH_TYPE_DATASOURCE = {
            authTypes: datasource.constant(authTypes)
        };

        /**
         * @class contact.mvc.ContactListModel
         * @extends ub-ria.mvc.ListModel
         */
        var exports = {};

        /**
         * @override
         */
        exports.constructor = function () {
            this.$super(arguments);
            this.putDatasource(ROLE_TYPE_DATASOURCE, 0);
            this.putDatasource(AUTH_TYPE_DATASOURCE, 0);
        };

        /**
         * @override
         */
        exports.defaultArgs = {
            orderBy: 'contactId',
            order: 'desc'
        };

        /**
         * @override
         */
        exports.getFilters = function () {
            return {
                roleType: {
                    value: this.get('roleType'),
                    text: filterHelper.select.getText,
                    datasource: this.get('roleTypes')
                },
                authType: {
                    value: this.get('authType'),
                    text: filterHelper.select.getText,
                    datasource: this.get('authTypes')
                }
            };
        };

        var ListModel = require('ub-ria/mvc/ListModel');
        var ContactListModel = require('eoo').create(ListModel, exports);
        return ContactListModel;
    }
);
