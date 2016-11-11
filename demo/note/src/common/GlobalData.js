/**
 * DEMO
 *
 * @file 全局数据的数据管理类
 * @exports common.GlobalData
 * @author dddbear(dddbear@aliyun.com)
 */
define(
    function (require) {
        var u = require('./util');
        var Lazy = require('./Lazy');


        /**
         * 全局数据的数据管理类
         *
         * 在此类中，除了加载用户信息和系统信息外，还可包括与其它平台的帐户交互等，
         * 多个模块会共享的全局的数据处理均可在此模块中实现
         *
         * @class common.GlobalData
         * @extends ub-ria.mvc.RequestManager
         * @implements ssp-account.meta.GlobalData
         */
        var exports = {};

        /**
         * @constructs common.GlobalData
         */
        exports.constructor = function () {
            this.$super(arguments);

            this.user = new Lazy(u.bind(this.loadUser, this));
        };

        function setProperty(propertyName, propertyValue, target) {
            target[propertyName] = propertyValue;
            return propertyValue;
        }

        /**
         * 初始化权限
         *
         * @param {Object} user 用户信息
         * @return {Object} 用户信息
         * @inner
         */
        function initPermission(user) {
            var permission = require('er/permission');
            u.each(
                user.authorities,
                function (permissionName) {
                    var item = {};
                    item[permissionName] = true;
                    permission.add(item);
                }
            );
            return user;
        }

        /**
         * 加载用户信息
         *
         * @private
         * @return {er.meta.Promise}
         */
        exports.loadUser = function () {
            var loading = this.request(
                'global/user',
                null,
                {
                    method: 'GET',
                    url: '/users/current/userInfo'
                }
            );
            return loading.then(initPermission);
        };

        /**
         * 获取User数据
         *
         * @return {er.meta.Promise}
         */
        exports.getUser = function () {
            return this.user.value();
        };

        /**
         * 获取用户指定属性
         *
         * @param {string} propertyName 指定属性名称
         * @return {er.meta.Promise}
         */
        exports.getUserProperty = function (propertyName) {
            return this.getUser().thenGetProperty(propertyName);
        };

        /**
         * 设置用户属性，用于更新用户信息后同步
         *
         * @param {string} propertyName 指定属性名称
         * @param {*} value 属性值
         * @return {er.meta.Promise} 成功后返回更新后的值
         */
        exports.setUserProperty = function (propertyName, value) {
            return this.getUser().then(u.partial(setProperty, propertyName, value));
        };

        /**
         * 获取当前用户的列表每页条目数
         *
         * @return {er.meta.Promise}
         */
        exports.getPageSize = function () {
            return this.getUserProperty('pageSize');
        };

        /**
         * 更新当前用户的列表每页条目数
         *
         * @param {number} pageSize 每页条目数
         * @return {er.meta.Promise}
         */
        exports.updatePageSize = function (pageSize) {
            var updating = this.request(
                'global/pageSize',
                {pageSize: pageSize},
                {
                    method: 'PUT',
                    url: '/users/current/pageSize'
                }
            );

            return updating.then(u.bind(this.setUserProperty, this, 'pageSize', pageSize));
        };

        /**
         * 销毁
         *
         * @override
         */
        exports.dispose = function () {
            // 因为要单例控制，因此不销毁
        };

        var RequestManager = require('ub-ria/mvc/RequestManager');
        var GlobalData = require('eoo').create(RequestManager, exports);

        var requests = {
            updatePageSize: {
                name: 'global/pageSize',
                scope: 'global',
                policy: 'abort'
            },
            loadUser: {
                name: 'global/user',
                scope: 'global',
                policy: 'abort'
            }
        };

        u.each(
            requests,
            function (config) {
                var RequestManager = require('ub-ria/mvc/RequestManager');
                RequestManager.register(GlobalData, config.name, config);
            }
        );

        return GlobalData;
    }
);
