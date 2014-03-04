/**
 * ESUI (Enterprise Simple UI)
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 折叠控件
 * @author wangyaqiong
 */

define(
    function (require) {
        var Control = require('esui/Control');
        var lib = require('esui/lib');
        var ui = require('esui');

        require('esui/Panel');

        var EMPTY = {};

        /**
         * 折叠控件
         */
        function TogglePanel() {
            Control.apply(this, arguments);
        }

        TogglePanel.prototype.type = 'TogglePanel';

        /**
         * 初始化参数
         *
         * @param {Object} options 构造函数传入的参数
         * @override
         * @protected
         */
        TogglePanel.prototype.initOptions = function (options) {
            var defaults = {
                title: EMPTY,
                content: EMPTY,
                expanded: false
            };

            var properties = lib.extend(defaults, options);

            this.setProperties(properties);
        };

        /**
         * 初始化DOM结构
         *
         * @override
         * @protected
         */
        TogglePanel.prototype.initStructure = function () {
            var children = lib.getChildren(this.main);
            var titleElem = children[0];
            var contentElem = children[1];

            this.main.innerHTML = getPanelHTML(this);
            this.initChildren();

            var titlePanel = this.getChild('title');
            titlePanel.helper.addDOMEvent(titlePanel.main, 'click', lib.bind(this.toggle, this));

            titleElem && titlePanel.main.appendChild(titleElem);
            contentElem && this.getChild('content').main.appendChild(contentElem);
        };

        function getPanelHTML(control) {
            var title = control.helper.getPartClassName('title');
            var content = control.helper.getPartClassName('content');

            //因为 Label 仅暴露 text 接口，所以这里的 title用 Panel 代替
            return '<div data-ui-type="Panel" data-ui-child-name="title" class="' + title
                + '"></div><div data-ui-type="Panel" data-ui-child-name="content" class="'
                + content + '"></div>';
        }

        /**
         * 重绘
         *
         * @override
         * @protected
         */
        TogglePanel.prototype.repaint = require('esui/painters').createRepaint(
            Control.prototype.repaint,
            {
                name: 'title',
                paint: function (panel, title) {
                    if (title !== EMPTY) {
                        panel.getChild('title').set('content', title);
                    }
                }
            },
            {
                name: 'content',
                paint: function (panel, content) {
                    if (content !== EMPTY) {
                        panel.getChild('content').set('content', content);
                    }
                }
            },
            {
                name: 'expanded',
                paint: function (panel, expanded) {
                    var method = expanded ? 'addState' : 'removeState';
                    panel[method]('expanded');
                }
            }
        );

        /**
         * 获取是否展开状态
         *
         * @return {boolean}
         */
        TogglePanel.prototype.isExpanded = function () {
            return this.hasState('expanded');
        };

        /**
         * 切换展开/收起状态
         */
        TogglePanel.prototype.toggle = function () {
            this.toggleState('expanded');
            this.fire('change');
        };

        lib.inherits(TogglePanel, Control);
        ui.register(TogglePanel);
        return TogglePanel;
    }
);
