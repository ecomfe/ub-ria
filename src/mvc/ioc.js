/**
 * UB RIA Base
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file IoC基类
 * @namespace mvc.ioc
 * @author shenbin(bobshenbin@gmail.com)
 */
define(
    function (require) {
        var IoC = require('uioc');
        var ioc = new IoC();

        return ioc;
    }
);
