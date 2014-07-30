/**
 * ADM 2.0
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file Uploader控件
 * @author zhanglili(otakustay@gmail.com)
 */
define(
    function (require) {
        var lib = require('esui/lib');
        var helper = require('esui/controlHelper');
        var Validity = require('esui/validator/Validity');
        var ValidityState = require('esui/validator/ValidityState');
        var InputControl = require('esui/InputControl');
        var u = require('underscore');

        /**
         * Uploader控件
         *
         * @param {Object=} options 初始化参数
         * @extends InputControl
         * @constructor
         * @public
         */
        function Uploader(options) {
            InputControl.apply(this, arguments);
        }

        Uploader.prototype.type = 'Uploader';


        var mimeTypes = {
            image: {
                '.jpg': true, '.jpeg': true, '.gif': true,
                '.bmp': true, '.tif': true, '.tiff': true, '.png': true
            },

            flash: {
                '.flv': true, '.swf': true
            }
        };

        /**
         * 默认属性
         *
         * @type {Object}
         * @public
         */
        Uploader.defaultProperties = {
            width: 80,
            height: 25,
            fileType: '*',
            method: 'POST',
            text: '点击上传',
            overrideText: '重新上传',
            busyText: '正在上传...',
            completeText: '上传完成',
            autoUpload: true,
            extraArgs: {},
            action: '',
            mimeTypes: mimeTypes
        };

        /**
         * 初始化参数
         *
         * @param {Object=} options 构造函数传入的参数
         * @override
         * @protected
         */
        Uploader.prototype.initOptions = function (options) {
            var properties = { };
            lib.extend(properties, Uploader.defaultProperties, options);

            if (lib.isInput(this.main)) {
                properties.accept = properties.accept || lib.getAttribute(this.main, 'accept');
                properties.name = properties.name || this.main.name;
            }
            else if (this.main.nodeName === 'FORM') {
                properties.action = properties.action || this.main.action;
                if (!options.method && lib.hasAttribute(this.main, 'method')) {
                    properties.method = this.main.method;
                }
            }

            if (typeof properties.accept === 'string') {
                properties.accept = lib.splitTokenList(properties.accept);
            }

            if (properties.autoUpload === 'false') {
                properties.autoUpload = false;
            }

            if (!properties.hasOwnProperty('title') && this.main.title) {
                properties.title = this.main.title;
            }

            this.setProperties(properties);
        };

        /**
         * 初始化DOM结构
         *
         * @override
         * @protected
         */
        Uploader.prototype.initStructure = function () {
            if (this.main.nodeName !== 'FORM') {
                this.helper.replaceMain();
            }

            // 往全局下加个函数，用于上传成功后回调
            // TODO: 抛弃IE7的话能改成`postMessage`实现
            this.callbackName = lib.getGUID('esuiShowUploadResult');
            window[this.callbackName] = lib.bind(this.showUploadResult, this);

            var indicatorClasses = this.helper.getPartClassName('indicator');
            var buttonClasses = this.helper.getPartClassName('button');
            var iframeId = this.helper.getId('iframe');

            var html = [
                '<div id="' + this.helper.getId('input-container') + '">',
                // 按钮
                '<span id="' + this.helper.getId('button') + '" ',
                'class="' + buttonClasses + '">',
                '</span>',
                // 回调函数名
                '<input type="hidden" name="callback" ',
                'value="' + this.callbackName + '" ',
                '/>',
                // sessionToken
                '<input type="hidden" name="sessionToken" ',
                'value="' + this.getSessionToken() + '" ',
                '/>',
                // 文件上传框
                '<input type="file" ',
                'id="' + this.helper.getId('input') + '" ',
                (this.name ? 'name="' + this.name + '" ' : ' '),
                '/>'
            ];
            //附加参数
            u.each(this.extraArgs, function (value, name) {
                html.push(
                    '<input type="hidden" name="' + name + '" ',
                    'value="' + value + '"/>'
                );
            });
            html.push(
                '</div>',
                // 指示器
                // 虽然`<progress>`更合适，但基本无法写样式，所以改用`<span>`
                '<div id="' + this.helper.getId('indicator-wrapper') + '"',
                'class="' + indicatorClasses + '">',
                '<span id="' + this.helper.getId('indicator') + '"></span>',
                '</div>',
                // 用来偷偷上传的`<iframe>`元素
                '<iframe id="' + iframeId + '" name="' + iframeId + '"',
                ' src="about:blank"></iframe>'
            );

            this.main.innerHTML = html.join('');

            // 放个表单在远放，有用
            var form = this.helper.createPart('form', 'form');
            form.setAttribute('enctype', 'multipart/form-data');
            form.target = iframeId;
            document.body.appendChild(form);

            var input = this.helper.getPart('input');
            this.helper.addDOMEvent(input, 'change', lib.bind(this.receiveFile, this));
        };

        /**
         * 转换为上传完成状态
         *
         * @param {Object} info 成功结果
         */
        function setStateToComplete(info) {
            this.removeState('busy');
            this.addState('complete');

            // 下次再上传的提示文字要变掉
            this.addState('uploaded');
            var button = this.helper.getPart('button');
            button.innerHTML = u.escape(this.overrideText);

            // 清掉可能存在的错误信息
            var validity = new Validity();
            this.showValidity(validity);

            this.fire('change');
        }

        /**
         * 清空上传图像
         * 
         * 清空操作主要做两件事
         * 1. 清空Uploader的fileInfo
         * 2. 清空input的value
         */
        function removeFile() {
            // 由于无法控制外部会在什么时候调用清空接口
            // 因此需要将所有状态移除
            this.removeState('busy');
            this.removeState('complete');
            this.removeState('uploaded');
            // 重置显示文字
            this.helper.getPart('button').innerHTML = u.escape(this.text);

            // 清空上传记录
            this.fileInfo = '';

            // <input type="file"/>的value在IE下无法直接通过操作属性清除，需要替换一个input控件
            // 复制节点属性
            var newInput = document.createElement('input');
            newInput.type = 'file';
            newInput.id = this.helper.getId('input');
            this.name && (newInput.name = this.name);
            // 清理注册事件
            var input = this.helper.getPart('input');
            this.helper.removeDOMEvent(input, 'change');
            // 更新子节点
            this.main.firstChild.replaceChild(newInput, input);
            // 注册事件
            this.helper.addDOMEvent(newInput, 'change', lib.bind(this.receiveFile, this));
        }

        /**
         * 渲染自身
         *
         * @override
         * @protected
         */
        Uploader.prototype.repaint = helper.createRepaint(
            InputControl.prototype.repaint,
            {
                name: ['method', 'action'],
                paint: function (uploader, method, action) {
                    var form = uploader.helper.getPart('form');
                    form.method = method;
                    form.action = action;
                }
            },
            {
                name: ['text', 'overrideText'],
                paint: function (uploader, text, overrideText) {
                    var button = uploader.helper.getPart('button');
                    var html = uploader.hasState('uploaded')
                        ? u.escape(overrideText)
                        : u.escape(text);
                    button.innerHTML = html;
                }
            },
            {
                name: ['busyText', 'completeText'],
                paint: function (uploader, busyText, completeText) {
                    var indicator = uploader.helper.getPart('indicator');
                    var html = uploader.hasState('busy')
                        ? u.escape(busyText)
                        : u.escape(completeText);
                    indicator.innerHTML = html;
                }
            },
            {
                name: 'accept',
                paint: function (uploader, accept) {
                    var input = uploader.helper.getPart('input');
                    if (accept) {
                        lib.setAttribute(input, 'accept', accept.join(','));
                    }
                    else {
                        lib.removeAttribute(input, 'accept');
                    }
                }
            },
            {
                name: ['disabled', 'readOnly'],
                paint: function (uploader, disabled, readOnly) {
                    var input = uploader.helper.getPart('input');
                    input.disabled = disabled;
                    input.readOnly = readOnly;
                }
            },
            {
                name: ['width', 'height'],
                paint: function (uploader, width, height) {
                    var widthWithUnit = width + 'px';
                    var heightWithUnit = height + 'px';

                    uploader.main.style.width = widthWithUnit;
                    uploader.main.style.height = heightWithUnit;

                    var button = uploader.helper.getPart('button');
                    button.style.lineHeight = heightWithUnit;

                    var indicator = uploader.helper.getPart('indicator');
                    indicator.style.lineHeight = heightWithUnit;
                }
            },
            {
                name: 'rawValue',
                paint: function (uploader, rawValue) {
                    if (!rawValue) {
                        return;
                    }
                    else if (u.isEqual(rawValue, {})) {
                        // 允许用户使用 setRawValue({}) 方式清空上传图像
                        removeFile.call(uploader);
                    }
                    else {
                        if (!rawValue.hasOwnProperty('type')) {
                            rawValue.type = uploader.fileType;
                        }

                        uploader.fileInfo = rawValue;

                        setStateToComplete.call(uploader, rawValue);
                        // 不需要停留在完成提示
                        uploader.removeState('complete');
                    }
                }
            }
        );


        /**
         * 检查文件格式是否正确，不正确时直接提示
         *
         * @param {string} filename 上传的文件的文件名
         * @return {boolean}
         * @protected
         */
        Uploader.prototype.checkFileFormat = function (filename) {
            if (this.accept) {
                // 这里就是个内置的`Rule`，走的完全是标准的验证流程，
                // 主要问题是上传控件不能通过`getValue()`获得验证用的内容，
                // 因此把逻辑写在控件内部了
                var extension = filename.split('.');
                extension = '.' + extension[extension.length - 1].toLowerCase();

                var isValid = false;
                for (var i = 0; i < this.accept.length; i++) {
                    var acceptPattern = this.accept[i].toLowerCase();
                    if (acceptPattern === extension) {
                        isValid = true;
                        break;
                    }

                    // image/*之类的，表示一个大类
                    if (acceptPattern.slice(-1)[0] === '*') {
                        var mimeType = acceptPattern.split('/')[0];
                        var targetExtensions = this.mimeTypes[mimeType];
                        if (targetExtensions
                            && targetExtensions.hasOwnProperty(extension)
                        ) {
                            isValid = true;
                            break;
                        }
                    }
                }

                if (!isValid) {
                    var message = this.acceptErrorMessage
                        || '仅接受以下文件格式：' + this.accept.join(',');
                    this.notifyFail(message);
                }

                return isValid;
            }
            else {
                return true;
            }
        };

        /**
         * 提交文件上传
         */
        Uploader.prototype.submit = function () {
            this.showUploading();
            // IE有个BUG，如果在一个`<form>`中有另一个`<form>`，
            // 那么就不能修改内存`<form>`的`innerHTML`值，
            // 因此我们把内层`<form>`单独写在某个地方，
            // 当需要提交时，把所有的`<input>`丢到这个`<form>`下，
            // 提交完毕后再拿回来
            var inputs = this.helper.getPart('input-container');
            var form = this.helper.getPart('form');
            form.appendChild(inputs);
            form.submit();
            this.main.insertBefore(inputs, this.main.firstChild);
        };

        /**
         * 上传文件
         *
         * @protected
         */
        Uploader.prototype.receiveFile = function () {
            var input = this.helper.getPart('input');
            var filename = input.value;
            // 文件已经上传后，value不为空
            // 再次选择文件上传时点击取消按钮，会将value置空，从而再次触发'change'事件
            // 因此需要对传入的filename进行非空判断
            if (filename && this.checkFileFormat(filename)) {
                this.fire('receive');
                if (this.autoUpload) {
                    this.submit();
                }
            }
        };

        /**
         * 提示用户正在上传
         *
         * @protected
         */
        Uploader.prototype.showUploading = function () {
            this.removeState('complete');
            this.addState('busy');

            var indicator = this.helper.getPart('indicator');
            indicator.innerHTML = u.escape(this.busyText);
        };

        /**
         * 显示上传结果
         *
         * @param {Object} options 上传结果
         * @protected
         */
        Uploader.prototype.showUploadResult = function (options) {
            // 如果成功，`options`格式为：
            // {
            //     info: {
            //         value: {string}
            //     }
            // }
            //
            // 如果上传失败，`options`必须是以下格式
            // {
            //     fields:
            //         [
            //             {
            //                 field: "file",
            //                 message: "文件太大"
            //             }
            //         ]
            // }

            if (options.fields) {
                this.fire('fail', { fields: options.fields });
                this.notifyFail(options.fields[0].message);
            }
            else if (options.info) {
                if (!options.info.hasOwnProperty('type')) {
                    options.info.type = this.fileType;
                }

                this.fileInfo = options.info;
                this.fire('complete');
                this.notifyComplete(options.info);
            }
        };

        /**
         * 通知上传失败
         *
         * @param {string} message 失败消息
         * @protected
         */
        Uploader.prototype.notifyFail = function (message) {
            message = message || '上传失败';
            var validity = new Validity();
            var state = new ValidityState(false, message);
            validity.addState('upload', state);
            this.showValidity(validity);
            this.removeState('busy');
        };

        /**
         * 通知上传完成
         *
         * @param {Object} info 成功结果
         * @protected
         */
        Uploader.prototype.notifyComplete = function (info) {
            setStateToComplete.call(this, info);

            // 提示已经完成
            var indicator = this.helper.getPart('indicator');
            indicator.innerHTML = u.escape(this.completeText);
            // 一定时间后回到可上传状态
            this.timer = setTimeout(
                lib.bind(this.removeState, this, 'complete'),
                1000
            );
        };

        Uploader.prototype.getRawValue = function () {
            return this.fileInfo || null;
        };

        Uploader.prototype.getRawValueProperty = Uploader.prototype.getRawValue;

        /**
         * 获取用户选择的文件名
         *
         * @return {string}
         */
        Uploader.prototype.getFileName = function () {
            return this.helper.getPart('input').value || '';
        };

        /**
         * 获取反SCRF的Token
         *
         * @return {string}
         * @protected
         */
        Uploader.prototype.getSessionToken = function () {
            return '';
        };

        /**
         * 销毁控件
         *
         * @override
         */
        Uploader.prototype.dispose = function () {
            try {
                delete window[this.callbackName];
            }
            catch (ex) {
                window[this.callbackName] = undefined;
            }
            var form = this.helper.getPart('form');
            lib.removeNode(form);

            InputControl.prototype.dispose.apply(this, arguments);
        };

        lib.inherits(Uploader, InputControl);
        require('esui').register(Uploader);
        return Uploader;
    }
);
