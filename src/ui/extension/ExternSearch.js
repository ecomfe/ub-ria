/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 使用外部搜索控件代理控件的搜索的扩展
 * @author lixiang
 * @date $DATE$
 */
define(
    function (require) {
        var u = require('underscore');
        var lib = require('esui/lib');
        var Extension = require('esui/Extension');

        /**
         * 使用外部搜索控件代理控件的搜索
         *
         * @param {Object} [options] 配置项
         * @extends esui.Extension
         * @constructor
         */
        function ExternSearch(options) {
            options = options || {};
            Extension.apply(this, arguments);
        }

        /**
         * 扩展的类型，始终为`"ExternSearch"`
         *
         * @type {string}
         * @override
         */
        ExternSearch.prototype.type = 'ExternSearch';

        /**
         * 指定对应的searchBox的id
         *
         * @type {string | null}
         */
        ExternSearch.prototype.searchBox = null;

        /**
         * 找到控件对应的搜索类控件
         *
         * @return {esui.searchBox}
         */
        ExternSearch.prototype.resolveControl = function () {
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
         * 激活扩展
         *
         * @override
         */
        ExternSearch.prototype.activate = function () {
            var searchBox = this.resolveControl();
            searchBox.on('search', search, this);

            // 接收控件内清空搜索操作
            this.target.on('clearquery', clearQuery, this);
            // 接收控件的search事件
            this.target.on('search', doSearch, this);

            Extension.prototype.activate.apply(this, arguments);
        };

        function search(e) {
            this.target.search();
        }

        function doSearch(e) {
            var searchBox = this.resolveControl();
            var filter = { value: searchBox.getValue() };
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
         * 取消激活
         *
         * @override
         */
        ExternSearch.prototype.inactivate = function () {
            Extension.prototype.inactivate.apply(this, arguments);

            var searchBox = this.resolveControl();
            if (searchBox) {
                searchBox.un('search', search, this);
            }

            this.target.un('clearquery', clearQuery, this);
            this.target.un('search', doSearch, this);
        };

        lib.inherits(ExternSearch, Extension);
        require('esui').registerExtension(ExternSearch);
        return ExternSearch;
    }
);
