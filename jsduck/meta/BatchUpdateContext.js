/**
 * @class meta.BatchUpdateContext
 *
 * 列表批量更新上下文对象
 */
function BatchUpdateContext() {
    /**
     * @property {Object[]} items
     *
     * 待更新的实体对象列表
     */
    this.items;

    /**
     * @property {string[] | number[]} ids
     *
     * 待更新的实体的id列表
     */
    this.ids;

    /**
     * @property {number} status
     *
     * 更新的目标状态数字量，如“删除”操作是将实体标为“已删除”状态，对应值为`0`
     */
    this.status;

    /**
     * @property {string} statusName
     *
     * 更新的目标状态的英文表示，如“删除”操作表示为`"remove"`
     */
    this.statusName;

    /**
     * @property {string} command
     *
     * 更新操作的操作名称，如“删除”操作即为字符串`"删除"`
     */
    this.command;
}
