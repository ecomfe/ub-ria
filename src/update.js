/**
 * UB RIA Base
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 对象更新辅助方法
 * @author otakustay
 */
define(
    function (require) {
        var u = require('./util');

        var AVAILABLE_COMMANDS = {
            $set: function (oldValue, newValue) {
                return newValue;
            },

            $push: function (oldValue, newValue) {
                var result = oldValue.slice();
                result.push(newValue);
                return result;
            },

            $unshift: function (oldValue, newValue) {
                var result = oldValue.slice();
                result.unshift(newValue);
                return result;
            },

            $merge: function (oldValue, newValue) {
                return u.extend({}, oldValue, newValue);
            }
        };

        /**
         * 根据给定的指令更新一个对象的属性，并返回更新后的新对象，原对象不会被修改
         *
         * 指令支持以下几种：
         *
         * - `$set`用于更新属性的值
         * - `$push`用于向类型为数组的属性最后位置添加值
         * - `$unshift`用于向类型为数组的属性最前位置添加值
         * - `$merge`用于在原对象上合并新属性
         *
         * 可以一次使用多个指令更新对象：
         *
         * ```javascript
         * var newObject = update(
         *     source,
         *     {
         *         foo: {bar: {$set: 1}},
         *         alice: {$push: 1},
         *         tom: {jack: {$set: {x: 1}}
         *     }
         * );
         * ```
         *
         * @param {Object} source 需要更新的原对象
         * @param {Object} commands 更新的指令
         * @return {Object} 更新了属性的新对象
         */
        var update = function (source, commands) {
            var result = Object.keys(commands).reduce(
                function (result, key) {
                    var propertyCommand = commands[key];
                    // 如果有我们支持的指令，则是针对这一个属性的指令，直接操作
                    var isCommand = u.any(
                        AVAILABLE_COMMANDS,
                        function (execute, command) {
                            if (propertyCommand.hasOwnProperty(command)) {
                                result[key] = execute(result[key], propertyCommand[command]);
                                return true;
                            }
                            return false;
                        }
                    );
                    // 如果没有任何指令，说明是多层的，所以递归
                    if (!isCommand) {
                        result[key] = update(result[key] || {}, propertyCommand);
                    }

                    return result;
                },
                u.clone(source)
            );

            return result;
        };

        function buildPathObject(path, value) {
            if (typeof path === 'string') {
                path = [path];
            }

            var result = {};
            var current = result;
            for (var i = 0; i < path.length - 1; i++) {
                current = current[path[i]] = {};
            }
            current[path[path.length - 1]] = value;
            return result;
        }

        /**
         * 快捷更新属性的方法，效果相当于使用`update`方法传递`$set`指令
         *
         * @protected
         * @param {Object} source 待更新的原对象
         * @param {string|Array.<string>} path 属性路径，当路径深度大于1时使用数组
         * @param {*} value 更新的值
         * @return {Object} 更新后的新对象
         */
        update.set = function (source, path, value) {
            return update(source, buildPathObject(path, {$set: value}));
        };

        /**
         * 快捷更新属性的方法，效果相当于使用`update`方法传递`$push`指令
         *
         * @protected
         * @param {Object} source 待更新的原对象
         * @param {string|Array.<string>} path 属性路径，当路径深度大于1时使用数组
         * @param {*} value 更新的值
         * @return {Object} 更新后的新对象
         */
        update.push = function (source, path, value) {
            return update(source, buildPathObject(path, {$push: value}));
        };

        /**
         * 快捷更新属性的方法，效果相当于使用`update`方法传递`$unshift`指令
         *
         * @protected
         * @param {Object} source 待更新的原对象
         * @param {string|Array.<string>} path 属性路径，当路径深度大于1时使用数组
         * @param {*} value 更新的值
         * @return {Object} 更新后的新对象
         */
        update.unshift = function (source, path, value) {
            return update(source, buildPathObject(path, {$unshift: value}));
        };

        /**
         * 快捷更新属性的方法，效果相当于使用`update`方法传递`$merge`指令
         *
         * @protected
         * @param {Object} source 待更新的原对象
         * @param {string|Array.<string>} path 属性路径，当路径深度大于1时使用数组
         * @param {*} value 更新的值
         * @return {Object} 更新后的新对象
         */
        update.merge = function (source, path, value) {
            return update(source, buildPathObject(path, {$merge: value}));
        };

        return update;
    }
);
