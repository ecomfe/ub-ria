/**
 * UB RIA Base
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 表单提交成功后跳转处理组件基类
 * @author yanghuabei
 */

import oo from 'eoo';

/**
 * 表单提交成功后跳转处理组件基类
 *
 * @class mvc.handler.SubmitHandler
 */
 export default class SubmitHandler {
    /**
     * 提交成功处理函数
     *
     * @method mvc.handler.SubmitHandler#handle
     * @param {Object} entity 提交后服务器端返回的实体信息
     * @param {er.Action} action 表单Action实例
     */
    handle(entity, action) {
        this.next(entity, action);
    }

    /**
     * 调用下一个handler
     *
     * @method mvc.handler.SubmitHandler#next
     * @param {Object} entity 提交后服务器端返回的实体信息
     * @param {er.Action} action 表单Action实例
     */
    next(entity, action) {
        let nextSubmitHandler = this.getNextSubmitHandler();
        if (nextSubmitHandler) {
            nextSubmitHandler.handle(entity, action);
        }
    }
 }

/**
 * 获取下一个组件
 *
 * @method mvc.handler.SubmitHandler#getNextSubmitHandler
 * @return {SubmitHandler}
 */

/**
 * 设置下一个组件
 *
 * @method mvc.handler.SubmitHandler#setNextSubmitHandler
 * @param {SubmitHandler} handler 下一个组件
 */
oo.defineAccessor(SubmitHandler.prototype, 'nextSubmitHandler');
