/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @ignore
 * @file 常用校验规则
 * @author otakustay
 */
define(
    function (require) {
        return {
            maxLength: 100,

            mail: {
                /**
                 * 默认的mail字段最大长度
                 */
                maxLength: 64,

                /**
                 * 电子邮件地址正则
                 */
                pattern: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
            },

            description: {
                /**
                 * 默认的description说明字段最大长度
                 */
                maxLength: 4000
            },

            phone: {
                /**
                 * 电话号码，可为空，区号和分机号可选
                 * 格式{3到4位区号}-{7到8位号码}-{3到5位分机号}
                 */
                pattern: /^((0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$/
            },

            mobile: {
                /**
                 * 手机号码，以13、14、15、18开头的11位数字
                 */
                pattern: /^(1(3|4|5|8)\d{9})?$/
            },

            url: {
                /**
                 * url网址最大长度
                 */
                maxLength: 1000,

                /**
                 * url网址正则
                 */
                /* jshint maxlen: 120 */
                pattern: /^(?:https?|ftp|wap):\/\/.+$|^(?!(?:https?|ftp|wap):\/\/).+$/
            },

            positiveInteger: {
                /**
                 * 正整数正则
                 */
                pattern: /^\d+$/
            },

            money: {
                /**
                 * 价格类数字正则
                 */
                pattern: /^\d+(\.\d{1,2})?$/
            }
        };     
    }
);
