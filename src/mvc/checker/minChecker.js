define(
    function (require) {
        var checker = {
            name: 'min',
            errorMessage: '${title}不能小于${min}',
            priority: 20,
            check: check
        };

        /**
         * 数字下界检验器，如果value为undefined、null，返回true
         * 
         * @param {number | undefined | null} value 待检验的数值
         * @param {array} schema 字段的定义、约束, 长度为3的数组
         * @return {boolean} 检验成功返回true，失败返回false
         */
        function check(value, schema) {
            // 如果value为null、undefined, 不做检查
            if (!value && value !== 0) {
                return true;
            }

            var min = schema[2].min;

            return value >= min;
        }
        
        return checker;
    }
);