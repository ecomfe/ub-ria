/**
 * UB RIA Base
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file MVC体系扩展
 * @author otakustay
 */

import u from '../util';
import util from 'er/util';
import events from 'er/events';

function addPageClassName() {
    let add = (e) => {
        if (!e.target.getPageCategories) {
            return;
        }

        let element = util.getElement(e.target.context.container);

        if (!element) {
            return;
        }

        let pageClasses = e.target.getPageCategories();

        // `addClass`的简单实现
        if (element.classList) {
            pageClasses.forEach((className) => element.classList.add(className));
        }
        else {
            let classes = element.className ? element.className.split(/\s+/) : [];
            classes = u.union(classes, pageClasses);
            element.className = classes.join(' ');
        }
    };

    let remove = (e) => {
        if (!e.action || !e.action.getPageCategories) {
            return;
        }

        // `enteractionfail`可以直接取到`e.container`，`leaveaction`则要从`action`上取
        let container = e.actionContext
            ? e.container
            : (e.action.context ? e.action.context.container : null); // 非常极端的情况会导致`null`
        let element = util.getElement(container);

        if (!element) {
            return;
        }

        let pageClasses = e.action.getPageCategories();

        // `removeClass`的简单实现
        if (element.classList) {
            pageClasses.forEach((className) => element.classList.remove(className));
        }
        else {
            let classes = element.className
                ? element.className.split(/\s+/)
                : [];
            let newClasses = u.difference(classes, pageClasses);
            if (newClasses.length !== classes.length) {
                element.className = newClasses.join(' ');
            }
        }
    };

    events.on('enteraction', (e) => e.action.on('enter', add));
    events.on('leaveaction', remove);
    events.on('enteractionfail', remove);
}

function enable() {
    addPageClassName();
}

/**
 * MVC体系扩展
 *
 * @namespace extension.mvc
 * @memberof extension
 */
let mvcExtension = {
    /**
     * 启动扩展
     *
     * @method extension.mvc.enable
     */
    enable: u.once(enable)
};

export default mvcExtension;
