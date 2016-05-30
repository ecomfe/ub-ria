/**
 * UB RIA Base
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 表单提交成功后的跳转组件
 * @author yanghuabei
 */

import u from '../../util';
import SubmitHandler from './SubmitHandler';

/**
 * 表单提交成功后的跳转组件
 *
 * @class mvc.handler.RedirectSubmitHandler
 * @extends mvc.handler.SubmitHandler
 */
export default class RedirectSubmitHandler extends SubmitHandler {
    /**
     * 跳转url模版
     *
     * @member mvc.handler.RedirectSubmitHandler#template
     * @type {string}
     */
    template = '/${entityName}/list';

    /**
     * 跳转参数
     *
     * @member mvc.handler.RedirectSubmitHandler#redirectOptions
     * @type {string}
     */
    redirectOptions = null;

    /**
     * 设置组件的url模版
     *
     * 可选。默认值为'/${entityName}/list'
     *
     * 修改后可指定跳转url模板
     *
     * @method mvc.handler.RedirectSubmitHandler#setTemplate
     * @param {string} template 跳转url模版
     */
    setTemplate(template) {
        this.template = template;
    }

    /**
     * 获取模版
     *
     * @method mvc.handler.RedirectSubmitHandler#getTemplate
     * @return {string}
     */
    getTemplate() {
        return this.template;
    }

    /**
     * 设置跳转参数
     *
     * 可选。默认值为空
     *
     * 修改后可指定跳转配置
     *
     * @method mvc.handler.RedirectSubmitHandler#setRedirectOptions
     * @param {Object} options 跳转参数
     */
    setRedirectOptions(options) {
        this.redirectOptions = options;
    }

    /**
     * 获取跳转参数
     *
     * @method mvc.handler.RedirectSubmitHandler#getRedirectOptions
     * @return {Object}
     */
    getRedirectOptions() {
        return this.redirectOptions;
    }

    /**
     * @override
     */
    handle(entity, action) {
        let data = this.getData(entity, action);
        let url = u.template(this.getTemplate(), data);
        this.redirect(action, url, this.getRedirectOptions());

        this.next(entity, action);
    }

    /**
     * 跳转的方法
     *
     * @protected
     * @method mvc.handler.RedirectSubmitHandler#redirect
     * @param {er.Action} action 表单Action实例
     * @param {string} url 跳转目的url
     * @param {Object} options 跳转参数
     */
    redirect(action, url, options) {
        action.redirect(url, options);
    }

    /**
     * 获取url模版的数据
     *
     * @protected
     * @method mvc.handler.RedirectSubmitHandler#getData
     * @param {Object} entity 提交后服务器端返回的实体信息
     * @param {er.Action} action 表单Action实例
     * @return {Object}
     */
    getData(entity, action) {
        return {entityName: action.entityName};
    }
}
