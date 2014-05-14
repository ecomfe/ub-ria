/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file Action工厂
 * @author otakustay
 */
define(
    function (require) {
        var u = require('underscore');
        var util = require('../util');
        var Deferred = require('er/Deferred');

        /**
         * Action工厂类，用于创建一个预先完成组装的`Action`实例
         *
         * @constructor
         * @param {string} actionModuleName `Action`类的模块名
         * @param {Object} extraDataModules 该模块的`Model`需要的额外（非自身模块）的`Data`类配置，
         * 对象的键名为`Data`实例的名称，值为`Data`类对应的模拟名
         */
        function ActionFactory(actionModuleName, extraDataModules) {
            if (!actionModuleName) {
                throw new Error('No action module name');
            }

            this.actionModuleName = actionModuleName;
            this.extraDataModules = extraDataModules || {};
        }

        /**
         * 创建运行时`Action`实例
         */
        ActionFactory.prototype.createRuntimeAction = function () {
            // 比如Action模块名是`foo/List`，那基础模块名就是`foo`，只要把最后的`/`连琏之后的全部去掉就行
            var actionModuleName = this.actionModuleName;
            var baseModuleName = actionModuleName.replace(/\/[^\/]*$/, '');

            // 根据模块命名规则来加载各种东西
            var modules = [
                actionModuleName, // Action
                actionModuleName + 'Model', // Model
                actionModuleName + 'View', // View
                baseModuleName + '/Data' // Data
            ];
            modules.push.apply(modules, u.values(this.extraDataModules));

            var extraDataNames = u.keys(this.extraDataModules);

            var injectCommonProperties = function (Action, Model, View, Data) {
                var action = new Action();
                action.model = new Model();
                action.model.setData(new Data());
                // 从第4个参数开始都是额外的`Data`，根据名称来加到`model`上
                for (var i = 3; i < arguments.length; i++) {
                    var dataSetterMethodName = 'set' + util.pascalize(extraDataNames[i - 3]) + 'Data';
                    if (typeof action.model[dataSetterMethodName] !== 'function') {
                        throw new Error(
                            'ActionFactory cannot invoke "' + dataSetterMethodName + '" '
                            + 'method on ' + actionModuleName + 'Model'
                        );
                    }
                    action.model[dataSetterMethodName](arguments[i]);
                }
                action.view = new View();

                return action;
            };

            return Deferred.require(modules).then(injectCommonProperties).then(buildAction);
        };

        /**
         * 进一步组建`Action`实例
         *
         * @param {er.Action} action 一个已经完成初步构建的`Action`实例，其中的`model`、`view`以及`model`上的`data`属性均已经注入
         * @return {er.Action | er.meta.Promise}
         */
        ActionFactory.prototype.buildAction = function (action) {
            return action;
        };

        return ActionFactory;
    }
);
