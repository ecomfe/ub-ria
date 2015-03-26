ub-ria
======

## UB-RIA是什么？

UB-RIA的全称是RIA base for union business。是一套为联盟产品线提供统一化底层支持的基础框架，包括统一化的页面形式、统一化的样式、统一化的校验规则等。

## UB-RIA在整个ECOMFE框架依赖中的位置是什么？

UB-RIA处在ECOMFE框架依赖的最上层，直接与产品线实现关联。联盟产品线的业务模块直接引用或继承UB-RIA中的基础模块构建系统。


## UB-RIA结构

最新版本UB-RIA按照功能分为四块：extension（扩展）、mvc（模块基类）、ui（控件库 ——之后会被迁移到UB-RIA-UI中）、common（统一样式）

### UB-RIA 之 extension

一些零散的功能补充扩展，每个扩展都是一个对象，且都必须包含一个enable接口。
1. ajax.js    
补充提供JSON格式请求的序列化功能

2. mvc.js    
为container容器增加上有模块标识的class，方便取用

3. ui.js    
   3.1 重写一些校验rule的默认错误信息    
   3.2 添加通用的表格单元格内容输出方法（命令行元素、普通操作列、滑出操作列、状态列）

4. underscore.js    
重写underscore的template配置

### UB-RIA 之 mvc

mvc中包含了一系列根据联盟产品线统一化规范抽象以后的基础模块

#### 整体结构图

![整体结构图](/doc/img/mvc.png)

#### BaseAction，BaseView，BaseModel

是UB-RIA模块的最上层基类。主要包含如下抽象：

1. 实体（Entity）
模块都是基于某种实体的操作 

2. 数据对象（Data）
RequestManager的继承类，负责模块数据请求的处理，一个Model实例允许关联多个数据对象

3. 模块的权限判断

4. 用户确认、抽屉弹层的交互

5. 页面分类

#### ListAction，ListView，ListModel

Base的一种针对列表型页面的实现。主要包含如下抽象：

1. 筛选

2. 新建

3. 批量操作

4. 表格操作

5. 翻页

6. 抽屉弹层

因此，引用UB-RIA的列表mvc有如下要求：

1. id为`"filter"`的`Form`控件  （可选）

    1.1 id为`"filter-switch"`的`Button`控件  （可选）
    1.2 id为`"filter-cancel"`的`Button`控件  （可选）
    1.3 id为`"filter-modify"`的`Button`控件  （可选）

2. id为`"create"`的`Button`控件（可选）

3. id为`"table"`的`Table`控件  （必选）

4. id为`"pager"`的`Pager`控件  （可选）

5. 所有触发查询的条件控件，会触发`filter`的`submit`事件

6. 对于非按钮但要触发表单提交的，可使用{@link ui.extension.AutoSubmit}扩展

7. 所有批量操作按钮的`group`属性值均为`"batch"`

8. 批量操作按钮需使用`CustomData`扩展，并设置`data-ui-data-status`属性，属性值即点击该按钮后实体将更新的目标状态数字，如`data-ui-data-status="0"`

#### FormAction，FormView，FormModel

Base的一种针对表单型页面的实现。主要包含如下抽象：

1. 数据展示

2. 数据收集

3. 数据提交

4. 实体校验

5. 错误展示

> FormModel继承自`ub-ria.mvc.SingleEntityModel`。`ub-ria.mvc.SingleEntityModel`是所有以 **单个实体** 为主数据源的页面的数据模型基类。包含了数据获取、Model填充两大主要逻辑。
