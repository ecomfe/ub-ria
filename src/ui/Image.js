/**
 * ADM 2.0
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 图片类内容查看面板
 * @author zhanglili(otakustay@gmail.com)
 */
define(
    function (require) {
        var lib = require('esui/lib');
        var Control = require('esui/Control');

        /**
         * 图片类内容查看面板
         *
         * @param {Object=} options 初始化参数
         * @extends esui/Control
         * @constructor
         */
        function Image(options) {
            Control.apply(this, arguments);
        }

        Image.prototype.type = 'Image';

        /**
         * 默认属性
         *
         * @type {Object}
         * @public
         */
        Image.defaultProperties = {
            imageType: 'auto'
        };

        /**
         * 创建主元素
         *
         * @return {HTMLElement}
         * @override
         * @protected
         */
        Image.prototype.createMain = function () {
            return document.createElement('figure');
        };

        /**
         * 初始化参数
         *
         * @param {Object=} options 构造函数传入的参数
         * @override
         * @protected
         */
        Image.prototype.initOptions = function (options) {
            var properties = {};
            lib.extend(properties, Image.defaultProperties, options);
            this.setProperties(properties);
        };

        /**
         * 初始化DOM结构
         *
         * @override
         * @protected
         */
        Image.prototype.initStructure = function () {
            var html = [
                this.helper.getPartHTML('content', 'div'),
                this.helper.getPartBeginTag('footer', 'footer'),
                    this.helper.getPartBeginTag('magnifier', 'span'),
                        '放大显示',
                    this.helper.getPartEndTag('magnifier', 'span'),
                this.helper.getPartEndTag('footer', 'footer')
            ];

            this.main.innerHTML = html.join('');

            this.helper.addDOMEvent('magnifier', 'click', this.displayFullSize);
        };

        /**
         * 渲染自身
         *
         * @override
         * @protected
         */
        Image.prototype.repaint = require('esui/painters').createRepaint(
            Control.prototype.repaint,
            {
                name: ['url', 'width', 'height'],
                paint: function (image, url) {
                    if (!url) {
                        image.restoreInitialState();
                        return;
                    }

                    var html = image.getPreviewHTML();
                    image.helper.getPart('content').innerHTML = html;
                    image.removeState('empty');
                }
            }
        );

        /**
         * 恢复最初状态，即不显示任何内容
         */
        Image.prototype.restoreInitialState = function () {
            // 如果外部调用`restoreInitialState`，则要清掉这3个，
            // 如果是`painter`触发的，则这3个至少`url`已经是清掉了，再清一下不会太浪费
            this.url = null;
            this.width = null;
            this.height = null;

            var content = this.helper.getPart('content');
            content.innerHTML = '';
            this.addState('empty');
        };

        /**
         * 获取正确的媒体类型
         *
         * @return {string|null} 返回`flash`或`image`，返回空表示无法猜测类型
         */
        Image.prototype.getActualImageType = function () {
            if (this.imageType !== 'auto') {
                return this.imageType;
            }

            var match = /\.\w+$/.exec(this.url);
            if (!match) {
                return null;
            }

            var extension = [0];
            if (extension === '.swf' && extension === '.flv') {
                return 'flash';
            }
            else {
                return 'image';
            }
        };

        var imageTemplate = '<img src="${url}" ${widthAttribute} ${heightAttribute} />';

        var flashTemplate = [
            '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" ',
                'align="middle" ',
                '${widthAttribute} ${heightAttribute}>',
                '<param name="allowScriptAccess" value="never">',
                '<param name="quality" value="high">',
                '<param name="wmode" value="transparent">',
                '<param name="movie" value="${url}">',
                '<embed wmode="transparent" src="${url}" ',
                    'quality="high" align="middle" allowScriptAccess="always" ',
                    '${widthAttribute} ${heightAttribute} ',
                    'type="application/x-shockwave-flash" />',
            '</object>'
        ];
        flashTemplate = flashTemplate.join('');

        /**
         * 获取预览的HTML
         *
         * @ignore
         */
        Image.prototype.getPreviewHTML = function () {
            var type = this.getActualImageType();

            if (!type) {
                return '<strong>无法预览该格式</strong>';
            }

            var data = {
                url: this.url,
                widthAttribute: this.width
                    ? 'width="' + this.width + '"'
                    : '',
                heightAttribute: this.height
                    ? 'height="' + this.height + '"'
                    : ''
            };

            if (type === 'image') {
                return lib.format(imageTemplate, data);
            }
            else if (type === 'flash') {
                return lib.format(flashTemplate, data);
            }
            else {
                return '<strong>无法预览该格式</strong>';
            }
        };

        /**
         * 显示全尺寸图片
         */
        Image.prototype.displayFullSize = function () {
            if (!this.url) {
                return;
            }

            var mask = this.helper.createPart('full-size-mask');
            document.body.appendChild(mask);

            var content = this.helper.createPart('full-size-content');
            content.innerHTML = this.getPreviewHTML();

            // 有宽高的情况下居中显示，否则靠边
            if (this.width && this.height) {
                content.style.top = '50%';
                content.style.left = '50%';
                content.style.marginLeft = -Math.round(this.width / 2) + 'px';
                content.style.marginTop = -Math.round(this.height / 2) + 'px';
            }
            document.body.appendChild(content);

            var close = this.helper.createPart('full-size-close');
            close.innerHTML = 'X';
            document.body.appendChild(close);

            this.helper.addDOMEvent(close, 'click', this.cancelFullSize);
        };

        /**
         * 取消全尺寸显示
         */
        Image.prototype.cancelFullSize = function () {
            var mask = this.helper.getPart('full-size-mask');
            lib.removeNode(mask);

            var content = this.helper.getPart('full-size-content');
            lib.removeNode(content);

            var close = this.helper.getPart('full-size-close');
            this.helper.clearDOMEvents(close);
            lib.removeNode(close);
        };

        lib.inherits(Image, Control);
        require('esui').register(Image);
        return Image;
    }
);
