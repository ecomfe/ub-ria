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
        var u = require('underscore');
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
            if (!this.extraUIEvents) {
                this.extraUIEvents = [];
            }

            this.extraUIEvents.push(uiEvents);
        };

        /**
         * 获取控件事件的配置
         *
         * @private
         * @return {Array} 控件事件
         */
        BaseView.prototype.getExtraUIEvents = function () {
            return this.extraUIEvents || [];
        };

        /**
         * 绑定控件的事件
         *
         * @protected
         * @override
         */
        BaseView.prototype.bindEvents = function () {
            // 先执行父类方法对直接设置`uiEvents`的控件事件进行绑定
            UIView.prototype.bindEvents.apply(this, arguments);

            // 再获取通过`addUIEvents`接口传入的控件事件进行绑定
            u.each(
                this.getExtraUIEvents(),
                function (extraUIEvents) {
                    // 从`extraUIEvents`数组中依次取出事件对象重写`this.uiEvents`
                    this.uiEvents = extraUIEvents;
                    // 重新进行控件的事件绑定
                    UIView.prototype.bindEvents.apply(this, arguments);
                },
                this
            );
        };

        /**
         * 添加控件的额外属性
         *
         * @public
         * @param {Object} uiProperties 控件的额外属性
         */
        BaseView.prototype.addUIProperties = function (uiProperties) {
            if (!this.extraUIProperties) {
                this.extraUIProperties = [];
            }

            this.extraUIProperties.push(uiProperties);
        };

        /**
         * 获取控件的额外属性
         *
         * @private
         * @return {Array} 控件的额外属性
         */
        BaseView.prototype.getExtraUIProperties = function () {
            return this.extraUIProperties || [];
        };

        /**
         * 获取控件的额外属性
         *
         * @protected
         * @override
         * @return {Object} 控件的额外属性
         */
        BaseView.prototype.getUIProperties = function () {
            // 先执行父类方法获取直接设置的`uiProperties`控件属性
            var uiProperties = UIView.prototype.getUIProperties.apply(this, arguments) || {};

            // 再在控件属性上拓展通过`addUIProperties`接口传入的额外的控件属性
            u.each(
                this.getExtraUIProperties(),
                function (extraUIProperties) {
                    u.extend(uiProperties, extraUIProperties);
                }
            );

            return uiProperties;
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
            if (this.model && this.model.get('isChildAction')) {
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
