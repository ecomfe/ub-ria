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
        var util = require('er/util');
        var u = require('underscore');
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
         * 显示toast提示信息，这个方法会控制一个单例，以免信息叠在一起
         *
         * @parma {string} content 显示的内容
         * @param {Object} [options] 配置
         * @return {esui.Toast}
         */
        BaseView.prototype.showToast = function (content, options) {
            var properties = {
                content: content,
                disposeOnHide: true,
                autoShow: true,
                duration: 3000
            };

            u.extend(properties, options);

            var toast = require('esui').create('Toast', properties);
            toast.show();
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
