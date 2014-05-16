define(
    function (require) {
        var u = require('underscore');
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
         * @param {array} schema 字段的定义、约束, 长度为3的数组
         * @return {boolean} 检验成功返回true，失败返回false
         */
        function check(value, schema) {
            return !u.isEmpty(value) || u.isNumber(value) || u.isBoolean(value);
        }
        
        return checker;
    }
);