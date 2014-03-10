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
            // ie系列在获取子节点引用后，设置父元素 innerHTML，会将子元素的内容清空
            // 所以先从父元素移除节点
            var titleElem = children[0] && this.main.removeChild(children[0]);
            var contentElem = children[1] && this.main.removeChild(children[1]);
            var tmpDiv = document.createElement('div');


            this.main.innerHTML = getPanelHTML(this);
            this.helper.initChildren();

            var titlePanel = this.getChild('title');
            titlePanel.helper.addDOMEvent(titlePanel.main, 'click', lib.bind(onToggle, this));

            if (titleElem) {
                var title = titleElem.outerHTML;
                if (!title) {
                    tmpDiv.appendChild(titleElem);
                    title = tmpDiv.innerHTML;
                    tmpDiv.removeChild(titleElem);
                }
                this.set('title', title)
            }

            if (contentElem) {
                var content = contentElem.outerHTML;
                if (!content) {
                    tmpDiv.appendChild(contentElem);
                    content = tmpDiv.innerHTML;
                    tmpDiv.removeChild(contentElem);
                }
                this.set('content', content);
            }
        };

        function getPanelHTML(control) {
            var title = control.helper.getPartClassName('title');
            var content = control.helper.getPartClassName('content');

            // 因为 Label 仅暴露 text 接口，所以这里的 title用 Panel 代替
            return '<div data-ui-type="Panel" data-ui-child-name="title" class="' + title
                + '"></div><div data-ui-type="Panel" data-ui-child-name="content" class="'
                + content + '"></div>';
        }


        function onToggle() {
            this.toggleState('expanded');
            this.fire('change');
        }

        var painters = require('esui/painters');
        /**
         * 重绘
         *
         * @override
         * @protected
         */
        TogglePanel.prototype.repaint = painters.createRepaint(
            Control.prototype.repaint,
            painters.state('expanded'),
            {
                name: 'title',
                paint: function (panel, title) {
                    panel.getChild('title').set('content', title);
                }
            },
            {
                name: 'content',
                paint: function (panel, content) {
                    panel.getChild('content').set('content', content);
                }
            }
        );

        lib.inherits(TogglePanel, Control);
        ui.register(TogglePanel);
        return TogglePanel;
    }
);
