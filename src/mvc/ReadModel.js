/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 只读页数据模型基类
 * @author otakustay
 * @date $DATE$
 */
define(
    function (require) {
        var util = require('er/util');
        var SingleEntityModel = require('./SingleEntityModel');

        /**
         * 只读页数据模型基类
         *
         * @extends SingleEntityModel
         * @constructor
         */
        function ReadModel(entityName, context) {
            SingleEntityModel.apply(this, arguments);
        }

        util.inherits(ReadModel, SingleEntityModel);

        // 全局所有Model都可能有的属性名，这些属性不需要被自动转为`'--'`
        var GLOBAL_MODEL_PROPERTIES = {
            toast: true,
            url: true,
            referrer: true,
            isChildAction: true,
            container: true,
            entity: true
        };

        /**
         * 字段无值时的默认显示文本，默认为`"--"`
         *
         * @type {string}
         */
        ReadModel.prototype.defaultDisplayText = '--';

        /**
         * 获取属性值
         *
         * @param {string} name 属性名称
         * @return {Mixed} 对应属性的值，
         * 如果不存在属性则返回{@link ReadModel#defaultDisplayText}
         * @override
         */
        ReadModel.prototype.get = function (name) {
            var value = SingleEntityModel.prototype.get.call(this, name);

            if (GLOBAL_MODEL_PROPERTIES.hasOwnProperty(name)) {
                return value;
            }

            return this.hasReadableValue(name)
                ? value
                : this.defaultDisplayText;
        };

        return ReadModel;
    }
);
