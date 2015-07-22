/**
 * UB RIA Base
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 对象更新辅助方法
 * @author otakustay
 */

import u from './util';

const AVAILABLE_COMMANDS = {
    $set(oldValue, newValue) {
        return newValue;
    },

    $push(oldValue, newValue) {
        let result = oldValue.slice();
        result.push(newValue);
        return result;
    },

    $unshift(oldValue, newValue) {
        let result = oldValue.slice();
        result.unshift(newValue);
        return result;
    },

    $merge(oldValue, newValue) {
        return u.extend({}, oldValue, newValue);
    },

    $invoke(oldValue, factory) {
        return factory(oldValue);
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
 * - `$invoke`用于执行一个函数获取新的属性值，该函数接收旧的属性值作为唯一的参数
 *
 * 可以一次使用多个指令更新对象：
 *
 * ```javascript
 * let newObject = run(
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
export function run(source, commands) {
    // 可能是第一层的指令，直接对原数据进行处理，不访问任何属性
    let possibleFirstLevelCommand = u.find(Object.keys(AVAILABLE_COMMANDS), ::commands.hasOwnProperty);
    if (possibleFirstLevelCommand) {
        return AVAILABLE_COMMANDS[possibleFirstLevelCommand](source, commands[possibleFirstLevelCommand]);
    }

    let result = Object.keys(commands).reduce(
        (result, key) => {
            let propertyCommand = commands[key];
            // 如果有我们支持的指令，则是针对这一个属性的指令，直接操作
            let isCommand = u.any(
                AVAILABLE_COMMANDS,
                (execute, command) => {
                    if (propertyCommand.hasOwnProperty(command)) {
                        result[key] = execute(result[key], propertyCommand[command]);
                        return true;
                    }
                    return false;
                }
            );
            // 如果没有任何指令，说明是多层的，所以递归
            if (!isCommand) {
                result[key] = run(result[key] || {}, propertyCommand);
            }

            return result;
        },
        u.clone(source)
    );

    return result;
}

function buildPathObject(path, value) {
    if (!path) {
        return value;
    }

    if (typeof path === 'string') {
        path = [path];
    }

    let result = {};
    let current = result;
    for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]] = {};
    }
    current[path[path.length - 1]] = value;
    return result;
}

/**
 * 快捷更新属性的方法，效果相当于使用`update`方法传递`$set`指令
 *
 * @param {Object} source 待更新的原对象
 * @param {string|Array.<string>} path 属性路径，当路径深度大于1时使用数组
 * @param {*} value 更新的值
 * @return {Object} 更新后的新对象
 */
export function set(source, path, value) {
    return run(source, buildPathObject(path, {$set: value}));
}

/**
 * 快捷更新属性的方法，效果相当于使用`update`方法传递`$push`指令
 *
 * @param {Object} source 待更新的原对象
 * @param {string|Array.<string>} path 属性路径，当路径深度大于1时使用数组
 * @param {*} value 更新的值
 * @return {Object} 更新后的新对象
 */
export function push(source, path, value) {
    return run(source, buildPathObject(path, {$push: value}));
}

/**
 * 快捷更新属性的方法，效果相当于使用`update`方法传递`$unshift`指令
 *
 * @param {Object} source 待更新的原对象
 * @param {string|Array.<string>} path 属性路径，当路径深度大于1时使用数组
 * @param {*} value 更新的值
 * @return {Object} 更新后的新对象
 */
export function unshift(source, path, value) {
    return run(source, buildPathObject(path, {$unshift: value}));
}

/**
 * 快捷更新属性的方法，效果相当于使用`update`方法传递`$merge`指令
 *
 * @param {Object} source 待更新的原对象
 * @param {string|Array.<string>} path 属性路径，当路径深度大于1时使用数组
 * @param {Object} value 更新的值
 * @return {Object} 更新后的新对象
 */
export function merge(source, path, value) {
    return run(source, buildPathObject(path, {$merge: value}));
}

/**
 * 快捷更新属性的方法，效果相当于使用`update`方法传递`$invoke`指令
 *
 * @param {Object} source 待更新的原对象
 * @param {string|Array.<string>} path 属性路径，当路径深度大于1时使用数组
 * @param {Function} factory 产生新属性值的工厂函数，接受旧属性值为参数
 * @return {Object} 更新后的新对象
 */
export function invoke(source, path, factory) {
    return run(source, buildPathObject(path, {$invoke: factory}));
}
