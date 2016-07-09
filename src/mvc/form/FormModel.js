/**
 * UB RIA Base
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 表单数据模型基类
 * @author otakustay
 */

import BaseModel from '../common/BaseModel';
import ValidationError from './ValidationError';
import {withDefaultMessages} from 'san-validation';

let getRangeErrorMessage = fieldSchema => {
    let {description, type, minimum, maximum} = fieldSchema;
    return type === 'integer'
        ? `${description}请填写≥${minimum}且≤${maximum}的整数`
        : `${description}请填写≥${minimum}且≤${maximum}的数字，最多可保存至小数点后两位`;
};

let messages = {
    minLength({description, minLength}) {
        if (minLength === 1) {
            return `请填写${description}`;
        }

        return `${description}不能小于${minLength}个字符`;
    },

    maxLength({description, maxLength}) {
        return `${description}不能超过${maxLength}个字符`;
    },

    minimum(fieldSchema) {
        let {description, minimum, maximum} = fieldSchema;

        if (maximum) {
            return getRangeErrorMessage(fieldSchema);
        }

        return `${description}不能小于${minimum}`;
    },

    maximum(fieldSchema) {
        let {description, minimum, maximum} = fieldSchema;

        if (minimum) {
            return getRangeErrorMessage(fieldSchema);
        }

        return `${description}不能大于${maximum}`;
    },

    pattern({description}) {
        return `${description}格式不符合要求`;
    },

    required({description}) {
        return `请填写${description}`;
    }
};

let validation = withDefaultMessages(messages);

let convertToFieldError = ({path, message}) => {
    return {field: path, message: message};
};

/**
 * 表单数据模型基类
 *
 * @class mvc.FormModel
 * @extends mvc.BaseModel
 */
export default class FormModel extends BaseModel {

    get schema() {
        return null;
    }

    get messages() {
        return {};
    }

    /**
     * 检查实体数据完整性，可在此补充一些视图无法提供的属性
     *
     * @protected
     * @method mvc.FormModel#fillEntity
     * @param {Object} entity 实体数据
     * @return {Object} 补充完整的实体数据
     */
    fillEntity(entity) {
        return entity;
    }

    /**
     * 校验实体
     *
     * @method mvc.FormModel#validateEntity
     * @param {Object} entity 需要校验的实体
     * @return {Object} 包含`isValid`、`fields`和`globalMessage`三个字段
     */
    validateEntity(entity) {
        let schema = this.schema;

        if (!schema) {
            return {
                isValid: true,
                fields: [],
                globalMessage: null
            };
        }

        let validate = validation(schema, this.messages, {greedy: true});
        let {isValid, errors} = validate(entity);

        return {
            isValid: isValid,
            fields: errors.map(convertToFieldError),
            globalMessage: null
        };
    }

    /**
     * 根据id获取实体
     *
     * @param {string | number} id 实体的id
     * @return {Promise.<Object>}
     */
    async findById(id) {
        let data = this.data();
        if (!data) {
            throw new Error('No default data object attached to this Model');
        }
        if (typeof data.findById !== 'function') {
            throw new Error('No findById method implemented on default data object');
        }

        return data.findById(id);
    }

    /**
     * 保存新建的实体
     *
     * @method mvc.FormModel#save
     * @param {Object} entity 新建的实体对象
     * @return {Promise.<Object, meta.RequestError>} 成功时提供服务器返回的实体摘要信息
     */
    async save(entity) {
        entity = this.fillEntity(entity);

        let {isValid, fields, globalMessage} = this.validateEntity(entity);

        if (!isValid) {
            throw new ValidationError(fields, globalMessage);
        }

        return this.saveEntity(entity);
    }

    /**
     * 更新已有的实体
     *
     * @method mvc.FormModel#update
     * @param {Object} entity 待更新的实体对象
     * @return {Promise.<Object, meta.RequestError>} 成功时提供服务器返回的实体摘要信息
     */
    async update(entity) {
        entity = this.fillEntity(entity);

        // 更新默认加上id
        entity.id = this.get('id');

        let validationResult = this.validateEntity(entity);

        if (!validationResult.isValid) {
            throw new ValidationError(validationResult.fields, validationResult.globalMessage);
        }

        return this.updateEntity(entity);
    }

    /**
     * 完成实体的保存操作
     *
     * @protected
     * @method mvc.FormModel#saveEntity
     * @param {Object} entity 已经补充完整并且验证通过的实体
     * @return {Promise.<Object, meta.RequestError>} 成功时提供服务器返回的实体摘要信息
     */
    async saveEntity(entity) {
        let data = this.data();
        if (!data) {
            throw new Error('No default data object attached to this Model');
        }
        if (typeof data.save !== 'function') {
            throw new Error('No save method implemented on default data object');
        }

        return data.save(entity);
    }

    /**
     * 完成实体的更新操作
     *
     * @protected
     * @method mvc.FormModel#updateEntity
     * @param {Object} entity 已经补充完整并且验证通过的实体
     * @return {Promise.<Object, meta.RequestError>} 成功时提供服务器返回的实体摘要信息
     */
    async updateEntity(entity) {
        let data = this.data();
        if (!data) {
            throw new Error('No default data object attached to this Model');
        }
        if (typeof data.update !== 'function') {
            throw new Error('No update method implemented on default data object');
        }

        return data.update(entity);
    }
}
