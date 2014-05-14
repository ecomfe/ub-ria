define(
    function (require) {
        var checker = {
            errorMessage: '${title}的值不合法',
            priority: 20,
            check: check
        };

        /**
         * 枚举类型字段值检验器，如果传入的value是undefined或null，返回true
         * 
         * @param {number | undefined | null} value 要检验的数字
         * @param {array} schema 字段的定义、约束, 长度为3的数组
         * @return {boolean} 检验成功返回true，失败返回false
         */
        function check(value, schema) {
            // 如果value为null、undefined, 不做检查
            if (!value && value !== 0) {
                return true;
            }

            var enumObject = schema[2].datasource;
            var item = enumObject.fromValue(value);
            if (!item) {
                return false;
            }
            return true;
        }

        return checker;
    }
);