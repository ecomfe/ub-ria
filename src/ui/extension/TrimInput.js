/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 文本框控件自动去除首尾空格
 * @author lixiang(lixiang05@baidu.com)
 */
define(
    function (require) {
        var lib = require('esui/lib');
        var TextBox = require('esui/TextBox');
        var Extension = require('esui/Extension');
        var main = require('esui/main');

        var exports = {};

        exports.type = 'TrimInput';

        /**
         * 激活扩展
         *
         * @override
         */
        exports.activate = function () {
            var target = this.target;
            // 暂时只对`TextBox`控件生效
            if (!(target instanceof TextBox)) {
                return;
            }

            target.on('afterrender', trim, this);
            target.on('change', trim, this);
            this.$super(arguments);
        };

        /**
         * 取消扩展的激活状态
         *
         * @override
         */
        exports.inactivate = function () {
            var target = this.target;
            // 只对`TextBox`控件生效
            if (!(target instanceof TextBox)) {
                return;
            }

            target.un('afterrender', trim, this);
            target.un('change', trim, this);
            this.$super(arguments);
        };

        function trim() {
            var trimedValue = lib.trim(this.target.getValue());
            this.target.setValue(trimedValue);
        }

        var TrimInput = require('eoo').create(Extension, exports);
        main.registerExtension(TrimInput);

        return TrimInput;
    }
);
