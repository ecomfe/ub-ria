/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 为表格的操作图标添加Tip说明的扩展
 * @author otakustay
 * @date $DATE$
 */
define(
    function (require) {
        var lib = require('esui/lib');
        var ui = require('esui');
        var u = require('underscore');
        var Extension = require('esui/Extension');

        require('esui/TipLayer');

        /**
         * 用于表格的Tip扩展，为操作列图标添加Tip
         *
         * 使用此扩展，只要操作列图标包含`"table-operation"`这一class，
         * 同时有`"table-operation-{type}"`的class，
         * 即可在鼠标移到图标上时，使用`Tip`控件显示该图标对应的操作
         *
         * 如以下HTML：
         *
         *     <span class="table-operation table-operation-edit">编辑</span>
         *
         * 即会在鼠标移到元素上时，出现一个Tip控件，提示内容为“编辑”
         *
         * **注意，此扩展不支持IE7**
         *
         * @extends esui.Extension
         * @constructor
         */
        function TableTip() {
            Extension.apply(this, arguments);
        }

        /**
         * 扩展的类型，始终为`"TableTip"`
         *
         * @type {string}
         * @override
         */
        TableTip.prototype.type = 'TableTip';

        var typeRule = /table-operation-(\w+)/;

        function getTipType(element) {
            return typeRule.exec(element.className)[1];
        }

        /**
         * 创建`Tip`控件并附加到相应元素上
         *
         * @param {HTMLElement[]} elements 需要`Tip`的元素
         * @param {string} type 操作类型
         */
        TableTip.prototype.createAndAttachTip = function (elements, type) {
            var options = {
                id: 'table-operation-tip-' + u.escape(type),
                viewContext: this.target.viewContext,
                content: lib.getText(elements[0]),
                arrow: true,
                skin: 'table-tip'
            };
            var tip = ui.create('TipLayer', options);
            tip.appendTo(document.body);
            u.each(
                elements, 
                function (element) {
                    var options = {
                        targetDOM: element,
                        showMode: 'over',
                        delayTime: 200,
                        positionOpt: {
                            bottom: 'bottom',
                            left: 'left'
                        }
                    };
                    tip.attachTo(options);
                }
            );
        };

        /**
         * 初始化操作列的`Tip`控件
         */
        TableTip.prototype.initTips = function () {
            if (!document.querySelectorAll) {
                return;
            }

            var elements = document.querySelectorAll('.table-operation');

            u.chain(elements)
                .groupBy(getTipType)
                .each(u.bind(this.createAndAttachTip, this));
        };

        /**
         * 激活扩展
         *
         * @override
         */
        TableTip.prototype.activate = function () {
            Extension.prototype.activate.apply(this, arguments);

            this.target.on('afterrender', this.initTips, this);
        };

        /**
         * 取消扩展的激活状态
         *
         * @override
         */
        TableTip.prototype.inactivate = function () {
            this.target.un('afterrender', this.initTips, this);

            Extension.prototype.inactivate.apply(this, arguments);
        };

        lib.inherits(TableTip, Extension);
        ui.registerExtension(TableTip);

        return TableTip;
    }
);        
