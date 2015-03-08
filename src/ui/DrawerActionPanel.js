/**
 * UB RIA Base
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file 简易信息提示控件
 * @author exodia
 */
define(
    function (require) {
        var lib = require('esui/lib');

        /**
         * 抽屉式交互的子Action容器控件
         *
         * 该控件与`ActionPanel`功能相同，额外增加了以下功能：
         *
         * 1. 显示/隐藏会产生自右向左的滑动效果，默认覆盖与当前页面之上
         * 2. 带有一个关闭按钮，点击后自动隐藏
         *
         * @class ui.DrawerActionPanel
         * @extends ef.ActionPanel
         */
        var exports = {};

        /**
         * 控件类型，始终为`"DrawerActionPanel"`
         *
         * @member ui.DrawerActionPanel#type
         * @type {string}
         * @readonly
         * @override
         */
        exports.type = 'DrawerActionPanel';

        /**
         * @override
         */
        exports.initStructure = function () {
            this.$super(arguments);
            // 先创建一个，万一加载 action 挂掉了，这个关闭按钮还是可以保证存在的
            createCloseBtn.call(this);
            document.body.appendChild(this.main);
            this.addState('hidden');
        };

        /**
         * 关闭按钮触发的事件
         *
         * @param {mini-event.Event} e 事件对象
         */
        function close(e) {
            if (this.helper.isPart(e.target, 'close-btn')) {
                this.hide();
                this.fire('close');
            }
        }

        /**
         * 创建关闭按钮
         */
        function createCloseBtn() {
            if (!this.helper.getPart('close-btn')) {
                var element = this.main.appendChild(this.helper.createPart('close-btn'), 'span');
                element.title = '关闭';
            }
        }

        /**
         * @override
         */
        exports.initEvents = function () {
            this.$super(arguments);
            this.helper.addDOMEvent(this.main, 'click', close);
            // action 加载好后会把 main 清空， 再创建次
            this.on('actionloaded', createCloseBtn);
        };

        /**
         * @override
         */
        exports.enterAction = function () {
            this.action.context.args.isInDrawerPanel = true;
            this.$super(arguments);
        };

        /**
         * 获取遮罩层
         *
         * @param {Control} panel 控件
         * @return {HTMLElement}
         */
        function getMask(panel) {
            return panel.helper.getPart('mask') || document.body.appendChild(panel.helper.createPart('mask'));
        }

        /**
         * @override
         */
        exports.show = function () {
            getMask(this).style.display = 'block';
            document.body.style.overflowY = 'hidden';
            this.$super(arguments);
        };

        /**
         * @override
         */
        exports.hide = function () {
            getMask(this).style.display = 'none';
            document.body.style.overflowY = '';
            this.$super(arguments);
        };

        /**
         * @override
         */
        exports.dispose = function () {
            this.hide();
            lib.removeNode(this.helper.getId('mask'));
            lib.removeNode(this.main.id);
            this.$super(arguments);
        };

        var ActionPanel = require('ef/ActionPanel');
        var DrawerActionPanel = require('eoo').create(ActionPanel, exports);

        require('esui').register(DrawerActionPanel);

        return DrawerActionPanel;
    }
);
