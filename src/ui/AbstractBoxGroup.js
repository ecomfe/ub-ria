/**
 * ESUI (Enterprise Simple UI)
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 选择框组
 * @author otakustay
 */
define(
    function (require) {
        var u = require('../util');
        var lib = require('esui/lib');
        var InputControl = require('esui/InputControl');

        /**
         * 单选或复选框组控件
         *
         * @extends InputControl
         * @constructor
         */
        function AbstractBoxGroup() {
            InputControl.apply(this, arguments);
        }


        function getValue(element) {
            return getAttr(element, 'value');
        }

        function getAttr(element, attribute) {
            return element.getAttribute('data-ui-' + attribute);
        }

        function setAttr(element, attribute, value) {
            element.setAttribute('data-ui-' + attribute, value);
        }

        function isChecked(box) {
            return getAttr(box, 'checked') === 'checked';
        }

        /**
         * 控件类型，始终为`"BoxGroup"`
         *
         * @type {string}
         * @readonly
         * @override
         */
        AbstractBoxGroup.prototype.type = 'AbstractBoxGroup';

        /*
         * 从已有的DOM中分析出数据源
         *
         * @param {HTMLElement} element 供分析的DOM元素
         * @param {Object} options 输入的配置项
         * @param {string|undefined} options.name 输入控件的名称
         * @param {string} options.boxType 选项框的类型，参考`unknownTypes`
         * @ignore
         */
        function extractDatasourceFromDOM(element, options) {
            // 提取符合以下条件的子`<input>`控件：
            //
            // - `type`属性已知（基本就是`radio`和`checkbox`）
            // - 二选一：
            //     - 当前控件和`<input>`控件都没有`name`属性
            //     - `<input>`和当前控件的`name`属性相同
            //
            // 根据以下优先级获得`title`属性：
            //
            // 1. 有一个`for`属性等于`<input>`的`id`属性的`<label>`元素，则取其文字
            // 2. 取`<input>`的`title`属性
            // 3. 取`<input>`的`value`
            var boxes = element.children;

            var datasource = [];
            var values = [];
            var boxType = options.boxType;
            for (var i = 0, length = boxes.length; i < length; i++) {
                var box = boxes[i];
                // 提取`value`
                if (getAttr(box, 'box-type') === boxType) {
                    datasource.push(
                        {
                            value: getValue(box),
                            text: box.innerHTML || getAttr(box, 'text')
                        }
                    );
                }

                // firefox下的autocomplete机制在reload页面时,
                // 可能导致box.checked属性不符合预期,
                // 所以这里采用getAttribute
                // 参考：http://t.cn/zRTdrVR
                if (isChecked(box)) {
                    values.push(box.value);
                }
            }

            options.datasource = datasource;
            if (!options.rawValue && !options.value) {
                options.rawValue = values;
            }
        }

        /**
         * 初始化参数
         *
         * @param {Object} [options] 构造函数传入的参数
         * @protected
         * @override
         */
        AbstractBoxGroup.prototype.initOptions = function (options) {
            var properties = {
                datasource: [],
                orientation: 'horizontal',
                boxType: 'radio'
            };
            u.extend(properties, options);

            if (!properties.datasource.length) {
                extractDatasourceFromDOM(this.main, properties);
            }
            if (!properties.rawValue && !properties.value) {
                properties.rawValue = [];
            }

            this.setProperties(properties);
        };

        /**
         * 同步值
         *
         * @param {mini-event.Event} e 事件对象
         * @ignore
         */
        function syncValue(e) {
            if (this.disabled || this.readOnly) {
                return;
            }

            var box = e.target;
            var rawValue = this.boxType === 'radio'
                            ? [] : u.clone(this.rawValue);
            var value = getValue(box);

            if (u.contains(rawValue, value)) {
                rawValue = u.without(rawValue, value);
            }
            else {
                rawValue.push(value);
            }

            this.set('rawValue', rawValue);
        }

        var itemTemplate = [
            '<div class="${wrapperClass}">',
            '    <div id="${id}" class="${className}" ${checked}',
            '       data-ui-value="${value}" data-ui-box-type="${boxType}">',
            '    ${text}</div>',
            '</div>'
        ];
        itemTemplate = itemTemplate.join('');

        /**
         * 渲染控件
         *
         * @param {BoxGroup} group 控件实例
         * @param {Object[]} datasource 数据源对象
         * @param {string} boxType 选择框的类型
         * @ignore
         */
        function render(group, datasource, boxType) {
            // `BoxGroup`只会加`change`事件，所以全清就行
            group.helper.clearDOMEvents();

            var html = '';

            var classes = group.helper.getPartClasses('wrapper');

            var valueIndex = lib.toDictionary(group.rawValue);

            // 分组的选择框必须有相同的`name`属性，所以哪怕没有也给造一个
            for (var i = 0; i < datasource.length; i++) {
                var item = datasource[i];
                var data = {
                    wrapperClass: classes.concat(
                                    group.helper.getPartClasses('wrapper-' + i)).join(' '),
                    id: group.helper.getId('box-' + i),
                    boxType: group.boxType,
                    text: lib.trim(item.text),
                    value: item.value,
                    checked: valueIndex[item.value] ? ' data-ui-checked="checked"' : '',
                    className: group.helper.getPartClasses(boxType).join(' ')
                };

                html += lib.format(itemTemplate, data);
            }

            group.main.innerHTML = html;

            u.each(
                group.getBoxElements(),
                function (box) {
                    this.helper.addDOMEvent(box, 'click', syncValue);
                },
                group
            );
        }

        /**
         * 批量更新属性并重绘
         *
         * @param {Object} properties 需更新的属性
         * @override
         * @fires change
         */
        AbstractBoxGroup.prototype.setProperties = function (properties) {
            // 修改了`datasource`或`boxType`，且没给新的`rawValue`或`value`的时候，
            // 要把`rawValue`清空。由于上层`setProperties`是全等判断，
            // 如果当前`rawValue`正好也是空的，就不要改值了，以免引起`change`事件
            if ((properties.datasource || properties.boxType)
                && (!properties.rawValue && !properties.value)
                && (!this.rawValue || !this.rawValue.length)
            ) {
                properties.rawValue = [];
            }

            var changes =
                InputControl.prototype.setProperties.apply(this, arguments);
            if (changes.hasOwnProperty('rawValue')) {
                /**
                 * @event change
                 *
                 * 值变化时触发
                 */
                this.fire('change');
            }
        };

        /**
         * 重渲染
         *
         * @method
         * @protected
         * @override
         */
        AbstractBoxGroup.prototype.repaint = require('esui/painters').createRepaint(
            InputControl.prototype.repaint,
            {
                /**
                 * @property {meta.BoxGroupItem[]} datasource
                 *
                 * 数据源
                 */

                /**
                 * @property {string} boxType
                 *
                 * 选框类型，可以为`radio`表示单选，或`checkbox`表示复选
                 */
                name: ['datasource', 'boxType'],
                paint: render
            },
            {
                /**
                 * @property {string[]} rawValue
                 *
                 * 原始值，无论是`radio`还是`checkbox`，均返回数组
                 *
                 * 当{@link BoxGroup#boxType}值为`radio`时，数组必然只有一项
                 *
                 * @override
                 */
                name: 'rawValue',
                paint: function (group, rawValue) {
                    rawValue = rawValue || [];
                    // 因为`datasource`更换的时候会把`rawValue`清掉，这里再弄回去
                    group.rawValue = rawValue;
                    var map = {};
                    u.each(
                        rawValue,
                        function(value) {
                            map[value] = true;
                        }
                    );

                    u.each(
                        group.getBoxElements(),
                        function (box) {
                            setAttr(box, 'checked', (map[getValue(box)] ? 'checked' : ''));
                            var wrapperCheckedClass = group.helper.getPartClasses('wrapper-checked')[0];
                            if (isChecked(box)) {
                                lib.addClass(box.parentNode, wrapperCheckedClass);
                            }
                            else {
                                lib.removeClass(box.parentNode, wrapperCheckedClass);
                            }
                        }
                    );
                }
            },
            {
                /**
                 * @property {string} [orientation="horizontal"]
                 *
                 * 选框的放置方向，可以为`vertical`表示纵向，或者`horizontal`表示横向
                 */
                name: 'orientation',
                paint: function (group, orientation) {
                    group.removeState('vertical');
                    group.removeState('horizontal');
                    group.addState(orientation);
                }
            }
        );

        /**
         * 将字符串类型的值转换成原始格式
         *
         * @param {string} value 字符串值
         * @return {string[]}
         * @protected
         * @override
         */
        AbstractBoxGroup.prototype.parseValue = function (value) {
            /**
             * @property {string} [value=""]
             *
             * `BoxGroup`的字符串形式的值为逗号分隔的多个值
             */
            return value.split(',');
        };

        // 保护函数区域

        /**
         * 获取内部的输入元素
         *
         * @return {HTMLElement[]}
         * @protected
         */
        AbstractBoxGroup.prototype.getBoxElements = function () {
            var boxType = this.boxType;
            return u.filter(
                this.main.getElementsByTagName('div'),
                function(item) {
                    return getAttr(item, 'box-type') === boxType;
                }
            );
        };

        lib.inherits(AbstractBoxGroup, InputControl);
        require('esui/main').register(AbstractBoxGroup);
        return AbstractBoxGroup;
    }
);
