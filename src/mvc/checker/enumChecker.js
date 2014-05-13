define(
    function (require) {
        var u = require('underscore');
        var TEMPLATE_SETTINGS = {
            interpolate: /\$\{(.+?)\}/g
        };

        var checker = {
            errorMessage: '${title}的值不合法',
            priority: 20,
            check: check
        };

        /**
         * 枚举类型字段值检验器
         * 
         * @param {number}
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
            var enumObject = schema[2].datasource;
            var item = enumObject.fromValue(value);
            if (!item) {
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