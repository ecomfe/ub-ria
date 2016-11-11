/**
 * SSP
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 公司模块配置
 * @author lixiang05(lixiang05@baidu.com)
 */
define(
    function (require) {
        var ActionFactory = require('common/IoCActionFactory');
        var ioc = require('common/ioc');

        var actions = [
            {
                path: '/contact/list',
                type: new ActionFactory('contactList'),
                title: '联系人 - 列表',
                authority: ['CONTACT_VIEW']
            },
            {
                path: '/contact/create',
                type: new ActionFactory('contactForm'),
                title: '联系人 - 新建',
                args: {formType: 'create'},
                authority: ['CONTACT_NEW']
            }
        ];
        require('er/controller').registerAction(actions);

        var components = {
            contactData: {
                module: 'contact/ContactData',
                auto: true,
                properties: {
                    requestStrategy: {
                        $import: 'commonRequestStrategy',
                        scope: 'singleton',
                        args: ['contact', 'contactor']
                    }
                }
            },
            contactPermission: {
                module: 'contact/ContactPermission',
                scope: 'singleton',
                auto: true
            },
            contactListModel: {
                module: 'contact/mvc/ContactListModel',
                auto: true,
                properties: {
                    data: {
                        $ref: 'contactData'
                    },
                    permission: {
                        $ref: 'contactPermission'
                    }
                }
            },
            contactListView: {
                module: 'contact/mvc/ContactListView',
                auto: true
            },
            contactList: {
                module: 'contact/mvc/ContactList',
                properties: {
                    model: {
                        $ref: 'contactListModel'
                    },
                    view: {
                        $ref: 'contactListView'
                    }
                },
                args: ['contact'],
                auto: true,
                group: 'contact'
            },
            contactFormModel: {
                module: 'contact/mvc/ContactFormModel',
                auto: true,
                properties: {
                    data: {
                        $ref: 'contactData'
                    },
                    permission: {
                        $ref: 'contactPermission'
                    }
                }
            },
            contactFormView: {
                module: 'contact/mvc/ContactFormView',
                auto: true
            },
            contactForm: {
                module: 'contact/mvc/ContactForm',
                properties: {
                    model: {
                        $ref: 'contactFormModel'
                    },
                    view: {
                        $ref: 'contactFormView'
                    }
                },
                args: ['contact'],
                auto: true,
                group: 'contact'
            }
        };
        ioc.addComponent(components);
    }
);
