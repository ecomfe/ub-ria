/**
 * @class meta.RequestConfig
 *
 * AJAX请求配置项
 */
function RequestConfig() {
    /**
     * @property {string} name
     *
     * 配置名称
     */
    this.name;

    /**
     * @property {string} scope
     *
     * 请求配置的作用范围，可以为：
     *
     * - `"instance"`：仅在一个{@link RequestManager}实例生命周期内有效
     * - `"global"`：跨多个{@link RequestManager}实例共享，全局生效
     */
    this.scope;

    /**
     * @property {string} policy
     *
     * 当多个同名请求发起时的处理策略，支持：
     *
     * - `"abort"`：第二个请求发起时，会自动中断第一个请求，常用于更新等操作
     * - `"reuse"`：第二个请求发起时，如第一个请求正在进行，
     * 则直接使用第一个请求，常用于读取操作
     * - `"parallel"`：多个请求并行，互不干扰，如同普通的AJAX请求，常用于日志发送
     * - `"auto"`：自动选择，当2个请求的配置和发送数据完全相同时，使用`reuse`策略，
     * 否则当`GET`或`PUT`请求时使用`parallel`，其它情况使用`abort`
     */
    this.policy;

    /**
     * @property {Object} [options]
     *
     * 请求的配置项，发起请求时与实时传入的配置进行合并，具体参考{er.meta.AjaxConfig}类
     */
    this.options;
}
