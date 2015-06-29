/**
 * @file DrawerActionPanel.js 抽屉控件
 * @class ub-ria.DrawerActionPanel
 * @extends ef.ActionPanel
 * @author exodia(dengxinxin@baidu.com)
 */
define(
    function (require) {
        var lib = require('esui/lib');
        var ActionPanel = require('ef/ActionPanel');

        function close(e) {
            if (this.helper.isPart(e.target, 'close-btn')) {
                this.hide();
                this.fire('close');
            }
        }

        var exports = {};

        exports.type = 'DrawerActionPanel';

        exports.initStructure = function () {
            this.$super(arguments);
            // 先创建一个，万一加载 action 挂掉了，这个关闭按钮还是可以保证存在的
            createCloseBtn.call(this);
            document.body.appendChild(this.main);
            this.addState('hidden');
        };

        exports.initEvents = function () {
            this.$super(arguments);
            this.helper.addDOMEvent(this.main, 'click', close);
            // action 加载好后会把 main 清空， 再创建次
            this.on('actionloaded', createCloseBtn);
        };

        exports.enterAction = function () {
            this.action.context.args.isInDrawerPanel = true;
            this.$super(arguments);
        };

        exports.show = function () {
            getMask(this).style.display = 'block';
            document.body.style.overflowY = 'hidden';
            this.$super(arguments);
        };

        exports.hide = function () {
            getMask(this).style.display = 'none';
            document.body.style.overflowY = '';
            this.$super(arguments);
        };

        exports.dispose = function () {
            this.hide();
            lib.removeNode(this.helper.getId('mask'));
            lib.removeNode(this.main.id);
            this.$super(arguments);
        };

        function getMask(panel) {
            return panel.helper.getPart('mask') || document.body.appendChild(panel.helper.createPart('mask'));
        }

        function createCloseBtn() {
            if (!this.helper.getPart('close-btn')) {
                var el = this.main.appendChild(this.helper.createPart('close-btn'), 'span');
                el.title = '关闭';
                el.className += ' ui-icon ui-icon-close';
            }
        }

        var DrawerActionPanel = require('eoo').create(ActionPanel, exports);
        require('esui').register(DrawerActionPanel);

        return DrawerActionPanel;
    }
);
