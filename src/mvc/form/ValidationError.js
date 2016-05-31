/**
 * UB RIA Base
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 校验错误类
 * @author otakustay
 */

/**
 * 校验错误类
 *
 * @class mvc.form.ValidationError
 * @extends Error
 */
export default class ValidationError extends Error {
    constructor(fields, globalMessage) {
        super('Validation error');

        this.errorType = 'validationConflict';
        this.fields = fields;
        this.globalMessage = globalMessage;
    }
}
