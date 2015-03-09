/**
 * @class meta.FieldError
 *
 * 表示一个字段的验证错误信息
 */
function FieldError() {
    /**
     * @property {string} field
     *
     * 字段名，通常对应输入控件的`name`属性
     */
    this.field;

    /**
     * @property {string} message
     *
     * 错误信息
     */
    this.message;
}
