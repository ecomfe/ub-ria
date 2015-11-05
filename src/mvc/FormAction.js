/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 表单Action基类
 * @author otakustay
 */
define(
    function (require) {
        var u = require('../util');
        var Promise = require('promise');

        /**
         * 表单Action基类
         *
         * @class mvc.FormAction
         * @extends mvc.BaseAction
         */
        var exports = {};

        /**
         * 当前页面的分类，始终为`"form"`
         *
         * @member mvc.FormAction#category
         * @type {string}
         * @readonly
         * @override
         */
        exports.category = 'form';

        /**
         * 处理提交数据时发生的错误，默认无行为，如验证信息显示等需要实现此方法
         *
         * @protected
         * @method mvc.FormAction#handleSubmitError
         * @param {er.meta.FakeXHR | meta.FieldError[]} errors `XMLHttpRequest`对象，或者model校验的错误结果集
         * @return {boolean} 返回`true`表示错误已经处理完毕
         */
        exports.handleSubmitError = function (errors) {
            // 处理409的验证失败
            if (errors.status === 409) {
                errors = require('er/util').parseJSON(errors.responseText);
            }
            // 处理全局错误
            if (errors.message) {
                this.view.notifyGlobalError(errors.message);
            }
            // 处理model校验产生的错误信息，或者后端校验返回的错误信息
            if (errors.fields) {
                this.view.notifyErrors(errors);
            }

            return errors.message || errors.fields;
        };

        /**
         * 处理提交数据成功后的返回，流程如下：
         *
         * - 触发`entitysave`
         * - 若`entitysave`未被阻止，调用`submitHanlder`
         * - 触发`handlefinish`
         *
         * @protected
         * @method mvc.FormAction#handleSubmitResult
         * @param {Object} entity 提交成功后返回的实体
         * @fires mvc.FormAction#handlefinish
         */
        exports.handleSubmitResult = function (entity) {
            var entitySaveEvent = this.fire('entitysave', {entity: entity});
            if (!entitySaveEvent.isDefaultPrevented()) {
                var submitHandler = this.getSubmitHandler();
                if (submitHandler) {
                    submitHandler.handle(entity, this);
                }
            }
            this.fire('handlefinish');
        };

        /**
         * 获取处理组件
         *
         * @protected
         * @method mvc.FormAction#getSubmitHandler
         * @return {mvc.handler.SubmitHandler}
         */
        exports.getSubmitHandler = function () {
            return this.submitHandler;
        };

        /**
         * 设置处理组件
         * 可选。默认值为空。
         *
         * @protected
         * @method mvc.FormAction#setSubmitHandler
         * @param {mvc.handler.SubmitHandler} handler 提交成功处理组件
         */
        exports.setSubmitHandler = function (handler) {
            this.submitHandler = handler;
        };

        /**
         * 处理提交错误
         *
         * @param {er.meta.FakeXHR | meta.FieldError[]} errors `XMLHttpRequest`对象，或者model校验的错误信息集
         */
        function handleError(errors) {
            var handled = this.handleSubmitError(errors);
            if (!handled) {
                require('er/events').notifyError(errors.responseText);
            }
        }

        /**
         * 根据FormType获取Model提交接口的方法名
         *
         * @protected
         * @method mvc.FormAction#getSubmitMethod
         * @param {string} formType 表单类型
         * @return {string}
         */
        exports.getSubmitMethod = function (formType) {
            var methodMap = {
                create: 'save',
                update: 'update',
                copy: 'save'
            };

            return methodMap[formType] || null;
        };

        /**
         * 提交实体（新建或更新）
         *
         * @protected
         * @method mvc.FormAction#submitEntity
         * @param {Object} entity 实体数据
         * @return {Promise}
         */
        exports.submitEntity = function (entity) {
            var method = this.getSubmitMethod(this.context.formType);

            try {
                if (method) {
                    return this.model[method](entity)
                        .then(u.bind(this.handleSubmitResult, this))
                        .fail(u.bind(handleError, this));
                }

                throw new Error('Cannot find formType in methodMap');

            }
            catch (ex) {
                return Promise.reject(ex);
            }
        };

        /**
         * 设置取消编辑时的提示信息标题
         *
         * @protected
         * @member mvc.FormAction#cancelConfirmTitle
         * @type {string}
         */
        exports.cancelConfirmTitle = '确认取消编辑';

        /**
         * 获取取消编辑时的提示信息标题
         *
         * @protected
         * @method mvc.FormAction#getCancelConfirmTitle
         * @return {string}
         */
        exports.getCancelConfirmTitle = function () {
            var formType = this.model.get('formType');
            if (formType === 'create') {
                return '新建';
            }

            return '编辑';
        };

        /**
         * 设置取消编辑时的提示信息内容
         *
         * @protected
         * @member mvc.FormAction#cancelConfirmMessage
         * @type {string}
         */
        exports.cancelConfirmMessage = '取消编辑将不保留已经填写的数据，确定继续吗？';

        /**
         * 获取取消编辑时的提示信息内容
         *
         * @protected
         * @method mvc.FormAction#getCancelConfirmMessage
         * @return {string}
         */
        exports.getCancelConfirmMessage = function () {
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
         *
         * @protected
         * @method mvc.FormAction#cancelEdit
         */
        exports.cancelEdit = function () {
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
         *
         * @protected
         * @method mvc.FormAction#redirectAfterCancel
         */
        exports.redirectAfterCancel = function () {
            // 默认返回列表页
            this.back('/' + this.getEntityName() + '/list');
        };

        /**
         * 判断表单信息是否被更改，默认返回false
         *
         * @protected
         * @method mvc.FormAction#isFormDataChanged
         * @param {Object} initialFormData 进入页面时的表单初始数据
         * @return {boolean}
         */
        exports.isFormDataChanged = function (initialFormData) {
            return true;
        };

        /**
         * 设置修改提交时的提示信息内容
         *
         * @protected
         * @member mvc.FormAction#submitConfirmMessage
         * @type {string}
         */
        exports.submitConfirmMessage = '确认提交修改？';

        /**
         * 获取修改提交时的提示信息内容
         *
         * @protected
         * @method mvc.FormAction#getUpdateConfirmMessage
         * @return {string}
         */
        exports.getSubmitConfirmMessage = function () {
            return this.submitConfirmMessage;
        };

        function submit() {
            this.view.clearGlobalError();
            var entity = this.view.getEntity();

            var options = {
                content: this.getSubmitConfirmMessage()
            };

            this.view.waitSubmitConfirm(options)
                .then(u.bind(this.view.disableSubmit, this.view))
                .then(u.bind(this.submitEntity, this, entity))
                .ensure(u.bind(this.view.enableSubmit, this.view));
        }

        /**
         * @override
         */
        exports.initBehavior = function () {
            this.$super(arguments);

            // 保存一份最初的form表单内容到model，用于判断表单内容是否被更改
            var initialFormData = this.view.getFormData();
            this.model.set('initialFormData', initialFormData, {silent: true});

            this.view.on('submit', submit, this);
            this.view.on('cancel', this.cancelEdit, this);
        };

        /**
         * 判断表单是否作为其它表单的子表单存在
         *
         * @method mvc.FormAction#isChildForm
         * @return {boolean}
         */
        exports.isChildForm = function () {
            // 如果表单进入时带来returnUrl参数，则认为该表单为一个ChildForm
            return !!this.model.get('returnUrl');
        };

        var BaseAction = require('./BaseAction');
        var FormAction = require('eoo').create(BaseAction, exports);

        return FormAction;
    }
);
