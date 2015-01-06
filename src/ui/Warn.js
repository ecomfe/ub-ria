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
        var helper = require('esui/controlHelper');
        var Control = require('esui/Control');

        /**
         * Warn控件
         *
         * @param {Object} [options] 初始化参数
         * @extends esui.Control
         * @constructor
         */
        function Warn(options) {
            Control.apply(this, arguments);
        }

        lib.inherits(Warn, Control);

        Warn.defaultProperties = {
            okLabel: '取消新建',
            cancelLabel: '继续新建'
        };

        Warn.prototype.type = 'Warn';

        /**
         * 初始化参数
         *
         * @param {Object=} options 构造函数传入的参数
         * @override
         */
        Warn.prototype.initOptions = function (options) {
            var properties = {};
            lib.extend(properties, Warn.defaultProperties, options);
            if (properties.content == null) {
                properties.content = this.main.innerHTML;
            }

            this.setProperties(properties);
        };

        var tempalte = '<div class="${iconClass}"></div>'
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
         * 初始化结构
         *
         * @override
         */
        Warn.prototype.initStructure = function () {
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
         * 渲染自身
         *
         * @override
         */
        Warn.prototype.repaint = helper.createRepaint(
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
         * 隐藏提示信息
         *
         * @override
         */
        Warn.prototype.hide = function () {
            this.fire('hide');
            this.dispose();
        };

        /**
         * 销毁控件
         *
         * @override
         */
        Warn.prototype.dispose = function () {
            if (helper.isInStage(this, 'DISPOSED')) {
                return;
            }

            Control.prototype.dispose.apply(this, arguments);

            lib.removeNode(this.main);
        };

        /**
         * 快捷显示信息的方法
         *
         * @parma {string} content 显示的内容
         * @param {Object} options 其它配置项
         * @return {ui.Warn}
         */
        Warn.show = function (options) {
            var warn = new Warn(options);
            warn.appendTo(options.wrapper || document.body);
            return warn;
        };

        require('esui').register(Warn);
        return Warn;
    }
);
