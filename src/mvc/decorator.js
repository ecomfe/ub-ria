/**
 * UB RIA Base
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 用于MVC体系的各个Decorator
 * @author otakustay
 */

import u from '../util';

export let control = (id, safe = false) => {
    return (target, key, descriptor) => {
        let id = id || u.dasherize(key);
        descriptor.get = function () {
            return safe ? this.getSafely(key) : this.get(key);
        };
    };
};

export const DECORATOR_EVENTS = Symbol('decoratorEvents');

export let bindControlEvent = (control, event) => {
    return (target, key, descriptor) => {
        if (!target[DECORATOR_EVENTS]) {
            target[DECORATOR_EVENTS] = [];
        }

        target[DECORATOR_EVENTS].push({control, event, key});
    };
};
