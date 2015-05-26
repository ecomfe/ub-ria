ub-ria
======

## UB-RIA是什么？

UB-RIA的全称是RIA base for union business。是一套为联盟产品线提供统一化底层支持的基础框架，包括统一化的页面形式、统一化的样式、统一化的校验规则等。

## UB-RIA在整个ECOMFE框架依赖中的位置是什么？

UB-RIA处在ECOMFE框架依赖的最上层，直接与产品线实现关联。联盟产品线的业务模块直接引用或继承UB-RIA中的基础模块构建系统。

## 文档索引

- [框架解读](doc/structure.md)

- [实例演示](doc/demo.md)

   - [列表页](doc/list.md)

   - [表单页](doc/form.md)

- [开发规范](doc/rule.md)

- Q&A

  - 列表

    - [如何在没有任何操作项时取消操作列](doc/cancelOperationColumn.md)

    - [如何取消列表的批量操作勾选列](doc/cancelBatch.md)

    - [前端静态数据筛选、排序](doc/staticFilterList.md)

  - 表单

    - [如何自定义表单提交前行为](doc/beforeSubmitHandle.md)

    - [如何自定义表单提交后行为](doc/afterSubmitHandle.md)

    - [复制操作如何实现](doc/copyForm.md)

    - [如何增加自定义校验](doc/customValidate.md)

    - [多表单通过Tab组合成大表单](doc/bigForm.md)

  - 子Action

    - [主Action如何向子Action传递数据和方法](doc/childAction.md)

    - [行内新建实体的常用方案](doc/newEntity.md)
  
    - [子Action与控件的选择](doc/actionOrControl.md)
  
  - 全局

    - [如何在页面跳转时传递数据](doc/transferDataWhenRedirect.md)

    - [定制Ajax满足前后端接口规范](doc/customAjax.md)

    - [全局错误处理](doc/globalError.md)

    - [启用/取消CSRF Token](doc/csrfToken.md)

    - [如何自定义模块的ioc组件配置](doc/customIoc.md)
