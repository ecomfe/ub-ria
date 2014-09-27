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
         * 指定对应的一组select的id, 逗号或空格分隔
         *
         * @type {string | null}
         */
        ExternSearch.prototype.selects = null;

        /**
         * 找到控件对应的搜索类控件
         *
         * @return {esui.searchBox}
         */
        ExternSearch.prototype.resolveSearchControls = function () {
            var searchControls = { searchBox: null, selects: [] };
            if (this.selects) {
                var selects = lib.splitTokenList(this.selects);
                u.each(
                    selects,
                    function (select, index) {
                        var select = this.target.viewContext.get(select);
                        if (select) {
                            searchControls.selects.push(select);
                        }
                        // 只有扩展处于激活状态才抛异常
                        else if (this.active) {
                            throw new Error('Cannot find related select "#' + select + '" in view context');
                        }
                    },
                    this
                );
            }

            // 这个searchbox为了向前兼容。。。
            if (!this.searchBox && this.searchbox) {
                this.searchBox = this.searchbox;
            }

            if (this.searchBox) {
                var searchBox = this.target.viewContext.get(this.searchBox);
                if (searchBox) {
                    searchControls.searchBox = searchBox;
                }
                // 只有扩展处于激活状态才抛异常
                else if (this.active) {
                    throw new Error('Cannot find related searchBox "#' + searchBox + '" in view context');
                }
            }

            if (!searchControls.searchBox && !searchControls.selects.length && this.active) {
                throw new Error('searchBox and select cannot both be null');
            }

            return searchControls;
        };

        /**
         * 激活扩展
         *
         * @override
         */
        ExternSearch.prototype.activate = function () {
            this.handleSearchControls(
                function (searchBox) {
                    searchBox.on('search', search, this);
                },
                function (select, index) {
                    select.on('change', search, this);
                }
            );

            // 接收控件内清空搜索操作
            this.target.on('clearquery', clearQuery, this);

            Extension.prototype.activate.apply(this, arguments);
        };

        function search(e) {
            var filters = [];
            this.handleSearchControls(
                function (searchBox) {
                    var keywords = searchBox.getValue();
                    filters.push({ key: '', value: keywords });
                },
                function (select, index) {
                    var item = select.getSelectedItem();
                    if (item.value !== '' && select.dataKey) {
                        filters.push({ key: select.dataKey, value: item.value });
                    }
                }
            );

            // 如果就只有一个搜索框，就只发一个关键词
            if (filters.length === 1 && filters[0].key === '') {
                filters = filters[0].value;
            }

            this.target.search(filters);
        }

        function clearQuery() {
            this.handleSearchControls(
                function (searchBox) {
                    searchBox.set('text', '');
                },
                function (select) {
                    select.un('change', search, this);
                    select.setProperties({ selectedIndex: 0 });
                    select.on('change', search, this);
                }
            );
        }

        /**
         * 取消激活
         *
         * @override
         */
        ExternSearch.prototype.inactivate = function () {
            Extension.prototype.inactivate.apply(this, arguments);
            this.handleSearchControls(
                function (searchBox) {
                    searchBox.un('search', search, this);
                },
                function (select) {
                    select.un('change', search, this);
                },
                true
            );

            this.target.un('clearquery', clearQuery, this);
        };

        /**
         * 搜索控件的处理函数
         * @param {Function} searchBoxHandler searchBox的处理句柄
         * @param {Function} selectHandler select的处理句柄
         */
        ExternSearch.prototype.handleSearchControls = function (searchBoxHandler, selectHandler) {
            var searchControls = this.resolveSearchControls();
            var filters = [];
            if (searchControls.searchBox) {
                searchBoxHandler.call(this, searchControls.searchBox);
            }

            if (searchControls.selects.length) {
                u.each(
                    searchControls.selects,
                    selectHandler,
                    this
                );
            }
        };

        lib.inherits(ExternSearch, Extension);
        require('esui').registerExtension(ExternSearch);
        return ExternSearch;
    }
);
