/**
 * @class meta.RequestError
 *
 * 请求失败时的错误信息
 */
function RequestConfig() {
    /**
     * @property {string} name
     *
     * 错误类型，当后端检验错误时值为`"validationConflict"`
     */
    this.type;

    /**
     * @property {FieldError[]} fields
     *
     * 检验错误字段
     */
    this.fields;

    /**
     * @property {string} message
     *
     * 全局错误信息
     */
    this.message;

    /**
     * @property {number} errorId
     *
     * 可以与后端匹配的错误ID
     */
    this.errorId;
}
