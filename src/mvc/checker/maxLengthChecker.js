define(
    function (require) {
        var checker = {
            errorMessage: '${title}不能超过${maxLength}个字符',
            priority: 20,
            check: check
        };

        /**
         * 字符串最大长度检验器，value为undefind、null时返回true
         * 
         * @param {string | undefined | null} value 待校验的值
         * @param {string} field 字符串，该属性相对于entity的完整路径
         * @param {array} schema 字段的定义、约束, 长度为3的数组
         * @return {boolean} 检验成功返回true，失败返回false
         */
        function check(value, schema) {
            var maxLength = schema[2].maxLength;

            if (value && value.length > maxLength) {
                return false;
            }

            return true;
        }

        return checker;
    }
);