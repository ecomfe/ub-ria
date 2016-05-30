/**
 * UB RIA Base
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 用于MVC体系的各个Decorator
 * @author otakustay
 */

import u from '../util';

/**
 * 关联View中的属性与控件
 *
 * @param {string} id 控件的id
 * @param {boolean} safe 是否使用`getSafely`
 * @return {Function}
 */
export function control(id, safe = false) {
    return (target, key, descriptor) => {
        let controlId = id || u.dasherize(key);
        descriptor.get = function () {
            if (!this.viewContext) {
                return undefined;
            }

            return safe ? this.getSafely(controlId) : this.get(controlId);
        };
    };
}

/**
 * 用于获取通过decorator添加的事件的Symbol
 *
 * @type {Symbol}
 */
export const DECORATOR_UI_EVENTS = Symbol('decoratorEvents');

/**
 * 关联View的方法与控件的属性
 *
 * @param {string} control 控件的id
 * @param {string} event 处理的事件名称
 * @return {Function}
 */
export function bindControlEvent(control, event) {
    return (target, key, descriptor) => {
        if (!target[DECORATOR_UI_EVENTS]) {
            target[DECORATOR_UI_EVENTS] = [];
        }
        else if (!target.hasOwnProperty(DECORATOR_UI_EVENTS)) {
            target[DECORATOR_UI_EVENTS] = u.clone(target[DECORATOR_UI_EVENTS]);
        }

        target[DECORATOR_UI_EVENTS].push({control, event, key});
    };
}

export const DECORATOR_VIEW_EVENTS = Symbol('decoratorViewEvents');

export function viewEvent(event) {
    return (target, key, descriptor) => {
        if (!target[DECORATOR_VIEW_EVENTS]) {
            target[DECORATOR_VIEW_EVENTS] = [];
        }
        else if (!target.hasOwnProperty(DECORATOR_VIEW_EVENTS)) {
            target[DECORATOR_VIEW_EVENTS] = u.clone(target[DECORATOR_VIEW_EVENTS]);
        }

        target[DECORATOR_VIEW_EVENTS].push({event, key});
    };
}

/**
 * data setter 装饰器: @data('app') => Class#setAppData = function (data) { this.addData('app', data); }
 *
 * @param {string} entityName 实体名
 * @return {Function}
 */
export function data(entityName = 'default') {
    return target => {

        let upperName = entityName === 'default' ? '' : entityName.charAt(0).toUpperCase() + entityName.slice(1);

        target.prototype[`set${upperName}Data`] = function (data) {
            this.addData(entityName, data);
        };
    };
}
