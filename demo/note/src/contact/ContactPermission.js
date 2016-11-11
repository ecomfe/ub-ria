/**
 * DEMO
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 权限声明
 * @exports contact.ContactPermission
 * @author dddbear(dddbear@aliyun.com)
 */
define(
    function (require) {
        /**
         * @class contact.ContactPermission
         */
        var exports = {};

        /**
         * 是否可创建
         *
         * @public
         * @method contact.ContactPermission#canCreate
         * @return {boolean}
         */
        exports.canCreate = function () {
            return this.getSystemPermission().isAllow('CONTACT_NEW');
        };

        /**
         * 是否可批量修改通讯录权限
         *
         *
         * @public
         * @method contact.ContactPermission#canBatchModifyAuth
         * @return {boolean}
         */
        exports.canBatchModify = function () {
            return this.getSystemPermission().isAllow('CONTACT_AUTH_MODIFY');
        };

        var eoo = require('eoo');

        eoo.defineAccessor(exports, 'systemPermission');

        return eoo.create(exports);
    }
);
