/**
 * UB RIA Base
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 用于MVC体系的各个Decorator
 * @author otakustay
 */

import u from '../util';

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

export const DECORATOR_EVENTS = Symbol('decoratorEvents');

export function bindControlEvent(control, event) {
    return (target, key, descriptor) => {
        if (!target[DECORATOR_EVENTS]) {
            target[DECORATOR_EVENTS] = [];
        }

        target[DECORATOR_EVENTS].push({control, event, key});
    };
}

export const DECORATOR_UI_PROPERTIES = Symbol('decoratorUIProperties');

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
