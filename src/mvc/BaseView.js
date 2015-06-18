/**
 * UB RIA Base
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 视图基类
 * @author otakustay
 */

import oo from 'eoo';
import UIView from 'ef/UIView';
import {DECORATOR_UI_EVENTS, DECORATOR_UI_PROPERTIES} from './decorator';

/**
 * 视图基类
 *
 * @class mvc.BaseView
 * @extends ef.UIView
 */
export default class BaseView extends UIView {

    /**
     * @override
     */
    bindEvents() {
        let events = this[DECORATOR_UI_EVENTS];
        if (events) {
            for (let {control, event, key} of events) {
                this.getSafely(control).on(event, this[key], this);
            }
        }
    }

    /**
     * @override
     */
    getUIProperties() {
        return this[DECORATOR_UI_PROPERTIES] || {};
    }

    /**
     * 获取对应模板名称
     *
     * 当一个视图被作为子Action使用时，需要在其视图模板名后加上`"Main"`以进行区分，
     * 根据此设计，可以将视图切分为“完整页面”和“仅用于嵌套”两部分，根据约定命名
     *
     * @protected
     * @method mvc.BaseView#getTemplateName
     * @return {string}
     * @override
     */
    getTemplateName() {
        let templateName = super.getTemplateName();

        // 作为子Action嵌入页面时，模板使用`xxxMain`这个target
        if (this.model && this.model.get('isChildAction') && !this.model.get('isInDrawerPanel')) {
            templateName += 'Main';
        }

        return templateName;
    }

    /**
     * 等待用户的选择
     *
     * 参数同`ef.UIView.prototype.confirm`，但返回一个`Promise`对象
     *
     * @method mvc.BaseView#waitDecision
     * @param {Array} args 原始参数
     * @return {Promise.<string>} 一个`Promise`对象，进入`resolved`状态时提供用户选择的按钮名称，默认有`"ok"`和`"cancel"`可选
     */
    waitDecision(...args) {
        let dialog = this.confirm(...args);

        let executor = (resolve, reject) => {
            dialog.on('ok', () => resolve('ok'));
            dialog.on('cancel', () => resolve('cancel'));
        };
        return new Promise(executor);
    }

    /**
     * 等待用户确认
     *
     * 参数同`ef.UIView.prototype.confirm`，但返回一个`Promise`对象
     *
     * 当用户选择“确认”后，`Promise`对象进行`resolved`状态，用户选择取消则没有任何效果
     *
     * 如果需要知道用户选择“取消”，则应当使用{@link mvc.BaseView#waitDecision|waitDecision方法}
     *
     * @method mvc.BaseView#waitConfirm
     * @param {Array} args 原始参数
     * @return {Promise} 一个`Promise`对象，用户确认则进入`resolved`状态，用户取消则进入`rejected`状态
     */
    waitConfirm(...args) {
        let waiting = this.waitDecision(...args);
        let executor = (resolve) => {
            let receiveOK = (result) => {
                if (result === 'ok') {
                    resolve();
                }
            };
            waiting.then(receiveOK);
        };
        return new Promise(executor);
    }

    /**
     * 等待一个`DialogAction`加载完成
     *
     * @method mvc.BaseView#waitActionDialog
     * @param {Array} args 原始参数
     * @return {Promise} 一个`Promise`对象，对应的Action加载完成时进入`resolved`状态，如Action加载失败则进入`rejected`状态
     */
    waitActionDialog(...args) {
        let dialog = this.popActionDialog(...args);

        let executor = (resolve, reject) => {
            dialog.on('actionloaded', resolve);
            dialog.on('actionloadfail', reject);
            dialog.on('actionloadabort', reject);
        };
        return new Promise(executor);
    }

    /**
     * 获取规则值
     *
     * @protected
     * @method mvc.BaseView#getRuleValue
     * @param {string} path 相对规则`rule`对象的路径
     * @return {*} 规则对应的值
     */
    getRuleValue(path) {
        path = path.split('.');

        let value = this.model.get('rule') || this.getRule();
        for (let segment of path) {
            value = value[segment];
        }

        return value;
    }

    /**
     * @override
     */
    replaceValue(value) {
        if (typeof value !== 'string') {
            return value;
        }

        if (value.indexOf('@rule.') === 0) {
            return this.getRuleValue(value.substring(6));
        }

        return super.replaceValue(value);
    }

    /**
     * @override
     */
    getTemplateData() {
        let templateData = super.getTemplateData();
        let getProperty = templateData.get;

        templateData.get = (path) => {
            // 访问`rule`的会做一次拦截，但如果`model`中正好也有`rule`，以`model`的优先
            if (path.indexOf('rule.') === 0) {
                return this.getRuleValue(path.substring(5));
            }

            // 以`?`结尾的是权限判断，如`${canModify?}`
            if (path[path.length - 1] === '?') {
                let permissionName = path.slice(0, -1);
                return this.model.checkPermission(permissionName);
            }

            return getProperty(path);
        };

        return templateData;
    }

    /**
     * 通过`DrawerActionPanel`控件加载指定的Action
     *
     * @protected
     * @method mvc.BaseView#popDrawerAction
     * @param {Object} options 控件配置项，参考`DrawerActionPanel`控件的说明
     * @return {ub-ria-ui.DrawerActionPanel}
     */
    popDrawerAction(options) {
        options.id = options.id || 'drawer-action';
        let drawerActionPanel = this.get(options.id);

        if (!drawerActionPanel) {
            drawerActionPanel = this.create('DrawerActionPanel', options);
            drawerActionPanel.render();
        }
        else {
            drawerActionPanel.setProperties(options);
        }
        return drawerActionPanel;
    }
}

/**
 * 获取对应的规则对象
 *
 * @method mvc.BaseView#getRule
 * @return {Object}
 */

/**
 * 设置对应的规则对象
 *
 * @method mvc.BaseView#setRule
 * @param {Object} rule 对应的规则对象
 */
oo.defineAccessor(BaseView.prototype, 'rule');

/**
 * 获取事件总线对象
 *
 * @method  mvc.BaseAction#getEventBus
 * @return {mini-event.EventTarget}
 */

/**
 * 设置事件总线对象
 *
 * @method  mvc.BaseAction#getEventBus
 * @param {mini-event.EventTarget} eventBus 事件总线对象
 */
oo.defineAccessor(BaseView.prototype, 'eventBus');
