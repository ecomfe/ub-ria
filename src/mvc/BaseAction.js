/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file Action基类
 * @author otakustay
 */

import u from '../util';
import Action from 'er/Action';

/**
 * Action基类，提供实体名称和实体描述的维护
 *
 * @class mvc.BaseAction
 * @extends er.Action
 */
export default class BaseAction extends Action {
    /**
     * 当前Action所处理的实体名称
     *
     * @memberOf  mvc.BaseAction#entityName
     * @type {string}
     */
    entityName = null

    /**
     * 当前Action所处理的实体简介
     *
     * @memberOf  mvc.BaseAction#entityDescription
     * @type {string}
     */
    entityDescription = null

    /**
     * 当前Action所在分组
     *
     * @memberOf  mvc.BaseAction#group
     * @type {string}
     */
    group = null

    /**
     * 当前Action所在分类
     *
     * @memberOf  mvc.BaseAction#category
     * @type {string}
     */
    category = null

    /**
     * 获取当前Action所处理的实体名称
     *
     * @method mvc.BaseAction#getEntityName
     * @return {string}
     */
    getEntityName() {
        if (!this.entityName) {
            // 如果在`enteractionfail`之类的事件中用到，此时是没有`context`的
            if (this.context) {
                // 几乎所有的URL都是`/{entityName}/list|update|create|view`结构
                let path = this.context.url.getPath();
                this.entityName = path.split('/')[1];
            }
            else {
                return '';
            }
        }

        return this.entityName;
    }

    getEntityDescription() {
        return this.entityDescription || '';
    }

    getGroup() {
        return this.group;
    }

    getCategory() {
        return this.group;
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
        let category = u.dasherize(this.getCategory());
        let entityName = u.dasherize(this.getEntityName());
        let packageName = u.dasherize(this.getPackageName());

        if (category) {
            categories.push(category + '-page');
        }
        if (entityName) {
            categories.push(entityName + '-page');
        }
        if (category && entityName) {
            categories.push(entityName + '-' + this.category + '-page');
        }
        if (packageName) {
            categories.push(packageName + '-package');
        }
        if (packageName && category) {
            categories.push(packageName + '-package-' + category);
        }

        return categories;
    }

    /**
     * 设置数据模型对象，会给`model`增加`entityDescription`字段
     *
     * @method mvc.BaseAction#setModel
     * @param {er.Model} model 数据模型
     */
    setModel(model) {
        model.set('entityDescription', this.getEntityDescription());

        this.model = model;
    }
}

import oo from 'eoo';

/**
 * 获取当前模块包名，用于一些CSS Class的生成
 *
 * @method mvc.BaseAction#getPackageName
 * @return {string}
 */

/**
 * 设置当前模块包名，用于一些CSS Class的生成
 *
 * @method mvc.BaseAction#setPackageName
 * @param {string} packageName 包名称
 */
oo.defineAccessor(BaseAction.prototype, 'packageName');

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
oo.defineAccessor(BaseAction.prototype, 'eventBus');
