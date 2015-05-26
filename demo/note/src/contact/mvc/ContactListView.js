/**
 * DEMO
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 列表视图
 * @exports contact.mvc.ContactListView
 * @author dddbear(dddbear@aliyun.com)
 */
define(
    function (require) {
        require('tpl!../tpl/contactList.tpl.html');

        var AuthTypes = require('../enum').AuthTypes;

        /**
         * @class company.mvc.ContactListView
         * @extends ub-ria.mvc.ListView
         */
        var exports = {};

        /**
         * @override
         */
        exports.template = 'contactList';

        /**
         * @override
         */
        exports.getTableFields = function () {
            var tableFields = [
                {
                    title: '姓名',
                    field: 'name',
                    sortable: true,
                    resizable: false,
                    width: 120,
                    stable: false,
                    content: 'name'
                },
                {
                    title: '电话',
                    field: 'phone',
                    sortable: true,
                    resizable: false,
                    width: 120,
                    stable: false,
                    content: 'phone'
                },
                {
                    title: '权限类型',
                    field: 'authType',
                    sortable: true,
                    resizable: false,
                    width: 80,
                    stable: true,
                    content: function (item) {
                        return AuthTypes.getTextFromValue(item.authType);
                    }
                },
                {
                    title: '角色类型',
                    field: 'roleTypeName',
                    sortable: true,
                    resizable: false,
                    width: 80,
                    stable: true,
                    content: 'roleTypeName'
                },
                {
                    title: '备注',
                    field: 'description',
                    width: 300,
                    sortable: false,
                    resizable: false,
                    content: 'description'
                },
                {
                    title: '操作',
                    field: 'operation',
                    sortable: false,
                    resizable: false,
                    width: 50,
                    stable: true,
                    content: function (item) {
                        var config = [
                            {
                                text: '修改',
                                command: 'modify',
                                type: 'modify',
                                auth: item.canModify,
                                args: item.id
                            },
                            '|',
                            {
                                command: 'remove',
                                type: 'remove',
                                args: item.id,
                                text: '删除',
                                auth: item.canDelete
                            }
                        ];

                        var Table = require('esui/Table');
                        return Table.slideOperations(config);
                    }
                }
            ];

            return tableFields;
        };

        var eoo = require('eoo');

        var ListView = require('ub-ria/mvc/ListView');
        var ContactListView = require('eoo').create(ListView, exports);
        return ContactListView;
    }
);
