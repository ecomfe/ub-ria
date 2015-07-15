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
            target[DECORATOR_UI_EVENTS] = Object.create(target[DECORATOR_UI_EVENTS]);
        }

        target[DECORATOR_UI_EVENTS].push({control, event, key});
    };
}

/**
 * 用于获取通过decorator添加的控件属性的Symbol
 *
 * @type {Symbol}
 */
export const DECORATOR_UI_PROPERTIES = Symbol('decoratorUIProperties');

/**
 * 添加控件属性，仅可用在class上
 *
 * @protected
 * @param {string} control 控件的id
 * @param {string} key 属性名
 * @param {*} value 属性值
 * @return {Function}
 */
export function uiProperty(control, key, value) {
    // 支持`@property(control, key, value)`和`@property(control, properties)`两种重载
    let properties = arguments.length === 3 ? {[key]: value} : key;
    return (View) => {
        return class extends View {
            constructor(...args) {
                super(...args);

                let map = this[DECORATOR_UI_PROPERTIES] || (this[DECORATOR_UI_PROPERTIES] = {});
                let controlProperties = map[control] || (map[control] = {});
                u.extend(controlProperties, properties);
            }
        };
    };
}

export const DECORATOR_VIEW_EVENTS = Symbol('decoratorViewEvents');

export function viewEvent(event) {
    return (target, key, descriptor) => {
        if (!target[DECORATOR_VIEW_EVENTS]) {
            target[DECORATOR_VIEW_EVENTS] = [];
        }
        else if (!target.hasOwnProperty(DECORATOR_VIEW_EVENTS)) {
            target[DECORATOR_VIEW_EVENTS] = Object.create(target[DECORATOR_VIEW_EVENTS]);
        }

        target[DECORATOR_VIEW_EVENTS].push({event, key});
    };
}
