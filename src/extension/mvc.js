/**
 * UB RIA Base
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file MVC体系扩展
 * @author otakustay
 */
define(
    function (require) {
        var u = require('../util');
        var util = require('er/util');
        var events = require('er/events');

        function addPageClassName() {
            events.on(
                'enteractioncomplete',
                function (e) {
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
                }
            );
            events.on(
                'leaveaction',
                function (e) {
                    if (!e.action || !e.action.getPageCategories) {
                        return;
                    }

                    var element = util.getElement(e.action.context.container);

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
                }
            );
        }

        function enable() {
            addPageClassName();
        }

        return {
            enable: u.once(enable)
        };
    }
);
