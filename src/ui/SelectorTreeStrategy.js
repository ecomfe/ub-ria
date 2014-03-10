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
        var TreeStrategy = require('esui/TreeStrategy');

        /**
         * 树的数据交互策略
         *
         * @param {Object=} options 初始化参数
         * @param {boolean=} options.defaultExpand 节点是否展开，默认为`false`
         * @constructor
         * @public
         */
        function SelectorTreeStrategy(options) {
            var defaults = {
                defaultExpand: true,
                // 需要一种定向展开的策略，
                // 也就是允许某些符合条件的节点展开，某些不展开
                orientExpand: false
            };
            lib.extend(this, defaults, options);
        }

        lib.inherits(SelectorTreeStrategy, TreeStrategy);

        /**
         * 判断一个节点是否叶子节点
         *
         * @param {Object} node 节点数据项
         * @return {boolean}
         * @public
         */
        SelectorTreeStrategy.prototype.isLeafNode = function (node) {
            return !node.children;
        };

        /**
         * 判断一个节点是否应该展开
         *
         * @param {Object} node 节点数据项
         * @return {boolean}
         * @public
         */
        SelectorTreeStrategy.prototype.shouldExpand = function (node) {
            // 定向展开
            if (this.orientExpand) {
                // @FIXME 忘记了为什么用这么个属性判断要不要展开
                // 后面应该会改用比如 shouldExpand这种
                return !node.isSelected;
            }
            else {
                return this.defaultExpand;
            }
        };

        SelectorTreeStrategy.prototype.enableSelectStrategy = function (tree) {
            var treeStrategy = this;
            tree.on(
                'select',
                function (e) {
                    var canSelect = true;
                    var isLeafNode = treeStrategy.isLeafNode(e.node);
                    if (treeStrategy.mode !== 'load') {
                        if (treeStrategy.onlyLeafSelect && !isLeafNode) {
                            canSelect = false;
                        }
                    }
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

        return SelectorTreeStrategy;
    }
);