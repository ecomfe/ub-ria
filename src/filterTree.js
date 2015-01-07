/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 过滤树节点工具模块
 * @author otakustay
 * @date $DATE$
 */
define(
    function (require) {
        var u = require('./util');
        var exports = {};

        function filterNode(filter, node) {
            // 过滤的条件是自身符合`filter`，或子节点有任意一个能通过过滤（递归）
            if (node.children) {
                node.children = u.filter(
                    node.children,
                    u.partial(filterNode, filter)
                );
            }

            if ((node.children && node.children.length) || filter(node)) {
                return node;
            }

            return null;
        }

        /**
         * 根据函数过滤树的节点
         *
         * @param {Object} tree 树的数据源对象
         * @param {Function} filter 过滤函数，返回`true`表示加入过滤后的结果
         * @return {Object} 过滤后的数据源对象
         */
        exports.byFunction = function (tree, filter) {
            var result = filterNode(filter, tree);
            if (!result) {
                result = u.omit(tree, 'children');
                result.children = [];
            }
            return result;
        };

        /**
         * 根据关键词过滤树的节点
         *
         * @param {Object} tree 树的数据源对象
         * @param {string} keyword 关键词
         * @return {Object} 过滤后的数据源对象
         */
        exports.byKeyword = function (tree, keyword) {
            var filter = function (node) {
                return node.text.indexOf(keyword) >= 0;
            };
            return exports.byFunction(tree, filter);
        };

        return exports;
    }
);
