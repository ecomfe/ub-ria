/**
 * UB RIA Base
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file Action基类
 * @author otakustay
 */

import u from '../../util';
import {accessorProperty, memoize} from '../../decorator';
import Action from 'er/Action';
import {DECORATOR_VIEW_EVENTS} from '../decorator';

/**
 * Action基类，提供实体名称和实体描述的维护
 *
 * @class mvc.BaseAction
 * @extends er.Action
 */
@accessorProperty('group')
@accessorProperty('packageName')
@accessorProperty('eventBus')
export default class BaseAction extends Action {

    /**
     * 当前Action所处理的实体名称
     *
     * @memberOf  mvc.BaseAction#entityName
     * @type {string}
     */
    @memoize()
    get entityName() {
        // 如果在`enteractionfail`之类的事件中用到，此时是没有`context`的
        if (this.context) {
            // 几乎所有的URL都是`/{entityName}/list|update|create|view`结构
            let path = this.context.url.getPath();
            return path.split('/')[1];
        }

        return '';
    }


    /**
     * 当前Action所处理的实体描述
     *
     * @memberOf  mvc.BaseAction#entityDescription
     * @type {string}
     */
    get entityDescription() {
        return '';
    }

    /**
     * 当前Action所在分类
     *
     * @memberOf  mvc.BaseAction#category
     * @type {string}
     */
    get category() {
        return '';
    }

    /**
     * @override
     */
    initBehavior() {
        super.initBehavior();

        let events = this[DECORATOR_VIEW_EVENTS];
        if (events) {
            for (let {event, key} of events) {
                this.view.on(event, this[key], this);
            }
        }
    }

    /**
     * 获取当前页面的分类
     *
     * 默认返回以下内容：
     *
     * - `{category}-page`
     * - `{entityName}-page`
     * - `{entityName}-{category}-page`
     * - `{packageName}-package`
     * - `{packageName}-pacakge-{category}`
     *
     * @method mvc.BaseAction#getPageCategories
     * @return {string[]}
     */
    getPageCategories() {
        let categories = [];
        let category = u.dasherize(this.category);
        let entityName = u.dasherize(this.entityName);
        let packageName = u.dasherize(this.packageName);

        if (category) {
            categories.push(`${category}-page`);
        }
        if (entityName) {
            categories.push(`${entityName}-page`);
        }
        if (category && entityName) {
            categories.push(`${entityName}-${category}-page`);
        }
        if (packageName) {
            categories.push(`${packageName}-package`);
        }
        if (packageName && category) {
            categories.push(`${packageName}-package-${category}`);
        }

        return categories;
    }

    /**
     * 设置数据模型对象，会给`model`增加`entityDescription`字段
     *
     * 可选，一般由IoC统一配置
     *
     * @method mvc.BaseAction#setModel
     * @param {er.Model} model 数据模型
     */
    setModel(model) {
        model.set('entityDescription', this.entityDescription);
        model.set('entityName', this.entityName);

        this.model = model;
    }
}

/**
 * 当前Action所在分组
 *
 * @memberOf  mvc.BaseAction#group
 * @type {string}
 */

/**
 * 当前模块包名，用于第三方模块集成系统时使用，一些CSS Class的生成
 *
 * @member mvc.BaseAction#packageName
 * @return {string}
 */

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
