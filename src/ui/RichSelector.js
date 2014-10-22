/**
 * UB-RIA 1.0
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 富选择单元控件
 * @author lixiang(lixiang05@baidu.com)
 */

define(
    function (require) {
        require('esui/Label');
        require('esui/Panel');
        require('esui/SearchBox');

        var lib = require('esui/lib');
        var painter = require('esui/painters');
        var InputControl = require('esui/InputControl');
        var u = require('underscore');

        /**
         * 控件类
         *
         * @constructor
         * @param {Object} options 初始化参数
         */
        function RichSelector(options) {
            InputControl.apply(this, arguments);
        }

        lib.inherits(RichSelector, InputControl);

        RichSelector.prototype.type = 'RichSelector';

        RichSelector.prototype.initOptions = function (options) {
            var properties = {
                height: 340,
                width: 200,
                // 是否需要标题栏
                hasHead: true,
                // 这个名字出现在标题栏
                title: '标题名',
                // 是否需要批量操作
                needBatchAction: false,
                // 批量操作文字
                batchActionLabel: '批量操作',
                // 是否有搜索功能
                hasSearchBox: true,
                // 是否有腿部信息
                hasFoot: true,
                // 这个字段是对腿部信息的填充
                itemName: '结果',
                // 搜索为空的提示
                emptyText: '没有相应的搜索结果',
                // 是否刷新数据时保持搜索状态
                holdState: false,
                // 选择器类型 'load', 'add', 'delete'
                // load: 点击某个节点，加载  出一堆别的数据，主要用于样式区分
                // add: 点击一个节点，把这个节点加到另一个容器里
                // delete: 点击一个节点，删
                mode: 'add',
                multi: true
            };

            if (options.hasHead === 'false') {
                options.hasHead = false;
            }

            if (options.hasSearchBox === 'false') {
                options.hasSearchBox = false;
            }

            if (options.hasFoot === 'false') {
                options.hasFoot = false;
            }

            if (options.holdState === 'false') {
                options.holdState = false;
            }

            if (options.multi === 'false') {
                options.multi = false;
            }

            lib.extend(properties, options);
            properties.width = Math.max(200, properties.width);
            this.setProperties(properties);
        };

        RichSelector.prototype.getHeadHTML = function () {
            var helper = this.helper;
            var actionLink = '';
            if (this.needBatchAction) {
                var linkClassName =
                    helper.getPartClassName('batch-action-link');
                var linkId = this.helper.getId('batch-action');
                actionLink = ''
                    + '<span class="' + linkClassName
                    + '" id="' + linkId + '" >'
                    + this.batchActionLabel
                    + '</span>';
            }

            var head = [
                '<div data-ui="type:Panel;childName:head;"',
                ' class="${headClass}">',
                '<h3 data-ui="type:Label;childName:title;">',
                '${title}</h3>',
                '${actionLink}',
                '</div>'
            ].join('\n');

            head = lib.format(
                head,
                {
                    headClass: helper.getPartClassName('head'),
                    title: this.title,
                    actionLink: actionLink
                }
            );

            return head;
        };

        RichSelector.prototype.getFootHTML = function () {
            return [
                '<div data-ui="type:Panel;childName:foot;"',
                ' class="' + this.helper.getPartClassName('foot') + '">',
                '<span data-ui="type:Label;childName:totalCount">',
                '</span>',
                '</div>'
            ].join('\n');
        };

        RichSelector.prototype.initStructure = function () {
            var tpl = [
                // 表头
                '${head}',
                // 内容
                '<div data-ui="type:Panel;childName:body;"',
                ' class="${bodyClass}">',
                    '${searchInput}',
                    // 搜索结果列表区
                    '<div data-ui="type:Panel;childName:content"',
                    ' class="${contentClass}">',
                        // 结果为空提示
                        '<div data-ui="type:Label;childName:emptyText"',
                        ' class="${emptyTextClass}">${emptyText}</div>',
                        // 结果列表
                        '<div data-ui="type:Panel;childName:queryList"',
                        ' class="${queryListClass}">',
                        '</div>',
                    '</div>',
                '</div>',
                // 腿部概要信息
                '${footInfo}'
            ];

            var helper = this.helper;
            var head = '';
            if (this.hasHead) {
                head = this.getHeadHTML();
            }

            var searchInput = '';
            if (this.hasSearchBox) {
                var searchBoxWidth = this.width - 45;
                searchInput = [
                    // 搜索区
                    '<div data-ui="type:Panel;childName:searchBoxArea"',
                    ' class="${searchWrapperClass}">',
                    '<div data-ui="type:SearchBox;childName:itemSearch;"',
                    ' data-ui-skin="magnifier"',
                    ' data-ui-width="' + searchBoxWidth + '">',
                    '</div>',
                    '</div>',
                    // 搜索结果概要
                    '<div data-ui="type:Panel;',
                    'childName:generalQueryResultArea"',
                    ' class="${generalQueryResultClass}"',
                    ' id="${queryResultId}">',
                    '<span class="${linkClass}" id="${linkId}">清空</span>',
                    '共找到<span id="${queryResultCountId}"></span>个',
                    '</div>'
                ].join('\n');

                searchInput = lib.format(
                    searchInput,
                    {
                        searchWrapperClass:
                            helper.getPartClassName('search-wrapper'),
                        generalQueryResultClass:
                            helper.getPartClassName('query-result-general'),
                        queryResultCountId: helper.getId('result-count'),
                        linkClass: helper.getPartClassName('clear-query-link'),
                        linkId: helper.getId('clear-query')
                    }
                );
            }
            var footInfo = '';
            if (this.hasFoot) {
                footInfo = this.getFootHTML();
            }

            this.main.style.width = this.width + 'px';
            this.main.innerHTML = lib.format(
                tpl.join('\n'),
                {
                    head: head,
                    bodyClass: helper.getPartClassName('body'),
                    searchInput: searchInput,
                    contentClass: helper.getPartClassName('content-wrapper'),
                    emptyTextClass: helper.getPartClassName('empty-text'),
                    emptyText: this.emptyText,
                    queryListClass: helper.getPartClassName('query-list'),
                    footInfo: footInfo
                }
            );

            this.initChildren();

            // 初始化模式状态
            if (this.mode === 'load') {
                this.addState('load');
            }
            else if (this.mode === 'add') {
                this.addState('add');
            }
            else {
                this.addState('del');
            }

            // 绑事件
            var batchActionLink = helper.getPart('batch-action');
            if (batchActionLink) {
                helper.addDOMEvent(
                    batchActionLink,
                    'click',
                    u.bind(this.batchAction, this)
                );
            }

            var clearQueryLink = helper.getPart('clear-query');
            if (clearQueryLink) {
                helper.addDOMEvent(
                    clearQueryLink,
                    'click',
                    u.bind(this.clearQuery, this)
                );
            }

            var searchBox = this.getSearchBox();
            if (searchBox) {
                searchBox.on('search', search, this);
            }

            // 为备选区绑定事件
            var queryList = this.getQueryList().main;
            helper.addDOMEvent(
                queryList,
                'click',
                u.bind(this.eventDispatcher, this)
            );
        };


        /**
         * 点击行为分发器
         * @param {Event} e 事件对象
         * @ignore
         */
        RichSelector.prototype.eventDispatcher = function (e) {
            return false;
        };


        /**
         * 根据关键词搜索结果
         * @param {event} e SearchBox的点击事件对象
         * @ignore
         */
        function search(e) {
            this.search();
        }

        /**
         * 按条件搜索
         * @param {string | Object} args 搜索参数
         */
        RichSelector.prototype.search = function (args) {
            // filterData中的元素要满足一个标准结构: { keys: [], value: '' }
            // 其中数组型的keys代表一种“并集”关系，也可以不提供
            // filterData的各个元素代表“交集”关系。
            var event = {
                filterData: []
            };
            event = this.fire('search', event);
            // 如果没有外部提供搜索条件
            if (!event.isDefaultPrevented()) {
                // 取自带搜索框的值
                var searchBox = this.getSearchBox();
                if (searchBox) {
                    var defaultFilter = {
                        value: lib.trim(searchBox.getValue())
                    };
                    event.filterData.push(defaultFilter);
                }
            }

            if (event.filterData.length) {
                // 查询
                this.queryItem(event.filterData);
                // 更新概要搜索结果区
                this.refreshResult();
                // 更新腿部总结果
                this.refreshFoot();

                // 更新状态
                this.addState('queried');
                // 调整高度
                this.adjustHeight();
            }
            // 相当于执行清空操作
            else {
                this.clearQuery();
            }
        };

        RichSelector.prototype.refreshResult = function () {
            var count = this.getCurrentStateItemsCount();
            var resultCount = this.helper.getPart('result-count');
            if (resultCount) {
                resultCount.innerHTML = count;
            }
        };

        function resetSearchState(control) {
            // 删除搜索状态
            control.removeState('queried');

            // 清空搜索框
            var searchBox = control.getSearchBox();
            if (searchBox) {
                searchBox.set('text', '');
            }
        }

        /**
         * 清除搜索结果
         * @param {ui.RichSelector} richSelector 类实例
         * @ignore
         */
        RichSelector.prototype.clearQuery = function () {
            // 重置搜索
            resetSearchState(this);

            // 清空数据
            this.clearData();

            // 概要搜索结果区归零
            this.refreshResult();

            // 更新备选区
            this.refreshContent();

            // 更新腿部总结果
            this.refreshFoot();

            // 调整高度
            this.adjustHeight();

            this.fire('clearquery');

            return false;
        };

        /**
         * 获取结果列表承载容器控件，列表在它里面
         * @param {ui.RichSelector} richSelector 类实例
         * @return {ui.Panel}
         * @ignore
         */
        RichSelector.prototype.getContent = function () {
            var body = this.getChild('body');
            if (body) {
                return body.getChild('content');
            }
            return null;
        };

        RichSelector.prototype.getKeyword = function () {
            var searchBox = this.getSearchBox();
            var isQuery = this.isQuery();
            if (searchBox && isQuery) {
                return lib.trim(searchBox.getValue());
            }
            return null;
        };

        /**
         * 获取结果列表控件
         * @return {ui.TreeForSelector | ui.ListForSelector}
         * @ignore
         */
        RichSelector.prototype.getQueryList = function () {
            var content = this.getContent();
            if (content) {
                return content.getChild('queryList');
            }
            return null;
        };

        /**
         * 获取搜索控件
         * @return {ui.Panel}
         * @ignore
         */
        RichSelector.prototype.getSearchBox = function () {
            var searchBoxArea =
                this.getChild('body').getChild('searchBoxArea');
            if (searchBoxArea) {
                return searchBoxArea.getChild('itemSearch');
            }
        };

        /**
         * 获取腿部总个数容器
         * @param {ui.RichSelector} richSelector 类实例
         * @return {ui.Panel}
         * @ignore
         */
        RichSelector.prototype.getTotalCountPanel = function () {
            var foot = this.getChild('foot');
            if (!foot) {
                return null;
            }
            return foot.getChild('totalCount');
        };

        /**
         * 判断是否处于query状态
         * @return {boolean}
         */
        RichSelector.prototype.isQuery = function () {
            return this.hasState('queried');
        };

        /**
         * 批量操作事件处理
         * 可重写
         *
         */
        RichSelector.prototype.batchAction = function () {
            if (this.mode === 'delete') {
                this.deleteAll();
                this.refreshFoot();
            }
            else if (this.mode === 'add') {
                this.selectAll();
            }
            return false;
        };

        RichSelector.prototype.deleteAll = function () {
            return false;
        };

        RichSelector.prototype.addAll = function () {
            return false;
        };

        /**
         * 调整高度。
         * 出现搜索信息时，结果区域的高度要变小，才能使整个控件高度不变
         *
         */
        RichSelector.prototype.adjustHeight = function() {
            // 用户设置总高度
            var settingHeight = this.height;

            // 头部高度 contentHeight + border
            var headHeight = 28;

            // 是否有搜索框
            var searchBoxHeight = this.hasSearchBox ? 45 : 0;

            // 是否有腿部信息
            var footHeight = this.hasFoot ? 25 : 0;

            // 结果区高度 = 总高度 - 头部高度 - 搜索框高度 - 腿部高度
            var contentHeight =
                settingHeight - headHeight - searchBoxHeight - footHeight;

            // 处于query状态时，会有一个30px的概要信息区
            if (this.isQuery()) {
                contentHeight -= 30;
            }

            var content = this.getContent().main;
            content.style.height = contentHeight + 'px';
        };

        RichSelector.prototype.adaptData = function () {};

        /**
         * 手动刷新
         *
         * @param {ui.RichSelector} richSelector 类实例
         * @ignore
         */
        RichSelector.prototype.refresh = function () {
            // 重建数据，包括索引数据的创建
            var adaptedData = this.adaptData();

            var needRefreshContent = true;
            // 刷新搜索区
            if (this.hasSearchBox && this.isQuery()) {
                // 有一种场景（一般在删除型控件里）
                // 在搜索状态下，删除了某个节点之后，希望还保留在搜索状态下
                if (this.holdState) {
                    // 根据关键字获取结果
                    this.search(this.getKeyword());
                    // search方法里面已经执行过了
                    needRefreshContent = false;
                }
                // 清空搜索区
                else {
                    resetSearchState(this);
                }
            }

            // 刷新主体
            if (needRefreshContent) {
                // 重绘视图
                this.refreshContent();
                // 视图重绘后的一些额外数据处理
                this.processDataAfterRefresh(adaptedData);
                // 更新底部信息
                this.refreshFoot();
                // 更新高度
                this.adjustHeight();
            }
        };

        /**
         * 视图刷新后的一些额外处理
         *
         * @param {Object} adaptedData 适配后的数据
         */
        RichSelector.prototype.processDataAfterRefresh = function (adaptedData) {};

        /**
         * 更新腿部信息
         *
         * @param {ui.RichSelector} richSelector 类实例
         * @ignore
         */
        RichSelector.prototype.refreshFoot = function () {
            if (!this.hasFoot) {
                return;
            }
            var count = this.getCurrentStateItemsCount();

            // 更新腿部总结果
            var totalCountPanel = this.getTotalCountPanel();
            if (totalCountPanel) {
                var itemName = u.escape(this.itemName);
                totalCountPanel.setText('共 ' + count + ' 个' + itemName);
            }
        };

        RichSelector.prototype.getCurrentStateItemsCount = function () {
            return 0;
        };


        /**
         * 重新渲染视图
         * 仅当生命周期处于RENDER时，该方法才重新渲染
         *
         * @param {Array=} 变更过的属性的集合
         * @override
         */
        RichSelector.prototype.repaint = painter.createRepaint(
            InputControl.prototype.repaint,
            {
                name: 'title',
                paint: function (control, title) {
                    var head = control.getChild('head');
                    var titleLabel = head && head.getChild('title');
                    titleLabel && titleLabel.setText(title);
                }
            }
        );

        /**
         * 获取已经选择的数据项
         * 就是一个代理，最后从结果列表控件里获取
         * @return {Array}
         * @public
         */
        RichSelector.prototype.getSelectedItems = function () {
            return [];
        };

        /**
         * 批量更新状态
         * @param {Array} items 需要更新的对象集合
         * @param {boolean} toBeSelected 要选择还是取消选择
         * @public
         */


        /**
         * 批量更新选择状态
         * @param {Array} items 需要更新的对象集合
         * @param {boolean} toBeSelected 要选择还是取消选择
         * @public
         */
        RichSelector.prototype.selectItems = function (items, toBeSelected) {};

        /**
         * 设置元数据
         *
         * @param {Array} selectedItems 置为选择的项.
         */
        RichSelector.prototype.setRawValue = function (selectedItems) {
            this.rawValue = selectedItems;
            this.selectItems(selectedItems, true);
        };

        /**
         * 获取已经选择的数据项
         *
         * @return {Array}
         */
        RichSelector.prototype.getRawValue = function () {
            return this.getSelectedItems();
        };


        /**
         * 将value从原始格式转换成string
         *
         * @param {*} rawValue 原始值
         * @return {string}
         */
        RichSelector.prototype.stringifyValue = function (rawValue) {
            var selectedIds = [];
            u.each(rawValue, function (item) {
                selectedIds.push(item.id);
            });
            return selectedIds.join(',');
        };

        require('esui').register(RichSelector);

        return RichSelector;
    }
);
