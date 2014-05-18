define(
    function (require) {
        var checker = {
            name: 'range',
            errorMessage: '${title}必须是≥${min}且≤${max}的数字',
            priority: 20,
            check: check
        };

        /**
         * 数字上下界检验器，如果value为undefined、null，返回true
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
            var max = schema[2].max;

            if (max < min) {
                var temp = max;
                max = min;
                min = temp;
            }
            
            return value >= min && value <= max;
        }
        
        return checker;
    }
);