/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 计算文本框可输入字符的扩展
 * @author otakustay
 */
define(
    function (require) {
        var lib = require('esui/lib');
        var Validity = require('esui/validator/Validity');

        /**
         * 计算文本框可输入字符的扩展
         *
         * @class ui.extension.WordCount
         * @extends esui.Extension
         */
        var exports = {};

        /**
         * 扩展的类型，始终为`"WordCount"`
         *
         * @member ui.extension.WordCount#type
         * @type {string}
         * @readonly
         * @override
         */
        exports.type = 'WordCount';

        /**
         * 设置未输入字符时的提示信息模板，可用以下占位符：
         *
         * - `${available}`：表示可输入字符个数
         * - `${current}`：表示已输入的字符个数
         * - `${max}`：表示最大可输入字符个数
         *
         * @member ui.extension.WordCount#initialTemplate
         * @type {string}
         */
        exports.initialTemplate = '最多可输入${available}个字符';

        /**
         * 设置还可以输入字符时的提示信息模板，可用以下占位符：
         *
         * - `${available}`：表示剩余字符个数
         * - `${current}`：表示已输入的字符个数
         * - `${max}`：表示最大可输入字符个数
         *
         * @member ui.extension.WordCount#remainingTemplate
         * @type {string}
         */
        exports.remainingTemplate = '还可输入${available}个字符';

        /**
         * 设置已超出可输入字符限制时的提示信息模板，可用以下占位符：
         *
         * - `${available}`：表示超出的字符数
         * - `${current}`：表示已输入的字符个数
         * - `${max}`：表示最大可输入字符个数
         *
         * @member ui.extension.WordCount#exceededTemplate
         * @type {string}
         */
        exports.exceededTemplate = '已超出${available}个字符';

        /**
         * 获取提示信息
         *
         * @protected
         * @method ui.extension.WordCount#getHintMessage
         * @param {Object} data 长度计算的相关数据
         * @param {number} data.available 还可输入的字符个数，已超出时为负数
         * @param {number} data.current 已经输入的字符个数
         * @param {number} data.max 最大可输入的字符个数
         * @return {string}
         */
        exports.getHintMessage = function (data) {
            var template;
            if (!data.current) {
                template = this.initialTemplate;
            }
            else if (data.available >= 0) {
                template = this.remainingTemplate;
            }
            else {
                template = this.exceededTemplate;
                data.available = -data.available;
            }

            return lib.format(template, data);
        };

        /**
         * 获取最大可输入字符数
         *
         * @protected
         * @method ui.extension.WordCount#getMaxLength
         * @return {number}
         */
        exports.getMaxLength = function () {
            if (+this.target.get('maxLength') === -1) {
                return this.target.get('length');
            }
            return this.target.get('maxLength');
        };

        /**
         * 检查长度并显示提示信息
         */
        function checkLength() {
            var maxLength = this.getMaxLength();
            var currentLength = this.target.getValue().length;

            var data = {
                max: maxLength,
                current: currentLength,
                available: maxLength - currentLength
            };

            var validState = data.available < 0 ? 'error' : 'hint';
            var message = this.getHintMessage(data);

            var validity = new Validity();
            validity.setCustomValidState(validState);
            validity.setCustomMessage(message);

            this.target.showValidity(validity);
        }

        /**
         * @override
         */
        exports.activate = function () {
            var maxLength = this.getMaxLength();

            if (maxLength) {
                this.target.on('input', checkLength, this);
                this.target.on('afterrender', checkLength, this);
            }

            this.$super(arguments);
        };

        /**
         * @override
         */
        exports.inactivate = function () {
            this.target.un('input', checkLength, this);
            this.target.un('afterrender', checkLength, this);

            this.$super(arguments);
        };

        var Extension = require('esui/Extension');
        var WordCount = require('eoo').create(Extension, exports);

        require('esui').registerExtension(WordCount);

        return WordCount;
    }
);
