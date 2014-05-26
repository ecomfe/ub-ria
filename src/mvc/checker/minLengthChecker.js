define(
    function (require) {
        var checker = {
            name: 'minLength',
            errorMessage: {
                array: '${title}不能小于${minLength}个',
                string: '${title}不能小于${minLength}个字符'
            },
            priority: 20,
            check: check
        };

        /**
         * 字符串、数组最小长度检验器，value为undefind、null时返回true
         * 
         * @param {string | object[] | undefined | null} value 待校验的值
         * @param {object[]} schema 字段的定义、约束, 长度为3的数组
         * @return {boolean} 检验成功返回true，失败返回false
         */
        function check(value, schema) {
            var minLength = schema[2].minLength;

            return !(value && value.length != 0 && value.length < minLength);
        }
        
        return checker;
    }
);