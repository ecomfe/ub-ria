/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 使用外部搜索控件代理控件的搜索的扩展
 * @author lixiang
 */
define(
    function (require) {
        var lib = require('esui/lib');

        /**
         * 使用外部搜索控件代理控件的搜索
         *
         * @class ui.extension.ExternSearch
         * @extends esui.Extension
         */
        var exports = {};

        /**
         * @constructs ui.extends.ExternSearch
         * @param {Object} [options] 配置项
         * @override
         */
        exports.constructor = function (options) {
            options = options || {};

            this.$super(arguments);
        };

        /**
         * 扩展的类型，始终为`"ExternSearch"`
         *
         * @member ui.extension.ExternSearch#type
         * @type {string}
         * @readonly
         * @override
         */
        exports.type = 'ExternSearch';

        /**
         * 指定对应的searchBox的id
         *
         * @member ui.extension.ExternSearch#searchBox
         * @type {string | null}
         */
        exports.searchBox = null;

        /**
         * 找到控件对应的搜索类控件
         *
         * @protected
         * @method ui.extension.ExternSearch#resolveControl
         * @return {esui.SearchBox}
         */
        exports.resolveControl = function () {
            var searchBox;
            // 这个searchbox为了向前兼容。。。
            if (!this.searchBox && this.searchbox) {
                this.searchBox = this.searchbox;
            }

            if (this.searchBox) {
                searchBox = this.target.viewContext.get(this.searchBox);
                // 只有扩展处于激活状态才抛异常
                if (!searchBox && this.active) {
                    throw new Error('Cannot find related searchBox "#' + searchBox + '" in view context');
                }
            }
            else {
                throw new Error('searchBox cannot be null');
            }

            return searchBox;
        };

        /**
         * @override
         */
        exports.activate = function () {
            var searchBox = this.resolveControl();
            searchBox.on('search', search, this);

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
            var searchBox = this.resolveControl();
            var filter = {value: searchBox.getValue()};
            // 外部searchbox是不有配搜索包含关键字段
            if (searchBox.dataKeys) {
                filter.keys = lib.splitTokenList(searchBox.dataKeys);
            }
            e.filterData.push(filter);
            e.preventDefault();
        }

        function clearQuery() {
            var searchBox = this.resolveControl();
            searchBox.set('text', '');
        }

        /**
         * @override
         */
        exports.inactivate = function () {
            this.$super(arguments);

            var searchBox = this.resolveControl();
            if (searchBox) {
                searchBox.un('search', search, this);
            }

            this.target.un('clearquery', clearQuery, this);
            this.target.un('search', doSearch, this);
        };

        var Extension = require('esui/Extension');
        var ExternSearch = require('eoo').create(Extension, exports);

        require('esui').registerExtension(ExternSearch);

        return ExternSearch;
    }
);
