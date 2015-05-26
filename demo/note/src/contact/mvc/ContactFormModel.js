/**
 * DEMO
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 表单模型
 * @exports contact.mvc.ContactFormModel
 * @author dddbear(dddbear@aliyun.com)
 */
define(
    function (require) {
        var u = require('underscore');
        var datasource = require('er/datasource');

        var authTypes = require('../enum').AuthTypes.toArray(
            'PERSONAL',
            'PUBLIC'
        );

        /**
         * 表单数据模型类
         *
         * @class mvc.ContactFormModel
         * @extends ub-ria.mvc.FormModel
         */
        var exports = {};

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
        exports.prepare = function () {
            this.$super(arguments);
            var roleTypes = this.get('roleTypes');

            roleTypes = u.map(
                roleTypes, 
                function (item) {
                    return {
                        text: item.name,
                        value: item.id
                    };
                }
            );
            roleTypes.unshift({name: '请选择', id: ''});

            this.set('roleTypes', roleTypes);

        };

        var eoo = require('eoo');
        var ContactFormModel = eoo.create(require('ub-ria/mvc/FormModel'), exports);
        return ContactFormModel;
    }
);
