/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 使用外部下拉选择控件代理控件的搜索
 * @author lixiang
 * @date $DATE$
 */
define(
    function (require) {
        var u = require('../../util');
        var lib = require('esui/lib');

        /**
         * 使用外部下拉选择控件代理控件的搜索
         *
         * @class ui.extension.ExternSelect
         * @extends esui.Extension
         */
        var exports = {};

        /**
         * @constructs ui.extends.ExternSelect
         * @override
         * @param {Object} [options] 配置项
         */
        exports.constructor = function (options) {
            options = options || {};

            this.$super(arguments);
        };

        /**
         * 扩展的类型，始终为`"ExternSelect"`
         *
         * @type {string}
         * @override
         */
        exports.type = 'ExternSelect';

        /**
         * 指定对应的一组select的id, 逗号或空格分隔，必须指定
         *
         * @type {string | null}
         */
        exports.selects = null;

        /**
         * 找到代理控件
         *
         * @return {esui.searchBox}
         */
        exports.resolveControls = function () {
            var controls = [];
            if (this.selects) {
                var selects;
                if (u.isString(this.selects)) {
                    selects = lib.splitTokenList(this.selects);
                }
                else {
                    selects = this.selects;
                }
                if (u.isArray(selects)) {
                    u.each(
                        selects,
                        function (select, index) {
                            select = this.target.viewContext.get(select);
                            if (select) {
                                controls.push(select);
                            }
                            // 只有扩展处于激活状态才抛异常
                            else if (this.active) {
                                throw new Error('Cannot find related select "#' + select + '" in view context');
                            }
                        },
                        this
                    );
                }
                else {
                    throw new Error('selects can only be Array or String');
                }
            }
            else {
                throw new Error('selects cannot be null');
            }

            return controls;
        };

        /**
         * 激活扩展
         *
         * @override
         */
        exports.activate = function () {
            this.handleControls(
                function (select, index) {
                    select.on('change', search, this);
                }
            );

            // 接收控件内清空搜索操作
            this.target.on('clearquery', clearQuery, this);
            // 接收控件的search事件
            this.target.on('search', doSearch, this);

            this.$super(arguments);
        };

        function search(e) {
            this.target.search();
        }

        function doSearch(e) {
            this.handleControls(
                function (select, index) {
                    var item = select.getSelectedItem();
                    if (item.value !== '' && select.dataKey) {
                        e.filterData.push({keys: [select.dataKey], value: item.value});
                    }
                }
            );

            e.preventDefault();
        }

        function clearQuery() {
            this.handleControls(
                function (select) {
                    select.un('change', search, this);
                    select.setProperties({selectedIndex: 0});
                    select.on('change', search, this);
                }
            );
        }

        /**
         * 取消激活
         *
         * @override
         */
        exports.inactivate = function () {
            this.$super(arguments);

            this.handleControls(
                function (select) {
                    select.un('change', search, this);
                },
                true
            );

            this.target.un('clearquery', clearQuery, this);
            this.target.un('search', doSearch, this);
        };

        /**
         * 搜索控件的处理函数
         * @param {Function} handler 处理句柄
         */
        exports.handleControls = function (handler) {
            var controls = this.resolveControls();
            if (controls.length) {
                u.each(controls, handler, this);
            }
        };

        var Extension = require('esui/Extension');
        var ExternSelect = require('eoo').create(Extension, exports);

        require('esui').registerExtension(ExternSelect);

        return ExternSelect;
    }
);
