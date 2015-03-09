/**
 * 实体状态转换对象，用于表达实体在一定状态下可以或不可以进行的状态迁移，以及该状态的相关信息
 *
 * @class meta.StatusTransition
 */
function StatusTransition() {
    /**
     * 目标当前状态
     *
     * @member meta.StatusTransition#status
     * @type {numer}
     */
    this.status;

    /**
     * 不能从{@link meta.StatusTransition#status}迁移的对应状态
     *
     * @member meta.StatusTransition#deny
     * @type {number[]}
     */
    this.deny;

    /**
     * 可以从{@link meta.StatusTransition#status}迁移的对应状态
     *
     * @member meta.StatusTransition#accept
     * @type {number[]}
     */
    this.accept;

    /**
     * 当前状态对应的操作名，是一个`camelCase`的格式
     *
     * @member meta.StatusTransition#statusName
     * @type {string}
     */
    this.statusName;

    /**
     * 当前对应的中文描述
     *
     * @member meta.StatusTransition#command
     * @type {string}
     */
    this.command;
}
