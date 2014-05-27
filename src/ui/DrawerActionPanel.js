/**
 * ADM 2.0
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 简易信息提示控件
 * @author zhanglili(otakustay@gmail.com)
 */
define(
    function (require) {
        var lib = require('esui/lib');
        var helper = require('esui/controlHelper');
        var ActionPanel = require('ef/ActionPanel');
        var u = require('underscore');


        var maskIdPrefix = 'ctrl-mask';

        var panelIndex = 1000;

        /**
         * DrawerActionPanel控件
         *
         * @param {Object=} options 初始化参数
         * @extends esui/Control
         * @constructor
         * @public
         */
        function DrawerActionPanel(options) {
            ActionPanel.apply(this, arguments);
        }

        DrawerActionPanel.prototype.type = 'DrawerActionPanel';

        DrawerActionPanel.defaultProperties = {
            left: 0,
            minWidth: 800
        };

        /**
         * 初始化参数
         *
         * @param {Object} [options] 构造函数传入的参数
         * @protected
         * @override
         */
        DrawerActionPanel.prototype.initOptions = function (options) {
            ActionPanel.prototype.initOptions.apply(this, arguments);

            var properties = {};

            u.extend(properties, 
                    DrawerActionPanel.defaultProperties,
                    options
            );

            this.setProperties(properties);
        };

        function setTransitionClass(panel) {
            var transitionClass = helper.getPartClasses(panel, 'transition')[0];
            if (panel.transition) {
                lib.addClass(panel.main, transitionClass);
            } else {
                lib.removeClass(panel.main, transitionClass);
            }
        }

        /**
         * 显示遮盖层
         * @param {ui.Dialog} dialog 控件对象
         */
        function showMask(panel, zIndex) {
            var mask = getMask(panel);
            var clazz = [];
            var maskClass = helper.getPartClasses(panel, 'mask').join(' ');
            clazz.push(maskClass);

            mask.className = clazz.join(' ');
            mask.style.display = 'block';
            mask.style.zIndex = zIndex;           
        }


        /**
         * 隐藏遮盖层
         * @param {ui.Dialog} dialog 控件对象
         */
        function hideMask(panel) {
            var mask = getMask(panel);
            if ('undefined' != typeof mask) {
                lib.removeNode(mask);
            }
        }

        /**
         * 遮盖层初始化
         * 
         * @param {string} maskId 遮盖层domId
         * @inner
         */
        function initMask(maskId) {
            var el = document.createElement('div');
            el.id = maskId;
            document.body.appendChild(el);
        }


        /**
         * 获取遮盖层dom元素
         *
         * @param {ui.Dialog} 控件对象
         * @inner
         * @return {HTMLElement} 获取到的Mask元素节点.
         */
        function getMask(control) {
            var panelId = helper.getId(control);
            var id = maskIdPrefix + '-' + panelId;
            var mask = lib.g(id);

            if (!mask) {
                initMask(id);
            }

            return lib.g(id);
        }

        function initPanel() {
            initCloseBtn(this),
            resizePanel.call(this);
        }

        function closePanel() {
            this.hide();
            this.fire('close');
        }

        function resizePanel() {
            if (parseInt(this.main.style.width)) {
                var height = Math.max(this.main.offsetHeight, lib.page.getHeight());
                this.main.style.minHeight = height + 'px';
                this.main.style.width = 
                    Math.max(this.minWidth, lib.page.getWidth() - this.left) + 'px';
            }
        }

        function showPanel(panel) {
            setTransitionClass(panel);

            showMask(panel, panelIndex);
            showCloseBtn(panel);

            panel.main.style.zIndex = ++panelIndex;
            panel.main.style.width = lib.page.getWidth() - panel.left + 'px';
        }

        function hidePanel(panel) {
            hideMask(panel);
            hideCloseBtn(panel);

            setTransitionClass(panel); 

            panel.main.style.width = 0;
            panel.main.style.overflowX = 'hidden';
        }

        function initCloseBtn(panel) {
            var closeId = helper.getId(panel, 'ui-closeBtn');
            var el = document.createElement('div');
            el.id = closeId;
            el.className = helper.getPartClasses(panel, 'close-btn').join(' ');
            panel.main.appendChild(el);

            helper.addDOMEvent(panel, el, 'click', closePanel);
        }

        function getCloseBtn(panel) {
            var closeId = helper.getId(panel, 'ui-closeBtn');
            return lib.g(closeId);
        }

        function showCloseBtn(panel) {
            var closeBtn = getCloseBtn(panel);
            if (closeBtn) {
                closeBtn.style.display = 'block';
            }
        }

        function hideCloseBtn(panel) {
            var closeBtn = getCloseBtn(panel);
            if (closeBtn) {
                closeBtn.style.display = 'none';
            }
        }

        DrawerActionPanel.prototype.show = function(ignoreTransition) {
            ActionPanel.prototype.show.apply(this, arguments); 

            this.transition = !ignoreTransition;
            showPanel(this);
        }

        DrawerActionPanel.prototype.hide = function(ignoreTransition) {
            var me = this;
            this.transition = !ignoreTransition;
            hidePanel(this);
        }

        DrawerActionPanel.prototype.dispose = function() {
            hidePanel(this);
            lib.removeNode(this.main.id);
            ActionPanel.prototype.dispose.apply(this, arguments);
        }

        /**
         * 初始化结构
         *
         * @override
         * @protected
         */
        DrawerActionPanel.prototype.initStructure = function () {
            ActionPanel.prototype.initStructure.apply(this, arguments);

            this.on('actionloaded', initPanel, this);
            helper.addDOMEvent(this, window, 'resize', resizePanel);
        };


        lib.inherits(DrawerActionPanel, ActionPanel);
        require('esui').register(DrawerActionPanel);
        return DrawerActionPanel;
    }
);
