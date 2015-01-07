/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 视图基类
 * @author otakustay
 * @date $DATE$
 */
define(
    function (require) {
        var u = require('../util');
        var util = require('er/util');
        var UIView = require('ef/UIView');

        /**
         * 视图基类
         *
         * @extends ef.UIView
         * @constructor
         */
        function BaseView() {
            UIView.apply(this, arguments);
        }

        util.inherits(BaseView, UIView);

        /**
         * 添加控件事件的配置
         *
         * @public
         * @param {Object} uiEvents 控件绑定的事件
         */
        BaseView.prototype.addUIEvents = function (uiEvents) {
            // 对传入的控件事件参数进行格式变换
            var extendedUIEvents = [uiEvents];
            u.each(
                uiEvents,
                function (events, key) {
                    // `uiEvents`对象支持两种方式的事件绑定
                    //
                    // { 'controlId:eventType': functionName }
                    // { 'controlId:eventType': [functionNameA, functionNameB] }
                    //
                    // 绑定的事件函数是数组类型时，组装为多个`uiEvents`对象形式传入
                    if (u.isArray(events)) {
                        while (events.length > 1) {
                            // 从`events`中拆出来的新`uiEvents`
                            var newUIEvents = {};
                            newUIEvents[key] = events.splice(-1)[0];
                            // 插入到`extendedUIEvents`中
                            extendedUIEvents.push(newUIEvents);
                        }

                        // 当数组只剩一个元素时，修正为具体的元素类型
                        if (events.length) {
                            uiEvents[key] = events.splice(-1)[0];
                        }
                    }
                }
            );

            var thisEvents = this.uiEvents;
            // `this.uiEvents`可能会以`null`/`Object`/`Array`三种类型出现
            // 这边统一为数组类型
            this.uiEvents = (thisEvents && [].concat(thisEvents)) || [];
            // 将`extendedUIEvents`拼接到`this.uiEvents`后面
            this.uiEvents = this.uiEvents.concat(extendedUIEvents);
        };

        /**
         * 获取控件事件配置的数组形式
         *
         * @private
         * @return {Array} 控件事件
         */
        BaseView.prototype.getUIEventsCollection = function () {
            var events = this.uiEvents;

            // 重写父类实现
            // 将`this.uiEvents`包装为数组返回
            return (events && [].concat(events)) || [];
        };

        /**
         * 绑定控件的事件
         *
         * @override
         * @protected
         */
        BaseView.prototype.bindEvents = function () {
            // 获取 直接重写`uiEvents` 及 调用`addUIEvents`接口 设置的控件事件
            u.each(
                this.getUIEventsCollection(),
                function (uiEvents) {
                    // 从`uiEvents`数组中依次取出事件对象重写`this.uiEvents`
                    this.uiEvents = uiEvents;
                    // 调用父类`bindEvents`方法完成控件的事件绑定
                    UIView.prototype.bindEvents.apply(this, arguments);
                },
                this
            );
        };

        /**
         * 添加控件的额外属性
         *
         * @public
         * @param {Object} newUIProperties 控件的额外属性
         */
        BaseView.prototype.addUIProperties = function (newUIProperties) {
            // `this.uiProperties`可能以`null`/`Object`两种类型出现
            // 统一为对象类型
            this.uiProperties = this.uiProperties || {};

            var uiProperties = this.uiProperties;
            u.each(
                newUIProperties,
                function (properties, controlId) {
                    // 子类设置的控件属性在父类设置中已有同名
                    if (uiProperties.hasOwnProperty(controlId)) {
                        // 新增属性，则扩展控件设置
                        // 已有属性，则重写对应属性值
                        u.extend(uiProperties[controlId], properties);
                    }
                    // 子类设置新控件的属性
                    else {
                        uiProperties[controlId] = properties;
                    }
                }
            );
        };

        /**
         * 获取控件的额外属性
         *
         * @override
         * @protected
         * @return {Object} 控件的额外属性
         */
        BaseView.prototype.getUIProperties = function () {
            // 重写父类实现
            // 获取 直接重写`uiProperties` 及 调用`addUIProperties`接口 设置的控件额外属性
            return this.uiProperties || {};
        };

        /**
         * 获取对应模板名称
         *
         * 当一个视图被作为子Action使用时，需要在其视图模板名后加上`"Main"`以进行区分，
         * 根据此设计，可以将视图切分为“完整页面”和“仅用于嵌套”两部分，根据约定命名
         *
         * @return {string}
         * @override
         */
        BaseView.prototype.getTemplateName = function () {
            var templateName =
                UIView.prototype.getTemplateName.apply(this, arguments);

            // 作为子Action嵌入页面时，模板使用`xxxMain`这个target
            if (this.model && this.model.get('isChildAction') && !this.model.get('isInDrawerPanel')) {
                templateName += 'Main';
            }

            return templateName;
        };

        /**
         * 等待用户确认
         *
         * 参数同`ef.UIView.prototype.confirm`，但返回一个`Promise`对象
         *
         * @return {er.Promise} 一个`Promise`对象，用户确认则进入`resolved`状态，
         * 用户取消则进入`rejected`状态
         */
        BaseView.prototype.waitConfirm = function () {
            var dialog = this.confirm.apply(this, arguments);
            var Deferred = require('er/Deferred');
            var deferred = new Deferred();

            dialog.on('ok', deferred.resolver.resolve);
            dialog.on('cancel', deferred.resolver.reject);

            return deferred.promise;
        };

        /**
         * 等待一个`DialogAction`加载完成
         *
         * @return {er.Promise} 一个`Promise`对象，
         * 对应的Action加载完成时进入`resolved`状态，
         * 如Action加载失败则进入`rejected`状态
         */
        BaseView.prototype.waitActionDialog = function () {
            var dialog = this.popActionDialog.apply(this, arguments);

            var Deferred = require('er/Deferred');
            var deferred = new Deferred();

            dialog.on('actionloaded', deferred.resolver.resolve);
            dialog.on('actionloadfail', deferred.resolver.reject);
            dialog.on('actionloadabort', deferred.resolver.reject);

            return deferred.promise;
        };

        return BaseView;
    }
);
