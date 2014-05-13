define(
    function (require) {
        var u = require('underscore');
        var TEMPLATE_SETTINGS = {
            interpolate: /\$\{(.+?)\}/g
        };

        var checker = {
            errorMessage: '${title}格式不符合要求',
            priority: 30,
            check: check
        };

        /**
         * 正则检验器
         * 
         * @param {string | number}
         * @param {field} 字符串，该属性相对于entity的完整路径
         * @param {array} 字段的定义, 长度为3或2的数组
         * @return {object} 检验失败时返回field与errorMessage组成的对象
         * @return {boolean} 检验成功时返回true
         */
        function check(value, field, schema) {
            // 如果value为null, undefined, '', 不做检查
            if (!value && value !== 0) {
                return true;
            }

            var result = true;
            var regex = new RegExp(schema[2].pattern);
            if (!regex.test(value)) {
                var data = {
                    title: schema[1]
                };
                var errorMessage = u.template(this.errorMessage, data, TEMPLATE_SETTINGS);
                result = {
                    field: field,
                    message: errorMessage
                };
            }
            return result;
        }
        
        return checker;
    }
);