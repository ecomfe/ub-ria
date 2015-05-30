/**
 * UB RIA Base
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file IoCAction工厂
 * @author shenbin(bobshenbin@gmail.com)
 */

import u from '../util';

const ACTION_COMPONENT = Symbol('actionComponent');

/**
 * 使用IoC创建Action的工厂
 *
 * @class mvc.IoCActionFactory
 */
export default class IoCActionFactory {
    /**
     * @param {string} actionComponent action组件名
     */
    constructor(actionComponent) {
        this[ACTION_COMPONENT] = actionComponent;
    }

    /**
     * 创建一个Action实例
     *
     * @method mvc.IoCActionFactory#createRuntimeAction
     * @param {er.meta.ActionContext} actionContext Action的执行上下文
     * @return {Promise}
     */
    createRuntimeAction(actionContext) {
        var ioc = this.getIocContainer();
        return new Promise((resolve) => ioc.getComponent(this[ACTION_COMPONENT], resolve))
            .then((action) => this.buildAction(actionContext, action));
    }

    /**
     * 获取视图名称
     *
     * @param {er.meta.ActionContext} actionContext Action的执行上下文
     * @return {string}
     */
    getViewName(actionContext) {
        var parts = u.compact(actionContext.url.getPath().split('/'));

        var pageType = parts[parts.length - 1];
        if (pageType === 'create' || pageType === 'update') {
            parts[parts.length - 1] = 'form';
        }

        return parts.map(u.dasherize).join('-');
    }

    /**
     * 组装Action
     *
     * @protected
     * @method mvc.IoCActionFactory#buildAction
     * @param {er.meta.ActionContext} actionContext Action的执行上下文
     * @param {er.Action} action 待组装的`Action`实例
     * @return {er.Action}
     */
    buildAction(actionContext, action) {
        action.view.name = this.getViewName(actionContext);

        return action;
    }
}

import oo from 'eoo';

oo.defineAccessor(IoCActionFactory.prototype, 'iocContainer');
