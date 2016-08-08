/**
 * 控制页面滚动的操控控件
 *
 * @file Scroll.js 控制页面滚动的操控控件
 * @exports ui.Scroll
 * @author
 */

import ui from 'esui';
import Control from 'esui/Control';
import {createRepaint} from 'esui/painters';
import $ from 'jquery';

let repaint = createRepaint(
    Control.prototype.repaint,
    {
        name: ['scrollTop'],
        paint(control, scrollTop) {
            let container = control::getContainer();
            $(container).scrollTop(scrollTop);
            // 重置scrollTop，保证每次更新生效
            control.scrollTop = null;
        }
    }
);

/**
 * 找最近的那个有scroll的容器
 *
 * @return {HTMLElement} 最近的带滚动条的父容器
 */
function getContainer() {
    let target = this.main;

    while (target && target !== document.body) {
        if (hasScroll(target)) {
            return target;
        }
        target = target.parentNode;
    }

    return window;
}

/**
 * 判断是否有滚动条
 *
 * @param {HTMLElement} element 要判断的容器元素
 * @return {boolean} 有 true；无 false
 */
function hasScroll(element) {
    return element.clientHeight < element.scrollHeight;
}

/**
 * 控制页面滚动的操控控件
 *
 * @class ui.Scroll
 * @extends esui.Control
 */
export default class Scroll extends Control {

    /**
     * @override
     */
    get type() {
        return 'Scroll';
    }

    /**
     * @override
     */
    repaint(changes, changesIndex) {
        repaint.call(this, changes, changesIndex);
    }
}

ui.register(Scroll);
