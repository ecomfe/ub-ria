/**
 * UB RIA Base
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file MVC体系扩展
 * @author otakustay
 */
define(
    function (require) {
        var u = require('../util');
        var util = require('er/util');
        var events = require('er/events');

        function addPageClassName() {
            var add = function (e) {
                if (!e.action || !e.action.getPageCategories) {
                    return;
                }

                var element = util.getElement(e.container);

                if (!element) {
                    return;
                }

                var pageClasses = e.action.getPageCategories();

                // `addClass`的简单实现
                if (element.classList) {
                    u.each(
                        pageClasses,
                        function (className) {
                            element.classList.add(className);
                        }
                    );
                }
                else {
                    var classes = element.className
                        ? element.className.split(/\s+/)
                        : [];
                    classes = u.union(classes, pageClasses);
                    element.className = classes.join(' ');
                }
            };

            var remove = function (e) {
                if (!e.action || !e.action.getPageCategories) {
                    return;
                }

                // `enteractionfail`可以直接取到`e.container`，`leaveaction`则要从`action`上取
                var container = e.actionContext
                    ? e.container
                    : (e.action.context ? e.action.context.container : null); // 非常极端的情况会导致`null`
                var element = util.getElement(container);

                if (!element) {
                    return;
                }

                var pageClasses = e.action.getPageCategories();

                // `removeClass`的简单实现
                if (element.classList) {
                    u.each(
                        pageClasses,
                        function (className) {
                            element.classList.remove(className);
                        }
                    );
                }
                else {
                    var classes = element.className
                        ? element.className.split(/\s+/)
                        : [];
                    var newClasses = u.difference(classes, pageClasses);
                    if (newClasses.length !== classes.length) {
                        element.className = newClasses.join(' ');
                    }
                }
            };

            events.on('enteraction', add);
            events.on('leaveaction', remove);
            events.on('enteractionfail', remove);
        }

        function enable() {
            addPageClassName();
        }

        /**
         * MVC体系扩展
         *
         * @namespace extension.mvc
         * @memberof extension
         */
        return {
            /**
             * 启动扩展
             *
             * @method extension.mvc.enable
             */
            enable: u.once(enable)
        };
    }
);
