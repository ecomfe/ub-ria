/**
 * ESUI (Enterprise Simple UI)
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 树的数据交互策略类
 * @author lixiang(lixiang05@baidu.com)
 */

define(
    function (require) {
        var lib = require('esui/lib');

        /**
         * 树的数据交互策略
         *
         * @class ui.SelectorTreeStrategy
         */
        var exports = {};

        /**
         * @constructs ui.SelectorTreeStrategy
         * @override
         * @param {Object=} options 初始化参数
         * @param {boolean=} options.defaultExpand 节点是否展开，默认为`false`
         */
        exports.constructor = function (options) {
            var defaults = {
                defaultExpand: true,
                // 需要一种定向展开的策略，
                // 也就是允许某些符合条件的节点展开，某些不展开
                orientExpand: false
            };
            lib.extend(this, defaults, options);
        };

        /**
         * 判断一个节点是否叶子节点
         *
         * @param {Object} node 节点数据项
         * @return {boolean}
         */
        exports.isLeafNode = function (node) {
            return !node.children;
        };

        /**
         * 判断一个节点是否应该展开
         *
         * @param {Object} node 节点数据项
         * @return {boolean}
         */
        exports.shouldExpand = function (node) {
            // 定向展开
            if (this.orientExpand) {
                // @FIXME 忘记了为什么用这么个属性判断要不要展开
                // 后面应该会改用比如 shouldExpand这种
                return !node.isSelected;
            }

            return this.defaultExpand;
        };

        /**
         * 启用策略
         *
         * @param {esui.Tree} tree 控件实例
         */
        exports.enableSelectStrategy = function (tree) {
            var treeStrategy = this;
            tree.on(
                'select',
                function (e) {
                    var canSelect = true;
                    var isLeafNode = treeStrategy.isLeafNode(e.node);
                    if (treeStrategy.mode !== 'load') {
                        // 只有叶子节点可以点的时候，其余节点都别点了
                        if (treeStrategy.onlyLeafSelect && !isLeafNode) {
                            canSelect = false;
                        }
                    }
                    // 加载型Tree不管你设置的是啥，都只能是也子节点可以点
                    else {
                        if (!isLeafNode) {
                            canSelect = false;
                        }
                    }

                    if (canSelect) {
                        this.selectNode(e.node.id);
                    }
                }
            );
            tree.on(
                'unselect',
                function (e) {
                    if (tree.get('allowUnselectNode')) {
                        tree.unselectNode(e.node.id);
                    }
                }
            );
        };

        var TreeStrategy = require('esui/TreeStrategy');
        var SelectorTreeStrategy = require('eoo').create(TreeStrategy, exports);

        return SelectorTreeStrategy;
    }
);
