/**
 * ADM 2.0
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file Sidebar控件
 * @author zhanglili(otakustay@gmail.com)
 */
define(
    // 当前可用度：
    //
    // - 无HTML的情况下，直接通过js设置`items`等属性渲染未进行测试，项目用不上这些
    // - `searchBox`和`content`应该可用，但未经严格测试，设置模块不需要这些
    function (require) {
        var lib = require('esui/lib');
        var helper = require('esui/controlHelper');
        var ui = require('esui');
        var Control = require('esui/Control');
        var u = require('underscore');

        require('esui/Panel');

        /**
         * Sidebar控件
         *
         * @param {Object=} options 初始化参数
         * @extends esui/Control
         * @constructor
         * @public
         */
        function Sidebar(options) {
            Control.apply(this, arguments);
        }

        Sidebar.prototype.type = 'Sidebar';

        /**
         * 默认属性
         *
         * @type {Object}
         * @public
         */
        Sidebar.defaultProperties = {
            topMargin: 60,
            mode: 'normal', // normal为占位，overlay为不占位
            subMenuMutex: 1
        };

        /**
         * 创建主元素
         *
         * @return {HTMLElement}
         * @override
         * @protected
         */
        Sidebar.prototype.createMain = function () {
            return document.createElement('aside');
        };

        /**
         * 初始化参数
         *
         * @param {Object=} options 构造函数传入的参数
         * @override
         * @protected
         */
        Sidebar.prototype.initOptions = function (options) {
            var properties = {
                expanded: false,
                items: []
            };
            lib.extend(properties, Sidebar.defaultProperties, options);

            this.setProperties(properties);
        };

        /**
         * 修改隔壁的元素的样式，给侧边栏空出足够位置
         *
         * @param {Sidebar} sidebar 侧边栏控件实例
         */
        function adjustNeighbour(sidebar) {
            // 侧边栏收起时一定处在`overlay`模式，
            // 因此展开状态下仅在`normal`模式下计算，在收起状态下永远计算
            var neighbour = lib.dom.next(sidebar.main);
            if (neighbour) {
                // TODO: 如果有`transition`，这里取值是不正确的
                neighbour.style.marginLeft =
                    sidebar.main.offsetWidth + 'px';
            }
        }

        /**
         * 控制收起和展开
         *
         * @param {Event} e DOM事件对象
         */
        function toggle() {
            this.toggleState('collapse');
        }

        function openSubMenu(sidebar, el) {
            var className = helper.getPartClasses(sidebar, 'menu-item-opened')[0];

            if (sidebar.subMenuMutex) {
                var subMenuDropdwonClass = helper.getPartClasses(sidebar, 'subMenu-dropdown')[0];
                var subMenus = lib.q(subMenuDropdwonClass, sidebar.main);
                u.each(subMenus, function(subMenu){
                    if (subMenu !== el) {
                        lib.removeClass(subMenu.parentNode, className);
                    }
                });
            }

            lib.toggleClass(el.parentNode, className);
        }

        function mainClickHandler(e) {
            var target = e.target;
            var subMenuDropdwonClass = helper.getPartClasses(this, 'subMenu-dropdown')[0];
            while (target
                    && target !== this.main) {
                if ( lib.hasClass(target, subMenuDropdwonClass) ) {
                    openSubMenu(this, target);
                    break;
                } 
                target = target.parentNode;
            }
        }

        function mainMouseOverHandler(e) {
            var target = e.target;
            var menuItemClass = helper.getPartClasses(this, 'menu-item')[0];
            var subMenuClass = helper.getPartClasses(this, 'subMenu')[0];
            var menuItemHoverClass = helper.getPartClasses(this, 'menu-item-hover')[0];
            while (target
                    && target !== this.main) {
                if (lib.hasClass(target, subMenuClass)) {
                    break;
                }
                if ( lib.hasClass(target, menuItemClass) ) {
                    lib.addClass(target, menuItemHoverClass);
                    break;
                } 
                target = target.parentNode;
            }
        }

        function mainMouseOutHandler(e) {
            var target = e.target;
            var menuItemClass = helper.getPartClasses(this, 'menu-item')[0];
            var subMenuClass = helper.getPartClasses(this, 'subMenu')[0];
            var menuItemHoverClass = helper.getPartClasses(this, 'menu-item-hover')[0];
            while (target
                    && target !== this.main) {
                if (lib.hasClass(target, subMenuClass)) {
                    break;
                }
                if ( lib.hasClass(target, menuItemClass) ) {
                    lib.removeClass(target, menuItemHoverClass);
                    break;
                } 
                target = target.parentNode;
            }
        }

        /**
         * 调整侧边栏位置，保持上边距并占满高度
         */
        function adjustPosition() {
            var scrollTop = lib.page.getScrollTop();
            this.main.style.top =
                Math.max(this.topMargin - scrollTop, 0) + 'px';
        }


        /**
         * 根据控件配置生成DOM结构
         *
         * @param {Sidebar} sidebar 侧边栏控件实例
         */
        function buildDOMStructure(sidebar) {
            var menuTemplate = '<ul class="${className}">${listHtml}</ul>';
            var menuItemTemplate = '<li  class="${className}">'
                                + '<a class="${linkClass}" href="${href}">'
                                + '<i class="${iconClass}"></i>'
                                + '<span>${text}</span></a>${dropDownHtml}'
                                + '${subMenuHtml}</li>';

            var dropDownTemplate = '<em class="${className}"></em>';

            var subMenuTemplate = '<ul class="${className}">'
                                    + '${listHtml}</ul>';
            var subMenuItemTemplate = '<li class="${className}">'
                                        + '<a href="${href}" class="${linkClass}">${text}</a></li>';

            // 规则见上面那个函数
            var activeIndex = 0;
            var html = [];
            var datasource = sidebar.datasource;
            var itemLinkClass = helper.getPartClasses(sidebar, 'menu-item-link').join(' ');
            var iconClass = helper.getPartClasses(sidebar, 'menu-icon').join(' ');
            var itemClass = helper.getPartClasses(sidebar, 'menu-item');
            var hasChildClass = helper.getPartClasses(sidebar, 'menu-item-hasChild');

            var subLinkClass = helper.getPartClasses(sidebar, 'subMenu-item-link').join(' ');
            var subItemClass = helper.getPartClasses(sidebar, 'subMenu-item').join(' ');
            var subMenuClass = helper.getPartClasses(sidebar, 'subMenu').join(' ');
            var subMenuDropDownClass = helper.getPartClasses(sidebar, 'subMenu-dropdown').join(' ');

            for (var i = 0; i < datasource.length; i++) {
                var item = datasource[i];
                var data = {
                    text: lib.encodeHTML(item.text),
                    href: item.href ? lib.encodeHTML(item.href) : 'javascript:void(0)',
                    className: itemClass.concat(
                                    helper.getPartClasses(sidebar, 'menu-' + item.name)
                                ),
                    linkClass: itemLinkClass,
                    iconClass: iconClass
                };

                var children = item.children;
                if (children && children.length) {
                    data.className = data.className.concat(hasChildClass);

                    var subListHtml = [];

                    var childrenLen = children.length;
                    for (var j = 0; j < childrenLen; j++) {
                        var child = children[j];

                        var childData = {
                            text: lib.encodeHTML(child.text),
                            href: lib.encodeHTML(child.href),
                            className: subItemClass
                                    + ' '
                                    + (j === 0 
                                        ?  sidebar.helper.getPartClassName(sidebar, 'subMenu-item-first') : '')
                                    + ' '
                                    + (j === childrenLen - 1 
                                        ? sidebar.helper.getPartClassName(sidebar, 'subMenu-item-last') : ''),
                            linkClass: subLinkClass
                        };

                        subListHtml.push(lib.format(
                            subMenuItemTemplate,
                            childData
                        ));
                    }

                    data.subMenuHtml = lib.format(
                        subMenuTemplate,
                        {
                            className: subMenuClass,
                            listHtml: subListHtml.join('')
                        }
                    );
                }

                data.dropDownHtml = data.subMenuHtml 
                                    ? lib.format(
                                        dropDownTemplate, 
                                        { className: subMenuDropDownClass }
                                      )
                                    : '';

                data.className = data.className.join(' ');

                html.push(lib.format(
                    menuItemTemplate,
                    data
                ));
            }

            sidebar.main.innerHTML = lib.format(
                menuTemplate,
                {
                    className: helper.getPartClasses(sidebar, 'menu').join(' '),
                    listHtml: html.join(' ')
                }
            );
        }


        function getUrlHash(url) {
            return url.substr( (url.indexOf('#') + 1) || 0 );
        }

        Sidebar.prototype.toggle = function() {
            toggle.call(this);
            adjustNeighbour(this);
            this.fire('modechange');
        };

        Sidebar.prototype.selectMenuItem = function(path) {
            var items = this.main.getElementsByTagName('li');
            var activeClass = helper.getPartClasses(this, 'menu-item-active')[0];
            var itemClass = helper.getPartClasses(this, 'menu-item')[0];

            u.each(items, function(item) {
                lib.removeClass(item, activeClass);
            });

            u.each(items, function(item) {
                if (path === getUrlHash(item.children[0].href)) {
                    lib.addClass(item, activeClass);
                    var topMenu = item.parentNode.parentNode;
                    if (lib.hasClass(topMenu, itemClass)) {
                        lib.addClass(topMenu, activeClass);
                    }
                }
            });
        };

        /**
         * 初始化DOM结构
         *
         * @override
         * @protected
         */
        Sidebar.prototype.initStructure = function () {
            // 只支持2种模式，要么全部从HTML中生成，要么全部从JS中生成，不支持混合
            buildDOMStructure(this);

            this.adjustPosition = lib.bind(adjustPosition, this);

            helper.addDOMEvent(
                this,
                this.main,
                'click',
                lib.bind(mainClickHandler, this)
            );

            helper.addDOMEvent(
                this,
                this.main,
                'mouseover',
                lib.bind(mainMouseOverHandler, this)
            );

            helper.addDOMEvent(
                this,
                this.main,
                'mouseout',
                lib.bind(mainMouseOutHandler, this)
            );
        };

        /**
         * 渲染自身
         *
         * @override
         * @protected
         */
        Sidebar.prototype.repaint = helper.createRepaint(
            Control.prototype.repaint,
            {
                // 展开状态
                name: 'expanded',
                paint: function (sidebar, expanded) {
                    var method = expanded ? 'removeState' : 'addState';
                    sidebar[method]('collapse');

                    adjustNeighbour(sidebar);
                }
            },
            {
                // 上边距
                name: 'topMargin',
                paint: function (sidebar, topMargin) {
                    sidebar.adjustPosition();
                }
            },
            {
                // 是否固定占位，即无法收缩和展开
                name: 'fixed',
                paint: function (sidebar, fixed) {
                    var method = fixed ? 'addState' : 'removeState';
                    sidebar[method]('fixed');
                }
            }
        );

        Sidebar.prototype.dispose = function () {
            Control.prototype.dispose.apply(this, arguments);
        };

        lib.inherits(Sidebar, Control);
        ui.register(Sidebar);
        return Sidebar;
    }
);
