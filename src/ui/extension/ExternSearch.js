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
         * 指定对应的searchbox的id，必须指定
         *
         * @type {string | null}
         */
        ExternSearch.prototype.searchbox = null;

        /**
         * 指定对应的select的id，必须指定
         *
         * @type {string | null}
         */
        ExternSearch.prototype.selects = null;

        /**
         * 找到控件对应的搜索类控件
         *
         * @param {Boolean} isActivated 是否已经activate过
         * @return {esui.SearchBox}
         */
        ExternSearch.prototype.resolveSearchControls = function (isActivated) {
            var searchControls = { searchbox: null, select: [] };
            if (this.select) {
                var selects = this.select.split('|');
                var selectKeys = this.selectKey.split('|');
                u.each(
                    selects,
                    function (select, index) {
                        var select = this.target.viewContext.get(select);
                        // 可能存在控件其实已经被dispose了的情况，这种情况不需要抛异常
                        if (!select && !isActivated) {
                            throw new Error('Cannot find related select "#' + select + '" in view context');
                        }
                        searchControls.select.push({ control: select, key: selectKeys[index] });
                    },
                    this
                );
            }

            if (this.searchbox) {
                var searchbox = this.target.viewContext.get(this.searchbox);
                // 可能存在控件其实已经被dispose了的情况，这种情况不需要抛异常
                if (!searchbox && !isActivated) {
                    throw new Error('Cannot find related searchbox "#' + searchbox + '" in view context');
                }
                searchControls.searchbox = searchbox;
            }

            if (!searchControls.searchbox && !searchControls.selects.length) {
                throw new Error('searchbox and select cannot both be null');
            }

            return searchControls;
        };

        /**
         * 激活扩展
         *
         * @override
         */
        ExternSearch.prototype.activate = function () {
            var me = this;
            this.handleSearchControls(
                function (searchbox) {
                    searchbox.on('search', search, me);
                },
                function (select, index) {
                    select.control.on('change', search, me);
                }
            );

            // 接收控件内清空搜索操作
            this.target.on('clearquery', clearQuery, this);

            Extension.prototype.activate.apply(this, arguments);
        };

        function search(e) {
            var me = this;
            var filters = [];
            this.handleSearchControls(
                function (searchbox) {
                    var keywords = searchbox.getValue();
                    filters.push({ key: 'name', value: keywords });
                },
                function (select, index) {
                    var item = select.control.getSelectedItem();
                    if (item.value !== '') {
                        filters.push({ key: select.key, value: item.value });
                    }
                }
            );

            this.target.search(filters);
        }

        function clearQuery() {
            var me = this;
            this.handleSearchControls(
                function (searchbox) {
                    searchbox.set('text', '');
                },
                function (select) {
                    select.control.un('change', search, me);
                    select.control.setProperties({ selectedIndex: 0 });
                    select.control.on('change', search, me);
                }
            );
        }

        /**
         * 取消激活
         *
         * @override
         */
        ExternSearch.prototype.inactivate = function () {
            var me = this;
            this.handleSearchControls(
                function (searchbox) {
                    searchbox.un('search', search, me);
                },
                function (select) {
                    select.control.un('change', search, me);
                },
                true
            );

            this.target.un('clearquery', clearQuery, this);
            Extension.prototype.inactivate.apply(this, arguments);
        };

        /**
         * 搜索控件的处理函数
         * @param {Function} searchboxHandler searchbox的处理句柄
         * @param {Function} selectHandler select的处理句柄
         * @param {Boolean} isActivated 是否已经激活
         */
        ExternSearch.prototype.handleSearchControls = function (searchboxHandler, selectHandler, isActivated) {
            var searchControls = this.resolveSearchControls(isActivated);
            var filters = [];
            if (searchControls.searchbox) {
                searchboxHandler(searchControls.searchbox);
            }

            if (searchControls.select.length) {
                u.each(
                    searchControls.select,
                    function (select, index) {
                        selectHandler(select, index);
                    },
                    this
                );
            }
        };

        lib.inherits(ExternSearch, Extension);
        require('esui').registerExtension(ExternSearch);
        return ExternSearch;
    }
);
