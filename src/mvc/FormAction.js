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
         * 处理提交数据时发生的错误，默认无行为，如验证信息显示等需要实现此方法
         *
         * @param {er.meta.FakeXHR | meta.FieldError[]}，
         * errors `XMLHttpRequest`对象，或者model校验的错误结果集
         * @return {boolean} 返回`true`表示错误已经处理完毕
         */
        FormAction.prototype.handleSubmitError = function (errors) {
            // 处理409的验证失败
            if (errors.status === 409) {
                errors = util.parseJSON(errors.responseText);
            }
            // 处理model校验产生的错误信息，或者后端校验返回的错误信息
            if (errors.fields) {
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
            this.notifySubmitSuccess(entity);

            // 默认成功后跳转回列表页
            var entitySaveEvent = this.fire('entitysave', { entity: entity });
            var handleFinishEvent = this.fire('handlefinish');
            if (!entitySaveEvent.isDefaultPrevented()
                && !handleFinishEvent.isDefaultPrevented()
            ) {
                this.redirectAfterSubmit(entity);
            }
        };

        /**
         * 提示用户表单提交成功
         *
         * @param {Object} entity 提交成功后返回的实体
         */
        FormAction.prototype.notifySubmitSuccess = function (entity) {
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
         * @param {er.FakeXHR | meta.FieldError[]}，
         * errors `XMLHttpRequest`对象，或者model校验的错误信息集
         * @ignore
         */
        function handleError(errors) {
            var handled = this.handleSubmitError(errors);
            if (!handled) {
                require('er/events').notifyError(errors.responseText);
            }
        }

        /**
         * 提交实体（新建或更新）
         *
         * @param {Object} entity 实体数据
         * @param {er.Promise}
         */
        FormAction.prototype.submitEntity = function (entity) {
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
            // 从model中拿出表单最初数据，判断是否被更改
            var initialFormData = this.model.get('initialFormData');

            if (this.isFormDataChanged(initialFormData)) {
                var options = {
                    title: this.getCancelConfirmTitle(),
                    content: this.getCancelConfirmMessage()
                };
                this.view.waitCancelConfirm(options)
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

        /**
         * 判断表单信息是否被更改，默认返回false

         * @param {Object} initialFormData model中保存的表单初始数据
         * @return {Boolean}
         */
        FormAction.prototype.isFormDataChanged = function (initialFormData) {
            return false;
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
            // 保存一份最初的form表单内容到model，用于判断表单内容是否被更改
            var initialFormData = this.view.getFormData();
            this.model.set('initialFormData', initialFormData, { silent: true });

            this.view.on('submit', submit, this);
            this.view.on('cancel', this.cancelEdit, this);
        };

        return FormAction;
    }
);
