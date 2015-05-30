/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file UI组件模块扩展
 * @author otakustay
 */

import u from '../util';
import lib from 'esui/lib';
// 加载所有验证规则
import 'esui/validator/MaxLengthRule';
import 'esui/validator/MinLengthRule';
import RequiredRule from 'esui/validator/RequiredRule';
import PatternRule from 'esui/validator/PatternRule';
import MaxRule from 'esui/validator/MaxRule';
import MinRule from 'esui/validator/MinRule';
import Rule from 'esui/validator/Rule';
// 需要的控件
import CommandMenu from 'esui/CommandMenu';
import Tab from 'esui/Tab';

/**
 * 加载并配置验证规则
 */
function initializeValidationRules() {
    RequiredRule.prototype.errorMessage = '请填写${title}';

    const INTEGER_REGEX = new Set(['^\\d+$', '/^\\d+$/']);
    const FLOAT_REGEX = new Set(['^\\d+(\\.\\d{1,2})?$', '/^\\d+(\\.\\d{1,2})?$/']);
    const NUMBER_REGEX = new Set([...Array.from(INTEGER_REGEX), ...Array.from(FLOAT_REGEX)]);

    function getRangeErrorMessage(control) {
        let min = control.get('min');
        let max = control.get('max');
        let pattern = control.get('pattern') + '';

        if (min != null && max != null && NUMBER_REGEX.has(pattern)) {
            // 把数字变成3位一个逗号的
            let regex = /\B(?=(\d{3})+(?!\d))/g;
            let start = (min + '').replace(regex, ',');
            let end = (max + '').replace(regex, ',');
            let title = u.escape(control.get('title'));

            // 根据正则选择整数或浮点数的信息
            if (INTEGER_REGEX.has(pattern)) {
                return `${title}请填写≥${start}且≤${end}的整数`;
            }

            return `${title}请填写≥${start}且≤${end}的数字，最多可保存至小数点后两位`;
        }

        return null;
    }

    MaxRule.prototype.getErrorMessage = function (control) {
        if (control.get('maxErrorMessage')) {
            let getErrorMessage = Rule.prototype.getErrorMessage;
            return getErrorMessage.apply(this, arguments);
        }
        let rangeErrorMessage = getRangeErrorMessage(control);
        if (rangeErrorMessage) {
            return rangeErrorMessage;
        }
        return Rule.prototype.getErrorMessage.apply(this, arguments);
    };

    MinRule.prototype.getErrorMessage = function (control) {
        if (control.get('minErrorMessage')) {
            let getErrorMessage = Rule.prototype.getErrorMessage;
            return getErrorMessage.apply(this, arguments);
        }
        let rangeErrorMessage = getRangeErrorMessage(control);
        if (rangeErrorMessage) {
            return rangeErrorMessage;
        }
        return Rule.prototype.getErrorMessage.apply(this, arguments);
    };

    PatternRule.prototype.getErrorMessage = function (control) {
        let pattern = control.get('pattern') + '';
        if (control.get('patternErrorMessage') || !NUMBER_REGEX.has(pattern)) {
            let getErrorMessage = Rule.prototype.getErrorMessage;
            return getErrorMessage.apply(this, arguments);
        }
        let rangeErrorMessage = getRangeErrorMessage(control);
        if (rangeErrorMessage) {
            return rangeErrorMessage;
        }
        return Rule.prototype.getErrorMessage.apply(this, arguments);
    };
}

/**
 * 为几个控件添加链接模式的内容模板
 */
function addControlLinkMode() {
    CommandMenu.prototype.linkTemplate = '<a target="${target}" href="${href}">${text}</a>';

    CommandMenu.prototype.getItemHTML = function (item) {
        let data = {
            text: lib.encodeHTML(item.text),
            href: item.href && lib.encodeHTML(item.href),
            target: item.target || '_self'
        };
        let template = item.href ? this.linkTemplate : this.itemTemplate;
        return lib.format(template, data);
    };

    Tab.prototype.linkTemplate = '<a href="${href}">${title}</a>';

    Tab.prototype.getContentHTML = function (item) {
        let data = {
            title: lib.encodeHTML(item.title),
            href: item.href && lib.encodeHTML(item.href)
        };
        let template = item.href ? this.linkTemplate : this.contentTemplate;
        return lib.format(template, data);
    };
}

function enable() {
    initializeValidationRules();
    addControlLinkMode();
}

/**
 * UI控件体系扩展
 *
 * @namespace extension.ui
 */
let uiExtension = {
    /**
     * 启动扩展
     *
     * @method extension.ui.enable
     */
    enable: u.once(enable)
};

export default uiExtension;
