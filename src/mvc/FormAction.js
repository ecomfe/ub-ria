/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 表单Action基类
 * @author otakustay
 * @date $DATE$
 */
define(
    function (require) {
        var util = require('er/util');
        var u = require('underscore');
        var Deferred = require('er/Deferred');
        var BaseAction = require('./BaseAction');

        /**
         * 表单Action基类
         *
         * @param {string} [entityName] 负责的实体名称
         * @extends BaseAction
         * @constructor
         */
        function FormAction(entityName) {
            BaseAction.apply(this, arguments);
        }

        util.inherits(FormAction, BaseAction);

        FormAction.prototype.modelType = require('./FormModel');

        /**
         * 当前页面的分类，始终为`"form"`
         *
         * @type {string}
         * @readonly
         * @override
         */
        FormAction.prototype.category = 'form';

        /**
         * 设置表单提交成功后显示的信息，如果值为`null`或`undefined`则表示不显示任何信息
         *
         * 如果该字段有内容，则系统使用该字段与提交表单后服务器返回的数据进行模板格式化，
         * 因此可以使用服务器返回的字段为占位符。模板使用`underscore.template`方法
         *
         * @type {string | false | null}
         */
        FormAction.prototype.toastMessage = '';

        /**
         * 获取表单提交成功后显示的信息
         *
         * 默认提示信息为“您[创建|修改]的{实体名称}{name}已经成功保存”
         *
         * @param {Object} entity 提交后服务器端返回的实体信息
         * @return {string}
         */
        FormAction.prototype.getToastMessage = function (entity) {
            var message = this.toastMessage;
            if (message == null) {
                return '';
            }

            if (message) {
                return u.template(message, entity || {});
            }
            else {
                var actionType = this.context.formType === 'update'
                    ? '修改'
                    : '创建';
                return '您' + actionType + '的'
                    + this.getEntityDescription()
                    + '[<strong>' + u.escape(entity.name) + '</strong>]'
                    + '已经成功保存';
            }
        };

        /**
         * 处理提交数据时发生的错误，默认无行为，如验证信息显示等需要实现此方法
         *
         * @param {er.meta.FakeXHR} xhr `XMLHttpRequest`对象
         * @return {boolean} 返回`true`表示错误已经处理完毕
         */
        FormAction.prototype.handleSubmitError = function (xhr) {
            // 默认只处理409的验证失败，其它错误如果子类能处理则重写这个函数
            if (xhr.status === 409) {
                var errors = util.parseJSON(xhr.responseText);
                this.view.notifyErrors(errors);
                return true;
            }
            return false;

        };

        /**
         * 处理提交数据成功后的返回
         *
         * @param {Object} entity 提交成功后返回的实体
         */
        FormAction.prototype.handleSubmitResult = function (entity) {
            // 默认成功后跳转回列表页
            var toast = this.getToastMessage(entity);
            if (toast) {
                this.view.showToast(toast);
            }

            var entitySaveEvent = this.fire('entitysave', { entity: entity });
            var handleFinishEvent = this.fire('handlefinish');
            if (!entitySaveEvent.isDefaultPrevented()
                && !handleFinishEvent.isDefaultPrevented()
            ) {
                this.redirectAfterSubmit(entity);
            }
        };

        /**
         * 执行提交成功后的跳转操作
         *
         * @param {Mixed} entity 提交后服务器返回的实体数据
         */
        FormAction.prototype.redirectAfterSubmit = function (entity) {
            // 默认返回列表页
            this.back('/' + this.getEntityName() + '/list');
        };

        /**
         * 处理提交错误
         *
         * @param {er.FakeXHR} xhr `XMLHttpRequest`对象
         * @ignore
         */
        function handleError(xhr) {
            var handled = this.handleSubmitError(xhr);
            if (!handled) {
                require('er/events').notifyError(xhr.responseText);
            }
        }

        /**
         * 处理本地的验证错误
         *
         * @param {meta.FieldError[]} errors 本地验证得到的错误集合
         * @return {Mixed} 处理完后的返回值，返回对象的情况下将显示错误，
         * 其它情况认为没有本地的验证错误，将进入正常的提交流程
         */
        FormAction.prototype.handleLocalValidationErrors = function (errors) {
            var wrappedError = {
                fields: errors
            };
            this.view.notifyErrors(wrappedError);

            return wrappedError;
        };

        /**
         * 提交实体（新建或更新）
         *
         * @param {Object} entity 实体数据
         * @param {er.Promise}
         */
        FormAction.prototype.submitEntity = function (entity) {
            entity = this.model.fillEntity(entity);
            
            var localValidationResult = this.model.validateEntity(entity);
            if (typeof localValidationResult === 'object') {
                var handleResult =
                    this.handleLocalValidationErrors(localValidationResult);
                return Deferred.rejected(handleResult);
            }

            var method = this.context.formType === 'update' ? 'update' : 'save';
            try {
                return this.model[method](entity)
                    .then(
                        u.bind(this.handleSubmitResult, this),
                        u.bind(handleError, this)
                    );
            }
            catch (ex) {
                return Deferred.rejected(ex);
            }
        };

        /**
         * 设置取消编辑时的提示信息标题
         *
         * @type {string}
         */
        FormAction.prototype.cancelConfirmTitle = '确认取消编辑';

        /**
         * 获取取消编辑时的提示信息标题
         *
         * @return {string}
         */
        FormAction.prototype.getCancelConfirmTitle = function () {
            return this.cancelConfirmTitle;
        };

        /**
         * 设置取消编辑时的提示信息内容
         *
         * @type {string}
         */
        FormAction.prototype.cancelConfirmMessage =
            '取消编辑将不保留已经填写的数据，确定继续吗？';

        /**
         * 获取取消编辑时的提示信息内容
         *
         * @return {string}
         */
        FormAction.prototype.getCancelConfirmMessage = function () {
            return this.cancelConfirmMessage;
        };

        function cancel() {
            var submitCancelEvent = this.fire('submitcancel');
            var handleFinishEvent = this.fire('handlefinish');
            if (!submitCancelEvent.isDefaultPrevented()
                && !handleFinishEvent.isDefaultPrevented()
            ) {
                this.redirectAfterCancel();
            }
        }

        /**
         * 取消编辑
         */
        FormAction.prototype.cancelEdit = function () {
            var entity = this.view.getEntity();
            entity = this.model.fillEntity(entity);

            if (this.model.isEntityChanged(entity)) {
                var options = {
                    title: this.getCancelConfirmTitle(),
                    content: this.getCancelConfirmMessage()
                };
                this.view.waitConfirm(options)
                    .then(u.bind(cancel, this));
            }
            else {
                cancel.call(this);
            }
        };

        /**
         * 在取消编辑后重定向
         */
        FormAction.prototype.redirectAfterCancel = function () {
            // 默认返回列表页
            this.back('/' + this.getEntityName() + '/list');
        };

        function submit() {
            var entity = this.view.getEntity();
            this.view.disableSubmit();

            require('er/Deferred').when(this.submitEntity(entity))
                .ensure(u.bind(this.view.enableSubmit, this.view));
        }

        /**
         * 初始化交互行为
         *
         * @protected
         * @override
         */
        FormAction.prototype.initBehavior = function () {
            BaseAction.prototype.initBehavior.apply(this, arguments);
            this.view.on('submit', submit, this);
            this.view.on('cancel', this.cancelEdit, this);
        };
        
        return FormAction;
    }
);
