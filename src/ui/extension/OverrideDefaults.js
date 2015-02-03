/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 重写控件默认配置用的扩展
 * @author otakustay
 */
define(
    function (require) {
        var u = require('../../util');

        /**
         * 重写控件默认配置用的扩展
         *
         * @class ui.extension.OverrideDefaults
         * @extends esui.Extension
         */
        var exports = {};

        /**
         * 扩展的类型，始终为`"OverrideDefaults"`
         *
         * @type {string}
         * @override
         */
        exports.type = 'OverrideDefaults';

        /**
         * @override
         */
        exports.activate = function () {
            this.target.on('init', onInit, this);

            this.$super(arguments);
        };

        /**
         * @override
         */
        exports.inactivate = function () {
            this.target.un('init', onInit, this);

            this.$super(arguments);
        };

        function onInit(e) {
            this.overrideDefaults(e.options);
        }

        /**
         * 重写默认属性
         *
         * @protected
         * @method ui.extension.OverrideDefaults#overrideDefaults
         * @param {Object} [rawOptions] 初始化控件时传入的参数
         */
        exports.overrideDefaults = function (rawOptions) {
            // 只有初始化时没有显式指定的才覆盖
            var overrides = u.omit(this.overrides[this.target.type], u.keys(rawOptions || {}));
            if (overrides) {
                this.target.setProperties(overrides);
            }
        };

        var Extension = require('esui/Extension');
        var OverrideDefaults = require('eoo').create(Extension, exports);

        require('esui').registerExtension(OverrideDefaults);

        return OverrideDefaults;
    }
);
