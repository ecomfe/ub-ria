/**
 * UB RIA Base
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 简易信息提示控件
 * @author lixiang
 */

import u from '../../util';
import lib from 'esui/lib';
import Control from 'esui/Control';
import painters from 'esui/painters';
import {set} from 'san-update';
import etpl from 'etpl';
import TEMPLATE from 'text!./warn.tpl.html';

let engine = new etpl.Engine();
engine.parse(TEMPLATE);

/**
 * Warn控件
 *
 * @class ui.Warn
 * @extends esui.Control
 */
export default class Warn extends Control {

    /**
     * 控件类型，始终为`"Warn"`
     *
     * @member ui.Warn#type
     * @type {string}
     * @readonly
     * @override
     */
    get type() {
        return 'Warn';
    }

    constructor(...args) {
        super(...args);

        this.helper.setTemplateEngine(engine);
    }

    /**
     * @override
     */
    initOptions(options = {}) {
        let properties = options;

        if (options.content == null) {
            properties = set(properties, 'content', this.main.innerHTML);
        }

        this.setProperties(properties);
    }

    /**
     * @override
     */
    initStructure() {
        this.main.innerHTML = this.helper.renderTemplate('main', u.pick(this, 'okLabel', 'cancelLabel'));

        this.initChildren();

        let handleClick = type => {
            // 如果在参数里设置了处理函数，会在fire时执行
            this.fire(type);

            if (type === 'ok') {
                this.dispose();
            }
            else {
                this.hide();
            }
        };

        this.getChild('btnOk').on('click', () => handleClick('ok'));
        this.getChild('btnCancel').on('click', () => handleClick('cancel'));
    }

    /**
     * @override
     */
    hide() {
        this.fire('hide');
        this.dispose();
    }

    /**
     * @override
     */
    dispose() {
        if (this.helper.isInStage('DISPOSED')) {
            return;
        }

        super.dispose();

        lib.removeNode(this.main);
    }
}

/**
 * @override
 */
Warn.prototype.repaint = painters.createRepaint(
    Control.prototype.repaint,
    {
        name: 'content',
        paint(control, content) {
            let container = control.helper.getPart('content');
            container.innerHTML = content;
        }
    }
);

/**
 * 快捷显示信息的方法
 *
 * @method ui.Warn.show
 * @param {Object} options 其它配置项
 * @return {ui.Warn}
 */
Warn.show = function (options) {
    let warn = new Warn(options);
    warn.appendTo(options.wrapper || document.body);
    return warn;
};
