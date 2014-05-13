define(
    function (require) {
        var u = require('underscore');
        var TEMPLATE_SETTINGS = {
            interpolate: /\$\{(.+?)\}/g
        };

        var checker = {
            name: 'minLength',
            errorMessage: '${title}不能小于${minLength}个字符',
            priority: 20,
            check: check
        };

        /**
         * 字符串最小长度检验器
         * 
         * @param {string}
         * @param {field} 字符串，该属性相对于entity的完整路径
         * @param {array} 字段的定义, 长度为3或2的数组
         * @return {object} 检验失败时返回field与errorMessage组成的对象
         * @return {boolean} 检验成功时返回true
         */
        function check(value, field, schema) {
            var result = true;
            var typeOption = schema[2];
            var minLength = typeOption.minLength;

            if (value && value.length < minLength) {
                var data = {
                    title: schema[1],
                    minLength: minLength
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