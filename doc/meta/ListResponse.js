/**
 * @class meta.ListResponse
 *
 * 列表查询返回结构
 */
function ListResponse() {
    /**
     * @property {number} totalCount
     *
     * 总数
     */
    this.totalCount;

    /**
     * @property {Object[]} results
     *
     * 返回的结果集
     */
    this.results;
}
