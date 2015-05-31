/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 视图基类
 * @author otakustay
 */

import u from '../util';
import UIView from 'ef/UIView';
import {DECORATOR_EVENTS} from './decorator';

const UI_EVENTS = Symbol('uiEvents');
const UI_PROPERTIES = Symbol('uiProperties');

/**
 * 视图基类
 *
 * @class mvc.BaseView
 * @extends ef.UIView
 */
export default class BaseView extends UIView {
    /**
     * 添加控件事件的配置
     *
     * @protected
     * @method mvc.BaseView#addUIEvents
     * @param {Object} uiEvents 控件绑定的事件
     */
    addUIEvents(uiEvents) {
        // 对传入的控件事件参数进行格式变换
        let extendedUIEvents = [uiEvents];
        u.each(
            uiEvents,
            function (events, key) {
                // `uiEvents`对象支持两种方式的事件绑定
                //
                // { 'controlId:eventType': functionName }
                // { 'controlId:eventType': [functionNameA, functionNameB] }
                //
                // 绑定的事件函数是数组类型时，组装为多个`uiEvents`对象形式传入
                if (Array.isArray(events)) {
                    while (events.length > 1) {
                        // 从`events`中拆出来的新`uiEvents`
                        let newUIEvents = {};
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

        let thisEvents = this[UI_EVENTS];
        // `this[UI_EVENTS]`可能会以`null`/`Object`/`Array`三种类型出现
        // 这边统一为数组类型
        // 将`extendedUIEvents`拼接到`this[UI_EVENTS]`后面
        this[UI_EVENTS] = [...(thisEvents || []), ...extendedUIEvents];
    }

    /**
     * 获取控件事件配置的数组形式
     *
     * @private
     * @method mvc.BaseView#getUIEventsCollection
     * @return {Array} 控件事件
     */
    getUIEventsCollection() {
        let events = this[UI_EVENTS];

        // 重写父类实现
        // 将`this[UI_EVENTS]`包装为数组返回
        return (events && [...events]) || [];
    }

    /**
     * @override
     */
    bindEvents() {
        for (let {control, event, key} of this[DECORATOR_EVENTS]) {
            this.getSafely(control).on(event, this[key], this);
        }

        let bind = (handler, key) => {
            this.bindUIEvent(key, handler);
        };

        // 扩展后`uiEvents`可以是个数组，每一项和以前的`uiEvents`格式是一样的，一一注册就行。
        // 两层`each`，第一层分解数组，第二层和基类的`bindEvents`一样就是绑事件
        this.getUIEventsCollection().forEach((events) => u.each(events, bind));
    }

    /**
     * 添加控件的额外属性
     *
     * @protected
     * @method mvc.BaseView#addUIProperties
     * @param {Object} newUIProperties 控件的额外属性
     */
    addUIProperties(newUIProperties) {
        // `this[UI_PROPERTIES]`可能以`null`/`Object`两种类型出现
        // 统一为对象类型
        this[UI_PROPERTIES] = this[UI_PROPERTIES] || {};

        let uiProperties = this[UI_PROPERTIES];
        u.each(
            newUIProperties,
            (properties, controlId) => {
                if (!uiProperties.hasOwnProperty(controlId)) {
                    uiProperties[controlId] = {};
                }
                u.extend(uiProperties[controlId], properties);
            }
        );
    }

    /**
     * @override
     */
    getUIProperties() {
        // 重写父类实现
        // 获取 直接重写`uiProperties` 及 调用`addUIProperties`接口 设置的控件额外属性
        return this[UI_PROPERTIES] || {};
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
     * @return {Promise} 一个`Promise`对象，进入`resolved`状态时提供用户选择的按钮名称，默认有`"ok"`和`"cancel"`可选
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
     * @return {Promise} 一个`Promise`对象，对应的Action加载完成时进入`resolved`状态，如Action加载失败则进入`rejected`状态
     */
    waitActionDialog(...args) {
        let dialog = this.popActionDialog(...args);

        let executor = function (resolve, reject) {
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

import oo from 'eoo';

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
