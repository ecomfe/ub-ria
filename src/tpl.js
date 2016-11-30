/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file tpl加载插件
 * @author otakustay
 */
define(
    function (require) {
        var u = require('./util');
        var ajax = require('er/ajax');
        var etpl = require('etpl');
        var template = etpl;

        // 添加一堆`filter`用用
        var util = require('./util');
        template.addFilter('trim', util.trim);
        template.addFilter('pascalize', util.pascalize);
        template.addFilter('camelize', util.camelize);
        template.addFilter('dasherize', util.dasherize);
        template.addFilter('constlize', util.constlize);
        template.addFilter('pluralize', util.pluralize);

        var controlModulePrefix = {
            // Sidebar不使用esui的，那个不大符合要求
            BoxGroup: 'esui',
            Button: 'esui',
            Calendar: 'esui',
            CheckBox: 'esui',
            CommandMenu: 'esui',
            Crumb: 'esui',
            Dialog: 'esui',
            Form: 'esui',
            Frame: 'esui',
            Label: 'esui',
            Link: 'esui',
            MonthView: 'esui',
            Pager: 'esui',
            Panel: 'esui',
            RangeCalendar: 'esui',
            Region: 'esui',
            RichCalendar: 'esui',
            Schedule: 'esui',
            SearchBox: 'esui',
            Select: 'esui',
            Tab: 'esui',
            Table: 'esui',
            TextBox: 'esui',
            TextLine: 'esui',
            Tip: 'esui',
            TipLayer: 'esui',
            Tree: 'esui',
            Validity: 'esui',
            Wizard: 'esui',
            ActionPanel: 'ef',
            ActionDialog: 'ef',
            ViewPanel: 'ef',
            DrawerActionPanel: 'ub-ria',
            RichSelector: 'ub-ria-ui',
            TableRichSelector: 'ub-ria-ui',
            PagingTableRichSelector: 'ub-ria-ui',
            PagingTreeRichSelector: 'ub-ria-ui',
            TogglePanel: 'ub-ria-ui',
            ToggleSelector: 'ub-ria-ui',
            TreeRichSelector: 'ub-ria-ui',
            PartialForm: 'ub-ria/ui',
            Uploader: 'ub-ria/ui',
            Warn: 'ub-ria/ui'
        };

        var extensionModulePrefix = {
            AutoSort: 'esui/extension',
            Command: 'esui/extension',
            CustomData: 'esui/extension',
            TableEdit: 'esui/extension',
            TableSubrow: 'esui/extension',
            AutoSubmit: 'ub-ria/ui/extension',
            ExternSearch: 'ub-ria/ui/extension',
            ExternSelect: 'ub-ria/ui/extension',
            TrimInput: 'ub-ria/ui/extension',
            WordCount: 'ub-ria/ui/extension'
        };

        var CONTROL_CUSTOM_ELEMENT_PREFIX = 'esui-';

        var enableCustomElementShim = function (type) {
            var customElementName = CONTROL_CUSTOM_ELEMENT_PREFIX + u.dasherize(type);
            document.createElement(customElementName);
        };
        enableCustomElementShim = u.memoize(enableCustomElementShim);

        /**
         * 获取控件依赖关系
         *
         * @param {string} text 模板内容
         * @return {string[]} 依赖的控件列表
         */
        function getControlDependencies(text) {
            var dependencies = [];
            var defined = {};

            var regex = /<\s*esui-([\w-]+)[^>]*>|data-ui-type="(\w+)"/g;
            var match = regex.exec(text);
            while (match) {
                var type = match[1] && util.pascalize(match[1]) || match[2];
                if (!defined[type]) {
                    defined[type] = true;

                    var prefix = (controlModulePrefix[type] || 'ui') + '/';
                    dependencies.push(prefix + type);
                    enableCustomElementShim(type);
                }

                match = regex.exec(text);
            }

            return dependencies;
        }

        /**
         * 获取扩展依赖关系
         *
         * @param {string} text 模板内容
         * @return {string[]} 依赖的扩展列表
         */
        function getExtensionDependencies(text) {
            var dependencies = [];
            var defined = {};

            var regex = /data-ui-extension-[^-]+-type="(\w+)"/g;
            var match = regex.exec(text);
            while (match) {
                var type = match[1];
                if (!defined[type]) {
                    defined[type] = true;

                    var prefix = (extensionModulePrefix[type] || 'ui/extension') + '/';
                    dependencies.push(prefix + type);
                }

                match = regex.exec(text);
            }

            return dependencies;
        }

        /**
         * 模板加载插件，类似[etpl](https://github.com/ecomfe/etpl)的AMD插件，
         * 但此插件会分析模板的源码，当模板按标准书写时，可自动分析控件的依赖
         *
         * 使用此插件的自动控件依赖分析功能，模板必须满足以下条件：
         *
         * - 控件的HTML必须写`data-ui-type="SomeControl"`这一格式，即*不能*有`data-ui="type: SomeControl"`这样的写法
         * - 对于非ESUI、EF框架，且不在`src/ui`文件夹下的控件，必须通过{@link tpl.registerControl}方法注册模块前缀
         * - 对于ESUI扩展，必须写`data-ui-extension-xxx-type="Xxx"`的形式
         * - 业务ESUI扩展必须放置在`src/ui/extension`文件夹下
         *
         * @namespace tpl
         */
        var plugin = {

            /**
             * 设置模板引擎实例，可通过此方法来使用非默认引擎实例
             *
             * @method tpl.setupTemplateEngine
             * @param {etpl.Engine} engine 引擎的实例
             */
            setupTemplateEngine: function (engine) {
                template = engine || etpl;
            },

            /**
             * 加载模板，AMD插件对象暴露的方法
             *
             * @method tpl.load
             * @param {string} resourceId 模板资源id
             * @param {Function} parentRequire 父级`require`函数
             * @param {Function} load 加载完成后调用
             */
            load: function (resourceId, parentRequire, load) {
                function addTemplate(text) {
                    template.parse(text);

                    var controls = getControlDependencies(text);
                    var extensions = getExtensionDependencies(text);
                    var dependencies = controls.concat(extensions);

                    window.require(
                        dependencies,
                        function () {
                            load(text);
                        }
                    );
                }

                if (resourceId.indexOf('.tpl.html') >= 0) {
                    var options = {
                        method: 'GET',
                        url: parentRequire.toUrl(resourceId),
                        cache: true,
                        dataType: 'text'
                    };
                    ajax.request(options).then(addTemplate);
                }
                else {
                    parentRequire([resourceId], addTemplate);
                }
            },

            /**
             * 注册业务控件的模块
             *
             * @method tpl.registerControl
             * @param {string} moduleId 业务控件对应的模块id，必须为顶级id
             */
            registerControl: function (moduleId) {
                var lastIndexOfSlash = moduleId.lastIndexOf('/');
                var prefix = moduleId.substring(0, lastIndexOfSlash);
                var type = moduleId.substring(lastIndexOfSlash + 1);
                controlModulePrefix[type] = prefix;
            },

            /**
             * 注册业务控件扩展的模块
             *
             * @method tpl.registerExtension
             * @param {string} moduleId 业务控件对应的模块id，必须为顶级id
             */
            registerExtension: function (moduleId) {
                var lastIndexOfSlash = moduleId.lastIndexOf('/');
                var prefix = moduleId.substring(0, lastIndexOfSlash);
                var type = moduleId.substring(lastIndexOfSlash + 1);
                extensionModulePrefix[type] = prefix;
            }
        };

        return plugin;
    }
);
