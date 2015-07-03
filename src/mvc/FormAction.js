/**
 * UB RIA Base
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 表单Action基类
 * @author otakustay
 */

import oo from 'eoo';
import event from 'mini-event';
import {viewEvent} from './decorator';
import BaseAction from './BaseAction';

/**
 * 表单Action基类
 *
 * @class mvc.FormAction
 * @extends mvc.BaseAction
 */
export default class FormAction extends BaseAction {
    category = 'form';

    /**
     * 提交时的确认信息
     *
     * @protected
     * @member mvc.FormAction#submitConfirmMessage
     * @type {string}
     */
    get submitConfirmMessage() {
        return '确认提交修改？';
    }

    /**
     * 取消提交时的确认标题
     *
     * @protected
     * @member mvc.FormAction#cancelConfirmTitle
     * @type {string}
     */
    get cancelConfirmTitle() {
        // IoC会来访问一次，此时没有`model`，在IoC支持判断getter以前得有这个Hasck
        // TODO: IoC支持判断getter后移除
        var formType = this.model ? this.model.get('formType') : 'create';
        if (formType === 'create') {
            return '新建';
        }

        return '编辑';
    }

    /**
     * 取消提交时的确认信息
     *
     * @protected
     * @member mvc.FormAction#cancelConfirmMessage
     * @type {string}
     */
    get cancelConfirmMessage() {
        return '取消编辑将不保留已经填写的数据，确定继续吗？';
    }

    /**
     * 处理提交数据时发生的错误，默认无行为，如验证信息显示等需要实现此方法
     *
     * @protected
     * @method mvc.FormAction#handleSubmitError
     * @param {Object} errors 错误对象
     * @return {boolean} 返回`true`表示错误已经处理完毕
     */
    handleSubmitError(errors) {
        if (errors.errorType === 'validationConflict') {
            return this.handleValidationConflict(errors);
        }

        return false;
    }

    /**
     * 处理验证字段冲突
     *
     * @protected
     * @param {meta.ValidationConflict} errors 错误对象
     * @return {boolean} 返回`true`表示错误已经处理完毕
     */
    handleValidationConflict(errors) {
        // 处理全局错误
        if (errors.message) {
            this.view.notifyGlobalError(errors.message);
        }
        // 处理model校验产生的错误信息，或者后端校验返回的错误信息
        if (errors.fields) {
            this.view.notifyErrors(errors);
        }

        return true;
    }

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
    handleSubmitResult(entity) {
        let entitySaveEvent = this.fire('entitysave', {entity});
        if (!entitySaveEvent.isDefaultPrevented()) {
            let submitHandler = this.getSubmitHandler();
            if (submitHandler) {
                submitHandler.handle(entity, this);
            }
        }
        this.fire('handlefinish');
    }

    /**
     * 根据FormType获取Model提交接口的方法名
     *
     * @protected
     * @method mvc.FormAction#getSubmitMethod
     * @param {string} formType 表单类型
     * @return {string}
     */
    getSubmitMethod(formType) {
        let methodMap = {
            create: 'save',
            update: 'update',
            copy: 'save'
        };

        return methodMap[formType] || null;
    }

    /**
     * 提交实体（新建或更新）
     *
     * @protected
     * @method mvc.FormAction#submitEntity
     * @param {Object} entity 实体数据
     * @return {Promise} 所有流程完成后进入`resolved`状态，提交出错时进入`rejected`状态
     */
    async submitEntity(entity) {
        let method = this.getSubmitMethod(this.context.formType);
        if (method) {
            try {
                let submitResult = await this.model[method](entity);
                this.handleSubmitResult(submitResult);
            }
            catch (errors) {
                let handled = this.handleSubmitError(errors);
                if (!handled) {
                    this.getEventBus().fire('error', {error: errors});
                }
            }
        }
        else {
            throw new Error('Cannot find formType in methodMap');
        }
    }

    /**
     * 取消编辑
     *
     * @protected
     * @method mvc.FormAction#cancelEdit
     * @return {Promise} 所有流程完成后进入`resolved`状态
     */
    async cancelEdit() {
        // 从model中拿出表单最初数据，判断是否被更改
        let initialFormData = this.model.get('initialFormData');

        if (this.isFormDataChanged(initialFormData)) {
            let options = {
                title: this.cancelConfirmTitle,
                content: this.cancelConfirmMessage
            };
            await this.view.waitCancelConfirm(options);
        }

        let events = [this.fire('submitcancel'), this.fire('handlefinish')];

        if (!events.some((e) => e.isDefaultPrevented())) {
            this.redirectAfterCancel();
        }
    }

    /**
     * 在取消编辑后重定向
     *
     * @protected
     * @method mvc.FormAction#redirectAfterCancel
     */
    redirectAfterCancel() {
        // 默认返回列表页
        this.back(`/${this.entityName}/list`);
    }

    /**
     * 判断表单信息是否被更改，默认返回false
     *
     * @protected
     * @method mvc.FormAction#isFormDataChanged
     * @param {Object} initialFormData 进入页面时的表单初始数据
     * @return {boolean}
     */
    isFormDataChanged(initialFormData) {
        return true;
    }

    /**
     * @override
     */
    initBehavior() {
        super.initBehavior();

        // 保存一份最初的form表单内容到model，用于判断表单内容是否被更改
        let initialFormData = this.view.getFormData();
        this.model.set('initialFormData', initialFormData, {silent: true});

        // 将保留数据并退出的事件代理到上层Action
        event.delegate(this.view, this, 'saveandclose');
    }

    /**
     * 判断表单是否作为其它表单的子表单存在
     *
     * @method mvc.FormAction#isChildForm
     * @return {boolean}
     */
    isChildForm() {
        // 如果表单进入时带来returnUrl参数，则认为该表单为一个ChildForm
        return this.model.hasValue('returnUrl') || this.model.hasValue('returnURL');
    }

    @viewEvent('submit');
    async [Symbol()]() {
        this.view.clearGlobalError();
        let entity = this.view.getEntity();

        let options = {content: this.submitConfirmMessage};
        await this.view.waitSubmitConfirm(options);
        this.view.disableSubmit();
        try {
            await this.submitEntity(entity);
        }
        catch (ex) {
            this.view.enableSubmit();
            throw ex;
        }
    }

    @viewEvent('cancel');
    [Symbol()]() {
        this.cancelEdit();
    }
}

/**
 * 获取处理组件
 *
 * @protected
 * @method mvc.FormAction#getSubmitHandler
 * @return {mvc.handler.SubmitHandler}
 */

/**
 * 设置处理组件
 *
 * 可选，一般由IoC统一配置
 *
 * @protected
 * @method mvc.FormAction#setSubmitHandler
 * @param {mvc.handler.SubmitHandler} handler 提交成功处理组件
 */
oo.defineAccessor(FormAction.prototype, 'submitHandler');
