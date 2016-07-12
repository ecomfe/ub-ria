/**
 * UB RIA Base
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 表单视图基类
 * @author otakustay
 */

import u from '../../util';
import {defaults} from 'diffy-update';
import BaseView from '../common/BaseView';
import Validity from 'esui/validator/Validity';
import ValidityState from 'esui/validator/ValidityState';
import Warn from '../../ui/warn/Warn';
import {bindControlEvent as on, control} from '../decorator';


/**
 * 表单视图基类
 *
 * 使用表单视图，有以下要求：
 *
 * - 有id为`form`的`Form`控件
 * - 所有触发提交的按钮，会触发`form`的`submit`事件
 *
 * 可选：
 *
 * - 可以有一个id为`cancel`的按钮，点击后会触发`cancel`事件
 *
 * @class mvc.FormView
 * @extends mvc.BaseView
 */
export default class FormView extends BaseView {
    @control()
    get form() {}

    @control()
    get submitSection() {}

    @control('form-page')
    get formViewContainer() {}

    @control('form-content-main')
    get formContent() {}

    /**
     * 从表单中获取实体数据
     *
     * @method mvc.FormView#getEntity
     * @return {Object}
     */
    getEntity() {
        let formData = this.getFormData();

        return this.requireStructuredEntity ? u.transformPlainObjectToStructured(formData) : formData;
    }

    /**
     * 获取表单数据，此方法通常获取未经处理的原始表单视图数据
     *
     * @protected
     * @method mvc.FormView#getFormData
     * @return {Object}
     */
    getFormData() {
        let form = this.form;
        return form ? form.getData() : {};
    }

    /**
     * 向用户通知提交错误信息，默认根据`field`字段查找对应`name`的控件并显示错误信息
     *
     * @method mvc.FormView#notifyErrors
     * @param {Object} errors 错误信息
     * @param {meta.FieldError[]} errors.fields 出现错误的字段集合
     */
    notifyErrors(errors) {
        let inputs = u.indexBy(this.form.getInputControls(), input => input.get('name'));

        errors.fields.forEach(fail => this.notifyFieldError(fail, inputs));
    }

    /**
     * 显示单个表单项的错误提示
     *
     * @protected
     * @param {string} field 表单项名称
     * @param {string} message 错误信息
     * @param {Object} [inputs] 输入控件索引，可选用于加速查询
     */
    notifyFieldError({field, message}, inputs) {
        inputs = inputs || u.indexBy(this.form.getInputControls(), input => input.get('name'));

        let state = new ValidityState(false, message);
        let validity = new Validity();
        validity.addState('server', state);

        let possibleValidityLabel = this.get(u.dasherize(field) + '-validity');
        if (possibleValidityLabel) {
            possibleValidityLabel.set('validity', validity);
            return;
        }

        let findPossibleInputControl = path => {
            // 'x.y.z'变为['x.y.z', 'x.y', 'x']
            let possiblePaths = path.split('.').reduce(
                (possibilities, currentNode) => {
                    let prefix = possibilities[0] ? possibilities[0] + '.' : '';
                    possibilities.unshift(prefix + currentNode);
                    return possibilities;
                },
                []
            );
            let actualName = possiblePaths.find(name => inputs.hasOwnProperty(name));
            return actualName ? inputs[actualName] : null;
        };
        let input = findPossibleInputControl(field);
        if (input && typeof input.showValidity === 'function') {
            input.showValidity(validity);
            return;
        }
    }

    /**
     * 显示全局错误
     *
     * @method mvc.FormView#notifyGlobalError
     * @param {string} error 错误信息
     */
    notifyGlobalError(error) {
        let state = new ValidityState(false, error);
        let validity = new Validity();
        validity.addState('server', state);

        let validateLabel = this.getSafely('global-error');
        validateLabel.set('validity', validity);
    }

    /**
     * 清除全局错误
     *
     * @method mvc.FormView#notifyGlobalError
     */
    clearGlobalError() {
        let validity = new Validity();
        let validateLabel = this.getSafely('global-error');
        validateLabel.set('validity', validity);
    }

    /**
     * 等待用户取消确认
     *
     * @protected
     * @method mvc.FormView#waitCancelConfirm
     * @param {Object} options 配置项
     * @return {er.Promise} 一个`Promise`对象，用户确认则进入`resolved`状态，用户取消则进入`rejected`状态
     */
    waitCancelConfirm(options) {
        let confirmOptions = defaults(
            options,
            null,
            {
                okLabel: `取消${options.title}`,
                cancelLabel: `继续${options.title}`
            }
        );
        return this.waitFormConfirm(confirmOptions);
    }

    /**
     * 提交时处理函数
     *
     * @method mvc.FormView#waitSubmitConfirm
     * @param {Object} options 配置项
     * @return {er.Promise} 一个`Promise`对象，默认进入`resolved`状态。
     */
    async waitSubmitConfirm(options) {
    }

    /**
     * 等待用户确认操作
     *
     * @method mvc.FormView#waitFormConfirm
     * @param {Object} options 配置项
     * @return {er.Promise} 一个`Promise`对象，用户确认则进入`resolved`状态，用户取消则进入`rejected`状态
     */
    waitFormConfirm(options) {
        // 加viewContext
        let warnOptions = defaults(options, null, {viewContext: this.viewContext});

        let extendedOptions = {
            wrapper: this.submitSection,
            id: 'form-confirm'
        };
        u.extend(warnOptions, extendedOptions);

        let warn = Warn.show(warnOptions);

        // 容器的状态要变一下
        this.formViewContainer.addState('warned');

        // 点击表单编辑区也会关闭
        this.formContent.on(
            'command',
            e => {
                if (e.name === 'form-content-click') {
                    warn.hide();
                }
            }
        );

        let executor = (resolve, reject) => {
            warn.on('ok', resolve);
            warn.on('ok', () => this.formViewContainer.removeState('warned'));
            warn.on('cancel', () => this.formViewContainer.removeState('warned'));
            warn.on('hide', () => this.formViewContainer.removeState('warned'));
            warn.on('ok', ::warn.hide);
            warn.on('cancel', ::warn.hide);
        };

        return new Promise(executor);
    }

    /**
     * 禁用提交操作
     *
     * @protected
     * @method mvc.FormView#disableSubmit
     */
    disableSubmit() {
        if (this.viewContext) {
            this.getGroup('submit').disable();
        }
    }

    /**
     * 启用提交操作
     *
     * @protected
     * @method mvc.FormView#enableSubmit
     */
    enableSubmit() {
        if (this.viewContext) {
            this.getGroup('submit').enable();
        }
    }

    /**
     * 用户处理弹出抽屉的事件Handle
     *
     * @protected
     * @method mvc.FormView#popDrawerActionPanel
     * @param {mini-event.Event} e 事件参数
     */
    popDrawerActionPanel(e) {
        e.preventDefault();
        e.stopPropagation();

        let url = e.target.get('href') + '';
        let targetId = e.target.get('id');

        // 传给 ActionPanel 的 url 是不能带 hash 符号的
        if (url[0] === '#') {
            url = url.slice(1);
        }
        this.popDrawerAction({url}, targetId).show();
    }

    /**
     * @override
     */
    popDrawerAction(options, targetId) {
        let drawerActionPanel = super.popDrawerAction(options);

        drawerActionPanel.on(
            'action@entitysave',
            e => {
                e.stopPropagation();
                e.preventDefault();
                this.handleAfterRelatedEntitySaved(e.entity, targetId);
            }
        );
        drawerActionPanel.on(
            'action@handlefinish',
            e => {
                e.target.hide();
                e.target.dispose();
            }
        );
        drawerActionPanel.on(
            'action@submitcancel',
            e => {
                e.preventDefault();
                e.target.dispose();
            }
        );
        drawerActionPanel.on(
            'action@back',
            e => {
                e.stopPropagation();
                e.preventDefault();
                e.target.hide();
            }
        );

        return drawerActionPanel;
    }

    @on('form', 'submit')
    onFormSubmit() {
        this.fire('submit');
    }

    @on('cancel', 'click')
    onCancelClick() {
        this.fire('cancel');
    }
}
