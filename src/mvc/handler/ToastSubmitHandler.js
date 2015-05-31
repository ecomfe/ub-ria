/**
 * UB RIA Base
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 表单提交成功后的toast提醒组件
 * @author yanghuabei
 */

import u from '../../util';
import Toast from 'esui/Toast';
import SubmitHandler from './SubmitHandler';

/**
 * 表单提交成功后的toast提醒组件
 *
 * @class mvc.handler.ToastSubmitHandler
 * @extends mvc.hadnler.SubmitHandler
 */
export default class ToastSubmitHandler extends SubmitHandler {
    /**
     * toast消息模版
     *
     * @member mvc.handler.ToastSubmitHandler#template
     * @type {string}
     */
    template = '';

    /**
     * 设置下一个组件
     *
     * @method mvc.handler.ToastSubmitHandler#setTemplate
     * @param {string} template toast消息模版
     */
    setTemplate(template) {
        this.template = template;
    }

    /**
     * 获取模版
     *
     * @method mvc.handler.ToastSubmitHandler#getTemplate
     * @return {string}
     */
    getTemplate() {
        return this.template;
    }

    /**
     * @override
     */
    handle(entity, action) {
        let message = this.getToastMessage(entity, action);
        if (message) {
            let toast = Toast.success(message);
            toast.show();
        }

        super.handle(entity, action);
    }

    /**
     * 获取表单提交成功后显示的信息
     *
     * 默认提示信息为“您[创建|修改]的{实体名称}{name}已经成功保存”
     *
     * @protected
     * @method mvc.handler.ToastSubmitHandler#getToastMessage
     * @param {Object} entity 提交后服务器端返回的实体信息
     * @param {er.Action} action 表单Action实例
     * @return {string}
     */
    getToastMessage(entity, action) {
        let template = this.getTemplate();

        if (template == null) {
            return '';
        }

        if (template) {
            return u.template(template, entity || {});
        }

        let actionType = action.context.formType === 'update' ? '修改' : '创建';
        let entityDescription = action.getEntityDescription();
        let name = u.escape(entity.name);

        return `您${actionType}的${entityDescription}[<string>${name}</strong>]已经成功保存`;
    }
}
