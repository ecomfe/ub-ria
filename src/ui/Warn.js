/**
 * UB RIA Base
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file 简易信息提示控件
 * @author lixiang
 */
define(
    function (require) {
        var lib = require('esui/lib');
        var Control = require('esui/Control');

        /**
         * Warn控件
         *
         * @class ui.Warn
         * @extends esui.Control
         */
        var exports = {};

        /**
         * 控件类型，始终为`"Warn"`
         *
         * @member ui.Warn#type
         * @type {string}
         * @readonly
         * @override
         */
        exports.type = 'Warn';

        /**
         * @override
         */
        exports.initOptions = function (options) {
            var properties = {};
            lib.extend(properties, this.$self.defaultProperties, options);
            if (properties.content == null) {
                properties.content = this.main.innerHTML;
            }

            this.setProperties(properties);
        };

        var tempalte = '<i class="${iconClass} ui-icon ui-icon-question-circle"></i>'
                     + '<div class="${contentClass}" id="${contentId}"></div>'
                     + '<div class="${operationFieldClass}">'
                     + '    <esui-button class="${okBtnClass}" data-ui="childName:btnOk;">${okLabel}</esui-button>'
                     + '    <esui-button class="${cancelBtnClass}" data-ui="childName:btnCancel;">'
                     + '    ${cancelLabel}</esui-button>'
                     + '</div>';


        function btnClickHandler(warn, type) {
            // 如果在参数里设置了处理函数，会在fire时执行
            warn.fire(type);
            if (type === 'ok') {
                warn.dispose();
            }
            else {
                warn.hide();
            }
        }

        /**
         * @override
         */
        exports.initStructure = function () {
            this.main.innerHTML = lib.format(
                tempalte,
                {
                    iconClass: this.helper.getPartClassName('icon'),
                    contentId: this.helper.getId('content'),
                    contentClass: this.helper.getPartClassName('content'),
                    okBtnClass: this.helper.getPartClassName('ok-btn'),
                    cancelBtnClass: this.helper.getPartClassName('cancel-btn'),
                    okLabel: this.okLabel,
                    cancelLabel: this.cancelLabel,
                    operationFieldClass: this.helper.getPartClassName('operation-field')
                }
            );

            this.initChildren();

            this.getChild('btnOk').on(
                'click',
                lib.curry(btnClickHandler, this, 'ok')
            );
            this.getChild('btnCancel').on(
                'click',
                lib.curry(btnClickHandler, this, 'cancel')
            );

        };

        /**
         * @override
         */
        exports.repaint = require('esui/painters').createRepaint(
            Control.prototype.repaint,
            {
                name: 'content',
                paint: function (control, content) {
                    var container = control.helper.getPart('content');
                    container.innerHTML = content;
                }
            }
        );

        /**
         * @override
         */
        exports.hide = function () {
            this.fire('hide');
            this.dispose();
        };

        /**
         * @override
         */
        exports.dispose = function () {
            if (this.helper.isInStage('DISPOSED')) {
                return;
            }

            this.$super(arguments);

            lib.removeNode(this.main);
        };

        var Warn = require('eoo').create(Control, exports);

        /**
         * 快捷显示信息的方法
         *
         * @method ui.Warn.show
         * @param {Object} options 其它配置项
         * @return {ui.Warn}
         */
        Warn.show = function (options) {
            var warn = new Warn(options);
            warn.appendTo(options.wrapper || document.body);
            return warn;
        };

        Warn.defaultProperties = {
            okLabel: '取消新建',
            cancelLabel: '继续新建'
        };

        require('esui').register(Warn);
        return Warn;
    }
);
