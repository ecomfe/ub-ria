/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file UI组件模块扩展
 * @author otakustay
 */
define(
    function (require) {
        var u = require('underscore');
        var lib = require('esui/lib');

        /**
         * 加载并配置验证规则
         *
         * @ignore
         */
        function initializeValidationRules() {
            // 加载所有验证规则
            require('esui/validator/MaxLengthRule');
            require('esui/validator/MinLengthRule');
            var RequiredRule = require('esui/validator/RequiredRule');
            var PatternRule = require('esui/validator/PatternRule');
            var MaxRule = require('esui/validator/MaxRule');
            var MinRule = require('esui/validator/MinRule');

            RequiredRule.prototype.errorMessage = '请填写${title}';

            var INTEGER_REGEX = {
                '^\\d+$': true,
                '/^\\d+$/': true
            };
            var FLOAT_REGEX = {
                '^\\d+(\\.\\d{1,2})?$': true,
                '/^\\d+(\\.\\d{1,2})?$/': true
            };
            var NUMBER_REGEX = u.extend({}, INTEGER_REGEX, FLOAT_REGEX);

            function getRangeErrorMessage(control) {
                var min = control.get('min');
                var max = control.get('max');
                var pattern = control.get('pattern') + '';

                if (min != null && max != null
                    && NUMBER_REGEX.hasOwnProperty(pattern)
                ) {
                    // 把数字变成3位一个逗号的
                    var regex = /\B(?=(\d{3})+(?!\d))/g;
                    var start = (min + '').replace(regex, ',');
                    var end = (max + '').replace(regex, ',');

                    // 根据正则选择整数或浮点数的信息
                    if (INTEGER_REGEX.hasOwnProperty(pattern)) {
                        return u.escape(control.get('title')) + '请填写'
                            + '≥' + start + '且≤' + end + '的整数';
                    }
                    else {
                        return u.escape(control.get('title')) + '请填写'
                            + '≥' + start + '且≤' + end + '的数字，'
                            + '最多可保存至小数点后两位';
                    }
                }
                else {
                    return null;
                }
            }

            var Rule = require('esui/validator/Rule');

            MaxRule.prototype.getErrorMessage = function (control) {
                if (control.get('maxErrorMessage')) {
                    var getErrorMessage = Rule.prototype.getErrorMessage;
                    return getErrorMessage.apply(this, arguments);
                }
                var rangeErrorMessage = getRangeErrorMessage(control);
                if (rangeErrorMessage) {
                    return rangeErrorMessage;
                }
                return Rule.prototype.getErrorMessage.apply(this, arguments);
            };

            MinRule.prototype.getErrorMessage = function (control) {
                if (control.get('minErrorMessage')) {
                    var getErrorMessage = Rule.prototype.getErrorMessage;
                    return getErrorMessage.apply(this, arguments);
                }
                var rangeErrorMessage = getRangeErrorMessage(control);
                if (rangeErrorMessage) {
                    return rangeErrorMessage;
                }
                return Rule.prototype.getErrorMessage.apply(this, arguments);
            };

            PatternRule.prototype.getErrorMessage = function (control) {
                var pattern = control.get('pattern') + '';
                if (control.get('patternErrorMessage')
                    || !NUMBER_REGEX.hasOwnProperty(pattern)
                ) {
                    var getErrorMessage = Rule.prototype.getErrorMessage;
                    return getErrorMessage.apply(this, arguments);
                }
                var rangeErrorMessage = getRangeErrorMessage(control);
                if (rangeErrorMessage) {
                    return rangeErrorMessage;
                }
                return Rule.prototype.getErrorMessage.apply(this, arguments);
            };
        }

        /**
         * 添加通用的表格单元格内容输出方法
         *
         * @ignore
         */
        function addTableCellRenderers() {
            var Table = require('esui/Table');

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
            Table.command = function (config) {
                var data = {
                    tagName: 'span',
                    text: ''
                };
                u.extend(data, config);

                var tagName = u.escape(data.tagName);
                var html = '<' + tagName;
                if (data.className) {
                    html += ' class="' + u.escape(data.className) + '"';
                }
                html += ' data-command="' + u.escape(data.command) + '"';
                if (data.args) {
                    html += ' data-command-args="' + u.escape(data.args) + '"';
                }
                html += '>' + u.escape(data.text) + '</' + tagName + '>';
                return html;
            };

            /**
             * 创建操作列的HTML
             *
             * @param {Object[]} config 操作配置
             * @return {string}
             */
            Table.operations = function (config) {
                var separator = '';
                var html = u.map(
                    config,
                    function (item) {
                        // 字符串为分隔符
                        if (u.isString(item)) {
                            separator = '<span class="table-operation-separator">'
                                + u.escape(item) + '</span>';
                            return separator;
                        }

                        // 如果没有权限就不显示了
                        if (item.auth === false) {
                            return '';
                        }

                        // 操作分为链接式或命令式2类
                        if (item.url) {
                            var link = [];
                            link.push('<a href="' + u.escape(item.url) + '"');
                            link.push(' class="table-operation table-operation-');
                            link.push(u.escape(item.type) + '"');
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
                                link.push(' data-redirect="' + item.redirectOptions.join(' ') + '">');
                            }
                            link.push(u.escape(item.text));
                            link.push('</a>');
                            return link.join('');
                        }
                        else {
                            var className = 'table-operation '
                                + 'table-operation-' + u.escape(item.type);
                            var options = {
                                className: className,
                                text: item.text,
                                command: item.command,
                                args: item.args
                            };
                            // 单独处理tagName
                            if (item.tagName) {
                                options.tagName = item.tagName;
                            }

                            return Table.command(options);
                        }
                    }
                );

                html = u.without(html, '');

                // 处理连续的分隔符
                var i = 0;
                while (i < html.length - 1) {
                    if (html[i] === separator && html[i + 1] === separator) {
                        html.splice(i, 1);
                    }
                    else {
                        i ++;
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
            };

            /**
             * 生成状态列HTML
             *
             * @param {Object} status 状态配置项
             * @param {string} status.type 类型名称
             * @param {string} status.text 类型中文
             * @return {string}
             */
            Table.status = function (status) {
                return '<span class="table-status-' + u.escape(status.type)
                    + '">' + status.text + '</span>';
            };
        }

        /**
         * 为几个控件添加链接模式的内容模板
         *
         * @ignore
         */
        function addControlLinkMode() {
            var CommandMenu = require('esui/CommandMenu');

            CommandMenu.prototype.linkTemplate =
                '<a target="${target}" href="${href}">${text}</a>';

            CommandMenu.prototype.getItemHTML = function (item) {
                var data = {
                    text: lib.encodeHTML(item.text),
                    href: item.href && lib.encodeHTML(item.href),
                    target: item.target || '_self'
                };
                var template = item.href
                    ? this.linkTemplate
                    : this.itemTemplate;
                return lib.format(template, data);
            };

            var Tab = require('esui/Tab');

            Tab.prototype.linkTemplate = '<a href="${href}">${title}</a>';

            Tab.prototype.getContentHTML = function (item) {
                var data = {
                    title: lib.encodeHTML(item.title),
                    href: item.href && lib.encodeHTML(item.href)
                };
                var template = item.href
                    ? this.linkTemplate
                    : this.contentTemplate;
                return lib.format(template, data);
            };
        }

        function enable() {
            initializeValidationRules();
            addTableCellRenderers();
            addControlLinkMode();
        }

        return {
            enable: u.once(enable)
        };
    }
);
