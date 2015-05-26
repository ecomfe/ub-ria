/**
 * DEMO
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file 系统入口脚本
 * @exports common.Main
 * @author otakustay(otakustay@gmail.com)
 */
define(
    function (require) {
        var u = require('./util');

        /**
         * 主入口
         *
         * @class common.Main
         */
        var exports = {};

        /**
         * 开始初始化用户常量，此时已经获取用户的全部信息
         *
         * @method common.Main#initializeUser
         * @return {er.meta.Promise}
         */
        exports.initializeUser = function () {
            var data = this.getGlobalData();
            return require('promise').all([data.getUser()]);
        };

        /**
         * 开始初始化系统其它部分，此时已经完成用户和系统常量初始化
         *
         * @method common.Main#initializeApplication
         */
        exports.initializeApplication = function () {
            /* eslint-disable */
            var startSystem = function (config, ria, permission) {
                config.indexURL = '/contact/list';
                ria.start();
            };

            // 启动系统所需要的模块，全部在`common/ioc`中配置
            var startupModules = [
                'erConfig', 'ria', 'systemPermission', 'systemConfig'
            ];
            require('./ioc').getComponent(startupModules, u.bind(startSystem, this));
        };

        /**
         * 登出
         *
         * @method common.Main#signOut
         */
        exports.signOut = function () {
            throw new Error('Failed to redirect to index');
        };

        /**
         * 开始系统执行
         *
         * @method common.Main#start
         */
        exports.start = function () {
            this.initializeUser()
                .thenBind(this.initializeApplication, this)
                .fail(u.bind(this.signOut, this));
        };

        var oo = require('eoo');

        oo.defineAccessor(exports, 'globalData');

        var Main = oo.create(exports);
        return Main;
    }
);
