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
            this.target.on('init', this.overrideDefaults, this);

            this.$super(arguments);
        };

        /**
         * @override
         */
        exports.inactivate = function () {
            this.target.un('init', this.overrideDefaults, this);

            this.$super(arguments);
        };

        /**
         * 重写默认属性
         *
         * @protected
         * @method ui.extension.OverrideDefaults#overrideDefaults
         */
        exports.overrideDefaults = function () {
            var overrides = this.overrides[this.target.type];
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
