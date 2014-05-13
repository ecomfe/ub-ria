define(
    function (require) {
        var u = require('underscore');
        var TEMPLATE_SETTINGS = {
            interpolate: /\$\{(.+?)\}/g
        };

        var checker = {
            name: 'required',
            errorMessage: '${title}不能为空',
            priority: 1,
            check: check
        };

        /**
         * required检验器
         * 检验逻辑：undefined, null, {}, [], ''均无法通过校验
         * 
         * @param {string | boolean | number | object | array | undefined}
         * @param {field} 字符串，该属性相对于entity的完整路径
         * @param {array} 字段的定义, 长度为3或2的数组
         * @return {object} 检验失败时返回field与errorMessage组成的对象
         * @return {boolean} 检验成功时返回true
         */
        function check(value, field, schema) {
            var result = true;
            var type = typeof value;
            if (u.isEmpty(value)
                && type !== 'number'
                && type !== 'boolean'
            ) {
                var data = { title: schema[1] };
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