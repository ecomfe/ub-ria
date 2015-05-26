Title: 框架解读
Author: dddbear(dddbear@aliyun.com)
Date: $DATE$
Tag: 架构

最新版本UB-RIA按照功能分为四块：extension（扩展）、mvc（模块基类）、ui（控件库 ——只跟MVC相关的控件）、common（统一样式）

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

Base的一种针对列表型页面的实现。列表页是每个模块中呈现模块实体数据概要信息、管理实体数据的重要页面，主要包含如下抽象：

1. 列表数据加载

2. 列表展示

3. 列表筛选

4. 实体新建

5. 批量操作

6. 表格操作

7. 翻页

8. 抽屉弹层

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

![列表页示例图](/doc/img/list.png)

#### DetailAction，DetailView，DetailModel  `deprecated`

Base的一种针对详情页面的实现

#### FormAction，FormView，FormModel

Base的一种针对表单型页面的实现。主要包含如下抽象：

1. 数据展示

2. 数据收集

3. 数据提交

4. 实体校验

5. 错误展示

> FormModel继承自`ub-ria.mvc.SingleEntityModel`。`ub-ria.mvc.SingleEntityModel`是所有以 **单个实体** 为主数据源的页面的数据模型基类。包含了数据获取、Model填充两大主要逻辑。

![表单页示例图](/doc/img/form.png)

#### ReadAction，ReadView，ReadModel

Base的一种针对只读页面的实现。这组mvc的实现很简单，目前抽象的内容包括：

1. 返回交互

2. 数据展示

3. 空值的默认值显示

> ReadModel也继承自`ub-ria.mvc.SingleEntityModel`。

![只读页示例图](/doc/img/form.png)

#### RequestManager

ajax请求的管理模块，包括请求的并行处理、冲突处理等。模块可以做实例使用，此时它是Data模块的基类；可以做静态类，调用静态方法```register```完成请求的注册。

> **Data** 是后期从Model中分离出来的专门负责处理数据请求的模块。开发者在这个模块中定义请求、注册请求。查看详细。

#### RequestStrategy

里面包含很多format方法，用于按一定规则处理请求的URL、请求名称、请求参数等。通常每个项目会根据自身的前后端接口约定有一个通用的实现。每个Data实例都要配置一个RequestStrategy实例。

#### IoCActionFactory

IoC的原理这里不详细描述，点这里了解详情。IoCActionFactory是一个创建Action的工厂类，它是对老版Action创建方式的IoC化升级。    

ER在Action的创建方法上原生支持“工厂”，只要```Action```的```type```是一个有`createRuntimeAction`方法的对象。因此IoCActionFactory的核心就是它的createRuntimeAction方法，把Action通过依赖配置处理后，返回一个Promise对象。

Action的依赖配置实现在业务端。实现这个配置的组件叫做```iocContainer```，业务端实现一个```IoCActionFactory```的继承类，使用```setIocContainer```配置上自己的组件。


#### EntityValidator

表单实体验证基类，对表单提交的数据在发送至后端前进行校验
独立于View，专属于Model层的校验

关键属性
1. checkers：校验器集合，可添加、删除、覆盖    
2. schema：提供检验规则，由系统在指定模块下通过schema.js实现    
3. rule：并在工厂实现类通过setter植入    


### UB-RIA 之 其他

#### tpl

模板相关处理的插件。目前包括：

1. 通用的模板“filter”

2. “自定义标签” shim

3. 模板控件及扩展的解析和加载


#### util

就是一个工具类