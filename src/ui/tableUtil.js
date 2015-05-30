/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 表格相关工具方法
 * @author otakustay
 */

import u from '../util';

/**
 * 创建一个带命令的元素
 *
 * 具体参考`esui.extension.Command`扩展的说明
 *
 * @param {Object} config 配置项
 * @param {string} config.command 命令名称
 * @param {string} config.args 命令参数
 * @param {string} [config.text=""] 显示的文本内容
 * @param {string} [config.tagName="span"] 使用的元素名称
 * @return {string}
 */
export function command(config) {
    let data = {
        tagName: 'span',
        text: ''
    };
    u.extend(data, config);

    let tagName = u.escape(data.tagName);
    let html = `<${tagName}`;
    if (data.className) {
        html += ` class="${u.escape(data.className)}"`;
    }
    html += ` data-command="${u.escape(data.command)}"`;
    if (data.args) {
        html += ` data-command-args="${u.escape(data.args)}"`;
    }
    html += `>${u.escape(data.text)}</${tagName}>`;
    return html;
}

/**
 * 创建操作列的HTML
 *
 * @param {Object[]} config 操作配置
 * @return {string}
 */
export function operations(config) {
    let separator = '';
    let html = u.map(
        config,
        (item) => {
            // 字符串为分隔符
            if (u.isString(item)) {
                separator = `<span class="table-operation-separator">${u.escape(item)}</span>`;
            }

            // 如果没有权限就不显示了
            if (item.auth === false) {
                return '';
            }

            // 操作分为链接式或命令式2类
            if (item.url) {
                let link = [];
                link.push(`<a href="${u.escape(item.url)}"`);
                link.push(` class="table-operation table-operation-${u.escape(item.type)}"`);
                if (item.target === '_blank') {
                    link.push(' target="_blank"');
                }
                if (!item.redirectOptions) {
                    link.push(' data-redirect="global">');
                }
                else if (item.redirectOptions.length === 0) {
                    link.push('>');
                }
                else if (u.isArray(item.redirectOptions)) {
                    link.push(` data-redirect="${item.redirectOptions.join(' ')}">`);
                }
                link.push(u.escape(item.text));
                link.push('</a>');
                return link.join('');
            }

            let className = `table-operation table-operation-${u.escape(item.type)}`;
            let options = {
                className: className,
                text: item.text,
                command: item.command,
                args: item.args
            };
            // 单独处理tagName
            if (item.tagName) {
                options.tagName = item.tagName;
            }

            return command(options);
        }
    );

    html = u.without(html, '');

    // 处理连续的分隔符
    let i = 0;
    while (i < html.length - 1) {
        if (html[i] === separator && html[i + 1] === separator) {
            html.splice(i, 1);
        }
        else {
            i++;
        }
    }
    // 去除首尾的分隔符
    if (html[0] === separator) {
        html.shift();
    }
    if (html[html.length - 1] === separator) {
        html.pop();
    }

    return html.join('');
}

/**
 * 创建滑动效果的操作列的HTML
 *
 * @param {Object[]} config 操作配置
 * @return {string}
 */
export function slideOperations(config) {
    let html = operations(config);
    let operationHTML = [
        '<span class="table-operation-trigger">操作</span>',
        '<div class="table-operation-layer">',
            html,
        '</div>'
    ];
    return operationHTML.join('');
}

/**
 * 生成状态列HTML
 *
 * @param {Object} status 状态配置项
 * @param {string} status.type 类型名称
 * @param {string} status.text 类型中文
 * @return {string}
 */
export function status({type, text}) {
    return `<span class="table-status-${u.escape(type)}">${u.escape(text)}</span>`;
}
