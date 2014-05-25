/**
 * ESUI (Enterprise Simple UI)
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 选择框组
 * @author otakustay
 */
define(
    function (require) {
        var u = require('underscore');
        var lib = require('esui/lib');
        var painter = require('esui/painters');
        var Control = require('esui/Control');

        /**
         * 单选或复选框组控件
         *
         * @extends InputControl
         * @constructor
         */
        function Anchor() {
            Control.apply(this, arguments);
        }

        /**
         * 控件类型，始终为`"BoxGroup"`
         *
         * @type {string}
         * @readonly
         * @override
         */
        Anchor.prototype.type = 'Anchor';
        /**
         * 初始化DOM结构
         *
         * @protected
         * @override
         */
        Anchor.prototype.initStructure = function () {
            this.main.innerHTML = u.template(
                '<input type="text" id="${id}" />',
                {
                    id: this.helper.getId('focus-field')
                }
            );

            this.main.style.display = 'none';
            this.main.style.paddingTop = '100px';
        };

        Anchor.prototype.focus = function(org) {
            var orgInput = u.isObject(org)
                                ? org : lib.g(org); 
            var inputId = lib.g( this.helper.getId('focus-field') );

            this.main.style.display = 'block';
            inputId.focus();
            inputId.blur();
            this.main.style.display = 'none';

            orgInput && orgInput.focus && orgInput.focus();
        }

        lib.inherits(Anchor, Control);
        require('esui/main').register(Anchor);
        return Anchor;
    }
);
