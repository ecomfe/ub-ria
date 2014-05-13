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
        var util = require('er/util');
        var Deferred = require('er/Deferred');
        var u = require('underscore');

        // 加载所有的检查器对象
        var requiredChecker = require('./checker/requiredChecker'),
            typeChecker = require('./checker/typeChecker'),
            rangeLengthChecker = require('./checker/rangeLengthChecker'),
            maxLengthChecker = require('./checker/maxLengthChecker'),
            minLengthChecker = require('./checker/minLengthChecker'),
            rangeChecker = require('./checker/rangeChecker'),
            maxChecker = require('./checker/maxChecker'),
            minChecker = require('./checker/minChecker'),
            enumChecker = require('./checker/enumChecker'),
            patternChecker = require('./checker/patternChecker');

        /**
         * 表单实体验证基类
         *
         * 作为{ub-ria.FormModel}的属性，用于对表单提交的数据在发送至后端前进行
         * 检验，检验规则由模块下相应的{Schema}决定。
         * 
         * 默认提供required, type, maxLength, minLength, rangeLength,
         * min, max, range, enum, pattern十种校验器，每种检验器具有不同的优先级
         * 用户自定义的检验器可通过{EntityValidator.addCheckers}进行全局配置
         *
         * @class EntityValidator
         * @constructor
         */        
        function EntityValidator() {

        }

        /**
         * 默认的检验器，检查器对象的结构如下
         *   checker = {
         *       errorMessage: '${title}不合法',
         *       priority: 10,
         *       check: function (value, field, schema) {}
         *   }
         * @type {object} 
         * @private
         */
        EntityValidator.prototype.checkers = {
            'required': requiredChecker,
            'type': typeChecker,
            'rangeLength': rangeLengthChecker,
            'maxLength': maxLengthChecker,
            'minLength': minLengthChecker,
            'range': rangeChecker,
            'max': maxChecker,
            'min': minChecker,
            'enum': enumChecker,
            'pattern': patternChecker
        };

        /**
         * 用于添加自定义的检验器的静态方法
         *
         * @param {object} checkers，要添加的自定义检验器key-value
         * 对组成的对象
         * 
         */
        EntityValidator.addCheckers = function (checkers) {
            util.mix(this.checkers, checkers);
        };

        /**
         * 用于自定义校验器错误提示信息的静态方法
         *
         * @param {object} errorMessages, 每一项为校验器名与信息模板内容组成
         * key-value对
         */
        EntityValidator.setErrorMessages = function (errorMessages) {
            if (!errorMessages) {
                return;
            }

            var checkers = this.getCheckers();
            for( var key in errorMessages) {
                var checker = checkers[key];
                if (checker) {
                    checker.errorMessage = errorMessages[key];
                }
            }
        };

        /**
         * 获取所有校验器
         *
         * @return {object} 返回全部的校验器
         */
        EntityValidator.prototype.getCheckers = function () {
            return this.checkers;
        };

        /**
         * 设置validator的属性，包括'Schema'、'rule'等
         *
         * @param {string} property 属性名
         * @param {object} rule 属性值
         * @return {object} entityDefine model的实体定义
         */
        EntityValidator.prototype.set = function (property, value) {
            this[property] = value;
        };

        /**
         * 获取validator对应property的值
         *
         * @param {string} property 属性名
         * @return {object} 对应属性的值
         */
        EntityValidator.prototype.get = function (property) {
            return this[property];
        };

        /**
         * 调用该方法对model的实体值进行检验，默认检验规则定义与相应模块内的
         * {Schema}中
         *
         * @param {object} entity, 表单提交的实体
         * @return {er.Promise} 全部字段检验完成后返回
         */
        EntityValidator.prototype.validate = function (entity) {
            var Schema = this.get('Schema');

            // 如果没有实体定义，返回一个resolved的promise
            if (!Schema) {
                return Deferred.resolved();
            }

            // 错误信息集合
            var errors = [];
            // 校验过程有异步操作的promise存放处
            var parsers = [];

            actualValidate.call(this, Schema, entity, null);

            // 如果有异步操作，等所有异步完成后resolve或reject
            if (parsers.length > 0) {
                var deferred = new Deferred();

                // TODO 检验过程出错处理
                var allParsers = Deferred.all.apply(Deferred, parsers);
                allParsers.done(function () {
                    if (errors.length > 0) {
                        deferred.reject({ fields: errors });
                    }
                    else {
                        deferred.resolve();
                    }
                });

                return deferred.promise;
            }
            // 同步状态下，直接返回相应状态的promise
            else {
                if (errors.length > 0) {
                    return Deferred.rejected({ fields: errors });
                }

                return Deferred.resolved();
            }

            function actualValidate(Schema, entity, path) {
                if (!path) {
                    path = [];
                }

                for (var field in Schema) {
                    // 跳过id的检查
                    if ('id' === field) {
                        continue;
                    }

                    var localPath = path.slice();
                    var schema = Schema[field];
                    var options = {
                        field: field,
                        schema: schema,
                        entity: entity,
                        path: localPath,
                        errors: errors,
                        _this: this
                    };
                    var fieldType = schema[0];

                    // field为enum类型时，需要异步校验，其他类型同步校验
                    if (fieldType === 'enum') {
                        (
                            function (options) {
                                var promise = asyncParseSchema.call(null, options);
                                promise.then(u.bind(startCheck, options._this));
                                parsers.push(promise);
                            }
                        )(options);
                    }
                    else {
                        var options = syncParseSchema.call(this, options);
                        startCheck.call(this, options);
                    }
                }
            }

            function startCheck(options) {
                var field = options.field;
                var entity = options.entity;
                var schema = options.schema;
                var path = options.path;
                var fieldPath = path.length > 0 
                    ? path.join('.') + '.' + field
                    : field;
                var errors = options.errors;

                // 根据解析后的schema生成当前字段的校验器数组，按优先级高低排序
                var fieldCheckers = this.getFieldCheckers(schema);
                var args = {
                    value: entity[field],
                    fieldPath: fieldPath,
                    schema: schema
                };
                // 传入实体对应字段值、字段路径、字段定义、检查器集合，
                // 检查该字段的值是否满足定义的要求
                var result = excuteCheckers(fieldCheckers, args);

                // 若返回值不是true，说明该字段值不满足定义中的某个规则，直接return
                if (result !== true) {
                    errors.push(result);
                    return;
                }

                var typeOption = schema[2] || {};
                var fieldType = schema[0];

                // field值为对象类型，如果之前的检查没错误，就递归检查
                if ('object' === fieldType) {
                    // 若该字段值不存在，没有进行下去的必要了
                    if (!entity[field]) {
                        return;
                    }

                    // 复制一份路径，以免影响到上一层的路径数据
                    var localPath = path.slice();
                    localPath.push(field);
                    actualValidate.call(this, typeOption.content, entity[field], localPath);
                }
                // field为数组类型，并且通过了之前的检查，这里对每项递归检查
                else if ('array' === fieldType) {
                    // 若该字段值不存在，不用递归检查了
                    var value = entity[field];
                    if (!value) {
                        return;
                    }

                    for (var i = 0; i < value.length; i++) {
                        var itemSchema = {};
                        // 为了拼出形如deliveries.1的字段名
                        itemSchema[i] = typeOption.item;

                        // 复制一份路径，以免影响到上一层的路径数据
                        var localPath = path.slice();
                        localPath.push(field);
                        actualValidate.call(this, itemSchema, value, localPath);
                    }
                }
            }
        };

        function excuteCheckers(fieldCheckers, checkerOptions) {
            var result = true;
            var value = checkerOptions.value;
            var fieldPath = checkerOptions.fieldPath;
            var schema = checkerOptions.schema;

            for (var i = 0; i < fieldCheckers.length; i++) {
                result = fieldCheckers[i].check(value, fieldPath, schema);

                if (result !== true) {
                    break;
                }
            }

            return result;
        }

        /**
         * 异步解析字段定义中的预定义规则字段，主要用于解析enum类型字段的datasource
         *
         * @param {object} options
         * @param {string} options.field, 字段名
         * @param {array} options.schema, 字段定义
         * @param {object} options.entity, 实体
         * @param {array} options.path，路径数组
         * @param {array} options.errors, 错误信息集合
         * @param {object} options._this, 指向{EntityValidator}对象
         * @return {er.Promise} 完成后参数包含解析后的定义schema
         * @ignore
         */        
        function asyncParseSchema(options) {
            var deferred = new Deferred();

            var schema = options.schema;
            
            if ('enum' === schema[0]) {
                var typeOption = schema[2];
                var datasource = typeOption.datasource;
                var index = datasource.lastIndexOf('/');
                var moduleId = datasource.substring(0, index);
                var conditionName = datasource.substring(index + 1);

                require(
                    [moduleId],
                    function (enumObject) {
                        typeOption.datasource = enumObject[conditionName];
                        deferred.resolve(options);
                    }
                );   
            }

            return deferred.promise;
        }

        /**
         * 同步解析字段定义中的预定义规则字段，包括maxLength, minLength
         * min, max, pattern, 当其值为以'@'为前缀的字符串时，进行解析
         *
         * @param {object} options
         * @param {string} options.field, 字段名
         * @param {array} options.schema, 字段定义
         * @param {object} options.entity, 实体
         * @param {array} options.path，路径数组
         * @param {array} options.errors, 错误信息集合
         * @param {object} options._this, 指向{EntityValidator}对象
         * @return {object} 包含解析后的定义schema的对象
         * @ignore
         */
        function syncParseSchema(options) {
            var schema = options.schema;
            var typeOption = schema[2];

            // 
            if (!typeOption) {
                return options;
            }

            // 可能需要被解析的规则集
            var ruleName = [
                'maxLength', 'minLength',
                'min', 'max',
                'pattern'
            ];
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

            return options;
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
         * @param {array} fieldSchema为字段定义
         * @return {array} 检验器对象组成的有序数组
         */
        EntityValidator.prototype.getFieldCheckers = function (fieldSchema) {
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
         * @param {array} schema, 字段的定义
         * @return {array} 检验器名组成的数组
         * @ignore
         */
        function getFieldCheckerNames(schema) {
            // 与字段校验无关的属性
            var keys = ['content', 'item'];
            var checkerNames = [];
            var fieldType = schema[0];
            var typeOption = schema[2] || {};

            // 非枚举类型的datasource属性不作为检验器
            if ('enum' !== fieldType) {
                keys.push('datasource');
            }

            // 处理required为false的情况
            typeOption = u.omit(typeOption, keys);
            if (false === typeOption.required) {
                delete typeOption.required;
            }

            [].push.apply(checkerNames, u.keys(typeOption));

            // enum类型字段增加enum检验器
            if ('enum' === fieldType) {
                checkerNames.push('enum');
            }

            // reference、referen-set类型字段不做类型检查
            if ('reference' !== fieldType && 'reference-set' !== fieldType) {
                checkerNames.push('type');
            }

            // maxLength、minLength同时存在的情况下使用rangeLength检验器
            if (u.indexOf(checkerNames, 'minLength') >= 0
                && u.indexOf(checkerNames, 'maxLength') >= 0
            ) {
                checkerNames = u.without(checkerNames, 'minLength', 'maxLength');
                checkerNames.push('rangeLength');
            }

            // max、min同时存在的情况下使用range检验器
            if (u.indexOf(checkerNames, 'min') >= 0
                && u.indexOf(checkerNames, 'max') >= 0
            ) {
                checkerNames = u.without(checkerNames, 'min', 'max');
                checkerNames.push('range');
            }

            return checkerNames;
        }

        return EntityValidator;
    }
);