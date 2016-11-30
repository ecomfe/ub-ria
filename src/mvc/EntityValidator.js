/**
 * UB RIA Base
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file 表单实体验证基类
 * @author yanghuabei
 */
define(
    function (require) {
        var u = require('../util');
        var checkers = {
            'required': require('./checker/requiredChecker'),
            'type': require('./checker/typeChecker'),
            'rangeLength': require('./checker/rangeLengthChecker'),
            'maxLength': require('./checker/maxLengthChecker'),
            'minLength': require('./checker/minLengthChecker'),
            'range': require('./checker/rangeChecker'),
            'max': require('./checker/maxChecker'),
            'min': require('./checker/minChecker'),
            'enum': require('./checker/enumChecker'),
            'pattern': require('./checker/patternChecker')
        };

        /**
         * 表单实体验证基类
         *
         * 作为{@link mvc.FormModel}的属性，用于对表单提交的数据在发送至后端前进行检验，检验规则由模块下相应的schema.js决定。
         *
         * 默认提供`required`, `type`, `maxLength`, `minLength`, `rangeLength`,
         * `min`, `max`, `range`, `enum`, `pattern`十种校验器，每种检验器具有不同的优先级
         * 用户自定义的检验器可通过{@link EntityValidator#addCheckers}进行全局配置
         *
         * @class mvc.EntityValidator
         */
        var exports = {};

        /**
         * 默认构造函数
         *
         * @constructs mvc.EntityValidator
         */
        exports.constructor = function () {
            this.initCheckers();
        };

        /**
         * 用于初始化实例的checkers属性，有需要可以重写该方法实现对检查器的全局配置
         *
         * @method mvc.EntityValidator#initCheckers
         */
        exports.initCheckers = function () {
            this.checkers = u.deepClone(checkers);
        };

        /**
         * 用于自定义实例的校验器错误提示信息
         *
         * @method mvc.EntityValidator#setErrorMessages
         * @param {Object} errorMessages 每一项为校验器名与信息模板内容组成key-value对
         */
        exports.setErrorMessages = function (errorMessages) {
            if (!errorMessages) {
                return;
            }

            var checkers = this.getCheckers();
            u.each(
                errorMessages,
                function (value, key) {
                    var checker = checkers[key];
                    if (checker) {
                        checker.errorMessage = value;
                    }
                }
            );
        };

        /**
         * 为某个实例添加自定义校验器
         *
         * @method mvc.EntityValidator#addChecker
         * @param {Object} checker 要添加的自定义检验器
         * @param {string} checker.name 校验器名称
         * @param {string | Object} checker.errorMessage 错误信息模板,或者多个错误信息模板组成的对象
         * @param {number} checker.priority 校验器优先级
         * @param {Function} checker.check 校验函数
         * @return {Object} 添加成功返回checker，失败返回null
         */
        exports.addChecker = function (checker) {
            if (checker
                && checker.name
                && checker.errorMessage
                && checker.check
                && checker.priority
            ) {
                var checkers = this.getCheckers();
                checkers[checker.name] = checker;

                return this.checkers[checker.name];
            }

            return null;
        };

        /**
         * 移除实例上指定名称的校验器
         *
         * @method mvc.EntityValidator#removeChecker
         * @param {string} checkerName 校验器名称
         * @return {boolean} 删除成功返回true，失败返回false
         */
        exports.removeChecker = function (checkerName) {
            var checkers = this.getCheckers();

            return delete checkers[checkerName];
        };

        /**
         * 获取实例上的校验器checkers
         *
         * @method mvc.EntityValidator#getCheckers
         * @return {Object} 返回当前实例上的校验器
         */
        exports.getCheckers = function () {
            return this.checkers || {};
        };

        /**
         * 设置需要校验的实体的规则
         * 可选。
         *
         * @method mvc.EntityValidator#setSchema
         * @param {Object} value 实体的schema定义
         */
        exports.setSchema = function (value) {
            this.schema = value;
        };

        /**
         * 获取需要校验的实体的规则
         *
         * @method mvc.EntityValidator#getSchema
         * @return {Object | undefined}
         */
        exports.getSchema = function () {
            return this.schema;
        };

        /**
         * 设置规则常量对象
         * 可选。
         *
         * @method mvc.EntityValidator#setRule
         * @param {Object} value model上绑定的rule
         */
        exports.setRule = function (value) {
            this.rule = value;
        };

        /**
         * 获取规则常量对象
         *
         * @method mvc.EntityValidator#getRule
         * @return {Object | undefined}
         */
        exports.getRule = function () {
            return this.rule;
        };

        /**
         * 调用该方法对model的实体值进行检验，默认检验规则定义与相应模块内的`schema`中
         *
         * @method mvc.EntityValidator#validate
         * @param {Object} entity 表单提交的实体
         * @return {Object[]} 错误字段及错误信息数组
         */
        exports.validate = function (entity) {
            var schema = this.getSchema();

            // 错误信息集合
            var errors = [];
            // 用在递归中记录当前字段访问层次的数组
            var path = [];

            actualValidate.call(this, schema, entity, errors, path);

            return errors;
        };

        /**
         * 实际校验函数，遍历schema中每个字段的定义
         *
         * @param {Object} schema 实体定义
         * @param {Object} entity 表单提交的实体
         * @param {Object[]} errors 错误字段、错误信息数组
         * @param {string[]} path 记录字段层次的数组
         */
        function actualValidate(schema, entity, errors, path) {
            for (var field in schema) {
                // 跳过id的检查
                if (field === 'id') {
                    continue;
                }

                var value = entity[field];
                var fieldSchema = schema[field];
                var fieldCheckers = this.getFieldCheckers(fieldSchema);
                var fieldPath = path.length > 0 ? (path.join('.') + '.' + field) : field;

                var args = {
                    value: value,
                    fieldPath: fieldPath,
                    fieldSchema: fieldSchema
                };
                // 传入实体对应字段值、字段路径、字段定义、检查器集合，检查该字段的值是否满足定义的要求
                var result = this.executeCheckers(fieldCheckers, args);
                // 如果发现错误，继续检查下一字段
                if (result) {
                    errors.push(result);
                    continue;
                }

                // 若该字段值不存在，没有进行下去的必要了
                if (u.isEmpty(value)) {
                    continue;
                }

                if (fieldSchema[0] === 'object') {
                    path.push(field);
                    actualValidate.call(this, fieldSchema[2].content, entity[field], errors, path);
                    path.pop();
                }
                else if (fieldSchema[0] === 'array') {
                    path.push(field);
                    for (var i = 0; i < value.length; i++) {
                        var itemSchema = {};
                        // 为了拼出形如deliveries.1的字段名
                        itemSchema[i] = fieldSchema[2].item;
                        actualValidate.call(this, itemSchema, value, errors, path);
                    }
                    path.pop();
                }
            }
        }

        /**
         * 执行对当前字段的校验，校验通过返回true，不通过返回对象
         *
         * @protected
         * @method mvc.EntityValidator#executeCheckers
         * @param {Object[]} fieldCheckers 针对某字段的检验器数组，按优先级高低排序
         * @param {Object} checkerOptions 配置项
         * @param {string} checkerOptions.value 待检验的字段值
         * @param {string} checkerOptions.fieldPath 待检验字段在实体entity中的访问路径
         * @param {Object[]} checkerOptions.fieldSchema 待检验字段的定义、约束
         * @return {Object | true}
         */
        exports.executeCheckers = function (fieldCheckers, checkerOptions) {
            var value = checkerOptions.value;
            var fieldPath = checkerOptions.fieldPath;
            var fieldSchema = u.deepClone(checkerOptions.fieldSchema);

            fieldSchema = parseFieldSchema.call(this, fieldSchema);

            for (var i = 0; i < fieldCheckers.length; i++) {
                var checker = fieldCheckers[i];
                var result = checker.check(value, fieldSchema);

                if (!result) {
                    var messageTemplate = checker.errorMessage;
                    // 当自定义错误信息存在时替换自定义错误信息
                    var fieldErrorMessage = fieldSchema[3];
                    if (fieldErrorMessage && fieldErrorMessage[checker.name]) {
                        messageTemplate = fieldErrorMessage[checker.name];
                    }
                    // 处理同一个checker检查不同类型字段时错误消息模版不同的情况
                    if (typeof messageTemplate === 'object') {
                        messageTemplate = messageTemplate[fieldSchema[0]];
                    }

                    if (!u.isString(messageTemplate)) {
                        throw new Error('未找到对应错误信息模板');
                    }

                    var errorMessage = getErrorMessage(messageTemplate, fieldSchema);
                    var error = {
                        field: fieldPath,
                        message: errorMessage
                    };

                    return error;
                }
            }

            return null;
        };

        /**
         * 根据字段定义和错误信息模板，生成错误信息
         *
         * @param {string} template 错误信息模板
         * @param {Array} fieldSchema 字段定义，根据规则第`0`项为字段名称，第`1`项为字段类型，第`2`项为包含校验规则的对象
         * @return {string} 错误信息
         */
        function getErrorMessage(template, fieldSchema) {
            var data = {};
            var regex = /\$\{(.+?)\}/g;
            var match = regex.exec(template);
            var typeOption = fieldSchema[2] || {};

            while (match) {
                var key = match[1];

                data[key] = typeOption[key];
                if (!data[key]) {
                    data[key] = fieldSchema[1];
                }

                match = regex.exec(template);
            }

            return u.template(template, data, {interpolate: regex});
        }

        /**
         * 解析字段定义中的预定义规则字段，包括maxLength, minLength，min, max, pattern, 当其值为以'@'为前缀的字符串时，进行解析
         *
         * @param {Object[]} fieldSchema 字段定义
         * @return {Object[]} 解析后的字段定义
         */
        function parseFieldSchema(fieldSchema) {
            var typeOption = fieldSchema[2];

            if (!typeOption) {
                return fieldSchema;
            }

            // 可能需要被解析的规则集
            var ruleName = ['maxLength', 'minLength', 'min', 'max', 'pattern'];
            var keys = u.keys(typeOption);
            // 与定义中的规则取交集，得到需要被解析的规则集
            var ruleNeedParsed = u.intersection(ruleName, keys);

            for (var i = 0; i < ruleNeedParsed.length; i++) {
                var key = ruleNeedParsed[i];
                var value = typeOption[key];

                // 不是字符串，说明不需要被解析
                if (!u.isString(value)) {
                    continue;
                }

                // value形如'@rule.maxLength'时需要解析
                var path = value.split('.');
                // 抛弃第一个元素，因为是‘@rule’
                path = path.slice(1);
                var actualValue = this.rule[path[0]];
                actualValue = path.length > 1
                    ? getProperty(actualValue, path.slice(1))
                    : actualValue;
                typeOption[key] = actualValue;
            }

            return fieldSchema;
        }

        function getProperty(target, path) {
            var value = target;
            for (var i = 0; i < path.length; i++) {
                value = value[path[i]];
            }

            return value;
        }

        /**
         * 生成某一字段的按优先级高低排序的检验器数组
         *
         * @protected
         * @method mvc.EntityValidator#getFieldCheckers
         * @param {Object} fieldSchema 字段定义
         * @return {Object} 检验器对象组成的有序数组
         */
        exports.getFieldCheckers = function (fieldSchema) {
            var checkerNames = getFieldCheckerNames(fieldSchema);
            var checkers = this.getCheckers();
            var fieldCheckers = [];

            for (var i = 0; i < checkerNames.length; i++) {
                if (checkers[checkerNames[i]]) {
                    fieldCheckers.push(checkers[checkerNames[i]]);
                }
            }

            fieldCheckers.sort(
                function (x, y) {
                    return x.priority - y.priority;
                }
            );

            return fieldCheckers;
        };

        /**
         * 根据field定义，生成该字段的检验器名组成的数组
         *
         * @param {Object} fieldSchema 字段的定义
         * @return {string[]} 检验器名组成的数组
         */
        function getFieldCheckerNames(fieldSchema) {
            // 与字段校验无关的属性
            var keys = ['content', 'item', 'datasource'];
            var checkerNames = [];
            var fieldType = fieldSchema[0];
            var typeOption = fieldSchema[2] || {};

            // 处理required为false的情况
            typeOption = u.omit(typeOption, keys);
            if (typeOption.required === false) {
                delete typeOption.required;
            }

            [].push.apply(checkerNames, u.keys(typeOption));

            // reference、referen-set类型字段不做类型检查
            if (fieldType !== 'reference' && fieldType !== 'reference-set') {
                checkerNames.push('type');
            }

            // maxLength、minLength同时存在的情况下使用rangeLength检验器
            checkerNames = addRangeChecker(checkerNames, 'rangeLength', 'minLength', 'maxLength');
            // max、min同时存在的情况下使用range检验器
            checkerNames = addRangeChecker(checkerNames, 'range', 'min', 'max');

            return checkerNames;
        }

        /**
         * 添加一个范围检查器
         *
         * @param {string[]} list 检查器名数组
         * @param {string} range 上下界检查器名
         * @param {string} min 下界检查器名
         * @param {string} max 上界检查器名
         * @return {string[]} 返回经过处理的新数组
         */
        function addRangeChecker(list, range, min, max) {
            if (u.indexOf(list, min) >= 0 && u.indexOf(list, max) >= 0) {
                list = u.without(list, min, max);
                list.push(range);
            }

            return list;
        }

        var EntityValidator = require('eoo').create(exports);
        return EntityValidator;
    }
);
