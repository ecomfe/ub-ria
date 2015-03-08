/**
 * @class meta.Request
 *
 * AJAX请求对象
 */
function Request() {
    /**
     * @property {string} name
     *
     * 请求的名称
     */
    this.name;

    /**
     * @property {er.meta.AjaxConfig} options
     *
     * 请求相关的配置
     */
    this.options;

    /**
     * @property {meta.RequestConfig} config
     *
     * 预先配置的请求冲突策略等内容
     */
    this.config;
}
