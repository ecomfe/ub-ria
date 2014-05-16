/**
 * UB RIA Base
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 表单实体验证基类
 * @author yanghuabei
 * @date $DATE$
 */
define(
    function (require) {
        var util = require('../util');
        var u = require('underscore');
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
         * 作为{ub-ria.FormModel}的属性，用于对表单提交的数据在发送至后端前进行
         * 检验，检验规则由模块下相应的schema.js决定。
         * 
         * 默认提供required, type, maxLength, minLength, rangeLength,
         * min, max, range, enum, pattern十种校验器，每种检验器具有不同的优先级
         * 用户自定义的检验器可通过{EntityValidator.addCheckers}进行全局配置
         *
         * @class EntityValidator
         * @constructor
         */        
        function EntityValidator() {
            this.initCheckers();
        }

        /**
         * 用于初始化EntityValidator实例的checkers属性，有需要可以通过override
         * 实现对EntityValidator检查器的全局配置
         *
         */
        EntityValidator.prototype.initCheckers = function () {
            this.checkers = util.deepClone(checkers);
        };

        /**
         * 用于自定义EntityValidator实例的校验器错误提示信息
         *
         * @param {object} errorMessages 每一项为校验器名与信息模板内容组成
         * key-value对
         */
        EntityValidator.prototype.setErrorMessages = function (errorMessages) {
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
         * 为某个EntityValidator实例添加自定义校验器
         *
         * @param {object} checker 要添加的自定义检验器
         * @param {string} checker.name 校验器名称
         * @param {string} checker.errorMessage 错误信息模板
         * @param {number} checker.priority 校验器优先级
         * @param {function} checker.check 校验函数
         * @return {object} 添加成功返回checker，失败返回null 
         */
        EntityValidator.prototype.addChecker = function (checker) {
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
         * 移除EntityValidator实例上指定名称的校验器
         *
         * @param {string} checkerName 校验器名称
         * @return {boolean} 删除成功返回true，失败返回false
         */
        EntityValidator.prototype.removeChecker = function (checkerName) {
            var checkers = this.getCheckers();

            return delete checkers[checkerName];
        };

        /**
         * 获取EntityValidator实例上的校验器checkers
         *
         * @return {object} 返回localCheckers
         */
        EntityValidator.prototype.getCheckers = function () {
            return this.checkers || {};
        };

        /**
         * 设置validator的'schema'属性
         *
         * @param {object} value 实体的schema定义
         */
        EntityValidator.prototype.setSchema = function (value) {
            this.schema = value;
        };

        /**
         * 获取validator的schema
         *
         * @return {object | undefined}
         */
        EntityValidator.prototype.getSchema = function () {
            return this.schema;
        };

        /**
         * 设置validator的'rule'属性
         *
         * @param {object} value model上绑定的rule
         */
        EntityValidator.prototype.setRule = function (value) {
            this.rule = value;
        };

        /**
         * 获取validator的rule
         *
         * @return {object | undefined} 
         */
        EntityValidator.prototype.getRule = function () {
            return this.rule;
        };

        /**
         * 调用该方法对model的实体值进行检验，默认检验规则定义与相应模块内的
         * schema.js中
         *
         * @param {object} entity 表单提交的实体
         * @return {object[]} 错误字段及错误信息数组
         */
        EntityValidator.prototype.validate = function (entity) {
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
         * @param {object} schema 实体定义
         * @param {object} entity 表单提交的实体
         * @param {object[]} errors 错误字段、错误信息数组
         * @param {string[]} path 记录字段层次的数组
         * @ignore
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
                var result = this.excuteCheckers(fieldCheckers, args);
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
         * @param {object[]} fieldCheckers 针对某字段的检验器数组，按优先级高低排序
         * @param {object[]} checkerOptions
         * @param {string} checkerOptions.value 待检验的字段值
         * @param {string} checkerOptions.fieldPath 待检验字段在实体entity中的访问路径
         * @param {object[]} checkerOptions.fieldSchema 待检验字段的定义、约束
         * @return {object | true}
         */
        EntityValidator.prototype.excuteCheckers = function (fieldCheckers, checkerOptions) {
            var value = checkerOptions.value;
            var fieldPath = checkerOptions.fieldPath;
            var fieldSchema = util.deepClone(checkerOptions.fieldSchema);

            fieldSchema = parseFieldSchema.call(this, fieldSchema);

            for (var i = 0; i < fieldCheckers.length; i++) {
                var checker = fieldCheckers[i];
                var result = checker.check(value, fieldSchema);

                if (!result) {
                    var errorMessage = getErrorMessage(checker.errorMessage, fieldSchema);
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
         * @param {fieldSchema} fieldSchema 字段定义
         * @return {string} 错误信息
         * @ignore
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

            return u.template(template, data, { interpolate: regex });
        }

        /**
         * 解析字段定义中的预定义规则字段，包括maxLength, minLength
         * min, max, pattern, 当其值为以'@'为前缀的字符串时，进行解析
         *
         * @param {object[]} fieldSchema 字段定义
         * @return {object[]} 解析后的字段定义
         */
        function parseFieldSchema(fieldSchema) {
            var typeOption = fieldSchema[2];

            if (!typeOption) {
                return {};
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
         * @param {object} fieldSchema为字段定义
         * @return {object} 检验器对象组成的有序数组
         */
        EntityValidator.prototype.getFieldCheckers = function(fieldSchema) {
            var checkerNames = getFieldCheckerNames(fieldSchema);
            var checkers = this.getCheckers();
            var fieldCheckers = [];

            for (var i = 0; i < checkerNames.length; i++ ) {
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
         * @param {object} fieldSchema 字段的定义
         * @return {string[]} 检验器名组成的数组
         * @ignore
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
            addRangeChecker(checkerNames, 'rangeLength', 'minLength', 'maxLength');
            // max、min同时存在的情况下使用range检验器
            addRangeChecker(checkerNames, 'range', 'min', 'max');

            return checkerNames;
        }

        /**
         * 
         * @param {string[]} list 检查器名数组
         * @param {string} range 上下界检查器名
         * @param {string} min 下界检查器名
         * @param {string} max 上界检查器名
         * @ignore
         */
        function addRangeChecker(list, range, min, max) {
            if (u.indexOf(list, min) >= 0 
                && u.indexOf(list, max) >= 0
            ) {
                list = u.without(list, min, max);
                list.push(range);
            }
        }

        return EntityValidator;
    }
);