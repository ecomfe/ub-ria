/**
 * ADM 2.0
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file ToggleButton控件
 * @author zhanglili(otakustay@gmail.com)
 */
define(
    function (require) {
        var lib = require('esui/lib');
        var InputControl = require('esui/InputControl');

        /**
         * ToggleButton控件
         *
         * @param {Object} [options] 初始化参数
         * @extends esui.InputControl
         * @constructor
         * @public
         */
        function ToggleButton(options) {
            InputControl.apply(this, arguments);
        }

        ToggleButton.prototype.type = 'ToggleButton';

        ToggleButton.prototype.getCategory = function () {
            return 'check';
        };

        /**
         * 创建主元素
         *
         * @return {HTMLElement}
         * @override
         * @protected
         */
        ToggleButton.prototype.createMain = function () {
            return document.createElement('div');
        };

        /**
         * 初始化参数
         *
         * @param {Object=} options 构造函数传入的参数
         * @override
         * @protected
         */
        ToggleButton.prototype.initOptions = function (options) {
            // 亲，看到这行代码的时候你有想过吗，按钮文字应该表示状态还是表示操作
            var properties = {
                onText: 'ON',
                offText: 'OFF',
                checked: false
            };
            lib.extend(properties, options);

            if (!properties.title) {
                properties.title = this.main.title;
            }

            if (lib.isInput(this.main)) {
                this.helper.extractOptionsFromInput(this.main, properties);
            }
            else {
                var children = lib.getChildren(this.main);
                if (children.length > 1) {
                    if (!options.onText) {
                        properties.onText = lib.getText(children[0]);
                    }
                    if (!options.offText) {
                        properties.offText = lib.getText(children[1]);
                    }
                }
            }

            InputControl.prototype.initOptions.call(this, properties);
        };

        function getPartHTML(button, part) {
            var id = button.helper.getId(part);
            var classes = button.helper.getPartClassName('part-' + part);
            var html = '<span id="' + id + '" class="' + classes + '"></span>';
            return html;
        }

        ToggleButton.prototype.initStructure = function () {
            this.main.innerHTML = getPartHTML(this, 'on') + getPartHTML(this, 'off');

            this.helper.addDOMEvent(
                this.main,
                'click',
                lib.bind(this.toggle, this)
            );
        };

        var paint = require('esui/painters');
        /**
         * 渲染自身
         *
         * @override
         * @protected
         */
        ToggleButton.prototype.repaint = paint.createRepaint(
            InputControl.prototype.repaint,
            paint.text('onText', 'on'),
            paint.text('offText', 'off'),
            paint.attribute('title'),
            paint.style('width'),
            paint.style('height'),
            paint.state('checked')
        );

        ToggleButton.prototype.setProperties = function () {
            if (this.hasOwnProperty('checked')) {
                this.checked = !!this.checked;
            }

            var changed =
                InputControl.prototype.setProperties.apply(this, arguments);
            if (changed.hasOwnProperty('checked')) {
                this.fire('change');
            }
        };

        /**
         * 获取是否选中
         *
         * @return {boolean}
         */
        ToggleButton.prototype.isChecked = function () {
            return this.checked;
        };

        /**
         * 切换状态
         *
         * @public
         */
        ToggleButton.prototype.toggle = function () {
            this.set('checked', !this.checked);
        };

        lib.inherits(ToggleButton, InputControl);
        require('esui').register(ToggleButton);
        return ToggleButton;
    }
);
