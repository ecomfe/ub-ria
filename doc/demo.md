Title: 实例展示
Author: dddbear(dddbear@aliyun.com)
Date: $DATE$
Tag: 实例

现在从零开始展示使用ub-ria框架创建一个SPA项目的过程。

预设一个需求场景：

开发一个通讯录管理系统，具备如下功能：

1. 用户登录
2. 查看登录用户下的通讯录列表
3. 批量删除多个通讯信息
4. 批量修改多个通讯信息的权限状态
5. 根据指定条件搜索通讯信息
6. 单个通讯信息的增、删、改

OK！开始！

在这之前，最好先搞清楚几种基础库的使用：[eoo](), [uioc](), [promise](), [eicons](), [etpl]()

# step1：edp初始化项目

1. [安装edp](www.github.com/ecomfe/edp)

2. 创建项目文件夹`Memo`

3. `Memo`文件夹下开始项目初始化

```
edp project init
```

此步完成后，将自动生成基本的目录结构如下：

```
/src   代码主目录
/dep   外部模块依赖包
/tool  辅助工具，build相关等
/test  单元测试脚本
module.conf  项目的AMD模块配置
edp-build-config.js 项目的构建配置

```

# step2: 依赖包引入

项目是基于ub-ria框架的，因此，首先引入ub-ria。

```
edp import ub-ria
```

此步完成，`dep`文件夹中除新增了ub-ria依赖以外，还包含了其他ub-ria框架所依赖的模块资源。在没有特殊需求的情况下，这些依赖就够用了。

默认引入依赖时，模块的源文件是带版本号的，有时为了在升级依赖库时能够有清晰的diff，可以去掉版本号。执行如下命令：

```
edp migrate v2
```

注：执行这个命令时如果出现错误，请检查edp相关包的版本，比如，edp project需要版本达到`0.7.0-beta.1`

除了edp自动初始化的文件夹，项目可以根据自己的需求增加其它文件夹，比如`doc`, `demo`等。


# step3: 项目源码通用结构搭建

项目的核心源码在`src`下，根据ub-ria项目开发的规范，一个标准的ub-ria项目的通用目录结果是这样的

/src
--- /common    项目通用配置
------- /css   通用less文件
------- /img   通用图片、Flash等资源文件
------- /tpl   通用模板
------- *.js   其他通用脚本
--- /ui        项目自定义控件
------- /css   控件less文件，包括复写的esui控件样式
------- /img   控件图片
------- *.js   自定义控件
--- /external  外部脚本
------- esl.js esl脚本
------- *.js   其他脚本

之后我们按照正常前端的开发流程填充这些目录。

## 创建通用样式

### 增加外部css引入

一般一个基本功能的项目的样式会依赖如下几个外部样式库：

`est` —— 高大全的样式mixin

`eicons` —— 高大全字体图标库

`esf` —— 一堆扁平化主题样式库

`esui` ——  高大全的控件库的样式，依赖于`esf`实现了基础控件的样式

`ub-ria` —— 一些ub-ria项目通用的布局样式

`ub-ria-ui` —— ub-ria项目通用的控件样式

因此在common/css下创建一个extern.less文件，内容大体如下：

```
// est
@import "./../../../dep/est/src/all.less";

// eicons
@import "./../../../dep/eicons/src/main.less";

// esui
@import "./../../../dep/esui/src/main.less";

// esf  esui中引用esf的基础控件样式，项目里按照自己的需求选择性引用下面的其他可选样式
@import "./../../../dep/esf/src/base.less";
@import "./../../../dep/esf/src/variable.less";
@import "./../../../dep/esf/src/palette.less";
@import "./../../../dep/esf/src/mixins.less";
@import "./../../../dep/esf/src/loader.less";
@import "./../../../dep/esf/src/progress.less";
@import "./../../../dep/esf/src/mask.less";

// ub-ria
@import "./../../../dep/ub-ria/src/ui/css/main.less";
@import "./../../../dep/ub-ria/src/common/css/common.less";
@import "./../../../dep/ub-ria/src/common/css/layout.less";
@import "./../../../dep/ub-ria/src/common/css/form.less";
@import "./../../../dep/ub-ria/src/common/css/list.less";


// ub-ria-ui
@import "./../../../dep/ub-ria-ui/src/css/main.less";

```

上面的样式库一般都有一些全局变量，这些变量也需要设置在extern.less中，如：

```
// eicons
@fa-font-path: "../../../dep/eicons/fonts/font-awesome";

// est
@support-old-ie: false;
```

### 配置项目主题变量

设计的规范一些的企业级项目页面色彩大多不会是杂乱无章，基本就维持在一个色系的集中颜色之间。我们一般提倡使用一个专门的less文件来定义这些主题色，来提高样式在主题方面的重用性和维护性。当然，这里也包含一些对于ub-ria中提供的一些样式变量的重写。

这个实例中，我们定义这样的文件为`variable.less`，里面的内容形如：

```
// 通用样式的变量

@body-bg:               #fff;

@memo-main-theme-color: #12bdce;
@memo-main-theme-color-hover: #21cada;
@memo-main-theme-color-active: #12bfcd;
@memo-main-theme-color-disabled: #eaeaea;

@gray-bg-color: #ebebeb;

// 顶栏背景色
@header-bg:                    #0ea6b2;
@header-color:                 #cffbff;
@header-link-color:            #cffbff;
@header-link-color-active:     #7cdfe8;

// 列表相关
@addition-content-color: #999;
@separator-color: @gray-bg-color;


// 布局相关尺寸
@header-height: 60px;
@accounts-width: 160px;
```

### 增加其他通用css

完成了外部css的引用，接下来就是正常流程的基础样式搭建，包括重置样式，全局通用样式，项目个性化布局样式以及项目主题变量定义。全部完成后，基本的样式结构如下：

/common
------- /css
----------- reset.less
----------- commone.less
----------- layout.less
----------- list.less
----------- form.less
----------- extern.less
----------- variable.less


### 增加项目样式总入口

所有上面的样式最后都通过一个入口less暴露给外部，我们在这里定义这个文件为`main.less`，内容很简单，就是一堆堆的@import

```
// 外部资源
@import "./extern.less";

// 通用
@import "./reset.less";
@import "./variable.less";
@import "./layout.less";
@import "./common.less";
@import "./form.less";
@import "./list.less";

```

但是这里涉及一个优化策略，`extern.less`里的esui的main.less体积比较大，为了提高加载性能，可以把esui.less单独剥离出来，与main.less平级引用。


## 增加通用模板

如果项目中多个模块的样式结构都基本一致，那么开发一套可复用的模板是很重要的。这里列举一个大粒度的”框架模板“和一个小粒度的”组件模板“。

ub-ria的模板引擎是etpl，建议看这里之前，先去详细了解etpl的使用文档，可以[看这里](http://github.com/ecomfe/etpl)

### 片段模板

下面这个模板实现了表单中最常用的输入框，模板中将表单中常用的配置以变量的形式进行了预设。这里应用了etpl提供的`use`功能。

```
<!-- target: textbox -->
<!-- var: name = ${name} || ${field} -->
<!-- var: id = ${id} || ${name} -->
<!-- var: width = ${width} || 230 -->
<!-- var: length = ${length} || 100 -->
<!-- var: trim = !${notTrim} -->
<esui-text-box data-ui-id="${id | dasherize}" data-ui-value="@${field}"
    name="${name}" title="${title}" data-ui-max-length="-1"
    data-ui-validity-label="${id | dasherize}-validity-label"
    <!-- if: ${mode} -->data-ui-mode="${mode}"<!-- /if -->
    <!-- if: ${required} -->data-ui-required="required"<!-- /if -->
    <!-- if: ${width} -->data-ui-width="${width}"<!-- /if -->
    <!-- if: ${height} -->data-ui-height="${height}"<!-- /if -->
    <!-- if: ${length} -->data-ui-length="${length}"<!-- /if -->
    <!-- if: ${minLength} --> data-ui-min-length="${minLength}"<!-- /if -->
    <!-- if: ${min} || ${min} === 0 -->data-ui-min="${min}"<!-- /if -->
    <!-- if: ${minErrorMessage} -->data-ui-min-error-message="${minErrorMessage}"<!-- /if -->
    <!-- if: ${max} || ${max} === 0 -->data-ui-max="${max}"<!-- /if -->
    <!-- if: ${maxErrorMessage} -->data-ui-max-error-message="${maxErrorMessage}"<!-- /if -->
    <!-- if: ${pattern} -->data-ui-pattern="${pattern}"<!-- /if -->
    <!-- if: ${patternErrorMessage} -->data-ui-pattern-error-message="${patternErrorMessage}"<!-- /if -->
    <!-- if: ${countWord} -->data-ui-extension-count-type="WordCount"<!-- /if -->
    <!-- if: ${prefixHint} -->data-ui-hint="${prefixHint}" data-ui-hint-type="prefix" <!-- /if -->
    <!-- if: ${group} -->data-ui-group="${group}"<!-- /if -->
    <!-- if: ${description} -->data-ui-extension-validation-type="ValidationCleaner"<!-- /if -->
    <!-- if: ${compare} -->data-ui-compare="${compare | dasherize}"<!-- /if -->
    <!-- if: ${passwordRule} -->data-ui-password-rule="${passwordRule}"<!-- /if -->
    <!-- if: ${placeholder} -->data-ui-placeholder="${placeholder}"<!-- /if -->
    <!-- if: ${disabled} -->data-ui-disabled="true"<!-- /if -->
    <!-- if: ${trim} -->data-ui-extension-trim-type="TrimInput"<!-- /if --> >
</esui-text-box>
```
上面那个模板比较难理解的是 `data-ui-value="@${field}"` 这句，可以分理解开解，先解析 `${field}` 获得一个值，然后这个值就是Model中的字段名。然后`@${field}`自然就是取Model中的一个字段了。


### 框架模板

所谓框架模板，也就是你可以根据需求定义一个外框结构，然后根据实际场景填充内容。比如一个表单最常用的就是一个输入字段区。一般有一个字段名 + 一个输入框组成。这个就可以写成一个框架。

```
<!-- 由label + value + tip组成的表单field模板，content可以是任意内容 -->
<!-- master: formLabelValueField -->
<!-- var: label = ${label} || ${title} -->
<!-- var: id = ${id} || ${name} || ${field} -->
<!-- var: commonFieldClass = ${required} ? 'form-field-required' : 'form-field' -->
<!-- if: ${fieldClasses} -->
<div class="${commonFieldClass} ${fieldClasses}">
<!-- else -->
<div class="${commonFieldClass}">
<!-- /if -->
    <esui-label class="form-field-label" data-ui-for-target="${id | dasherize}">${label}：</esui-label>
    <div class="form-field-value">
        <!-- if: ${required} -->
        <span class="form-field-value-required-star">*</span>
        <!-- /if -->
        <!-- contentplaceholder: value --><!-- /contentplaceholder-->
        <!-- if: ${tipTitle} || ${tip} -->
        <esui-tip class="form-field-tip" title="${tipTitle}">${tip}</esui-tip>
        <!-- /if -->
    </div>
</div>
```

上面这个的写法是eptl2支持的，eptl3中是另外一种不同的写法。

```

```

模板框架只能用来直接创建模板片段，不能直接被`import`，所以我们要利用它生成内敛输入框片段。

```
<!-- target: textboxField(master = formLabelValueField) -->
<!-- content: value -->
    <!-- import: textbox -->
<!-- /content -->
```

这样定义以后，表单模板里就可以通过下面的方式调用，简化代码。

```
<section class="form-section">
    <!-- use:
        textboxField(
            title = '名称', field = 'name',
            required = true, countWord = true
        )
    -->
    <!-- use:
        textboxField(
            title = '电话', field = 'telephone',
            required = true, pattern = '/^((0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$/'
        )
    -->
</section>
```

这些通用模板最后都被放在`common/tpl`下，根据实例项目的需求，我们最后创建出的模板有下面这些：

/common
------- /tpl
----------- common.tpl
----------- form.tpl
----------- list.tpl

## 资源配置 config.js

通用模板以及之后会提及的模块的配置文件都会被配置在这个文件中，系统会先执行这个文件来加载资源，资源加载完成后，才开始ub-ria的启动。

```

define(
    function (require) {
        // 通用模板
        require('tpl!common/tpl/common.tpl.html');
        require('tpl!common/tpl/list.tpl.html');
        require('tpl!common/tpl/form.tpl.html');
    }
);

```

## 实现ub-ria基类里的各种setter。

ub-ria的mvc基类中一些setter方法（包括使用eoo.defineAccessor隐性定义的setter)是需要在项目代码中自行实现的，可以jsdoc生成文档查看这些setter的说明。

setter的调用方式，可以使用传统的方式（继承、构造函数调用），但这里，我们引入ioc的概念，使用依赖注入的方式调用。依赖注入的实现拢共分两步：

1. 创建一个ioc容器
2. 实现ub-ria中提供的ioc组装工厂的抽象类

### 创建ioc容器

ioc容器的概念这里不具体讲述，可以暂时简单理解成就是一个配置**setter所需要的所有组件**的容器。它的基本结构可以是这样：

```
define(
    function (require) {
        var IoC = require('uioc');
        var ioc = new IoC();
        /** 这里要加具体实现的代码 */
        return ioc;
    }
);

```
上面的代码没什么东西，就是创建了一个ioc实例。

然后我们开始添加组件。首先我们要对众多需要调用setter传入的组件进行分类，这些组件按照作用范围分为`通用组件`和`模块组件`两种。我们这里就这两种分别抽取一个来做演示。

#### 添加通用组件

启动系统所需要的模块，全部在`common/ioc`中配置。

`通用组件`就是指没有模块化的指定，可以全系统使用一个的组件，通常是单例模式，比如，`GlobalData`。我们假设项目端已经实现了这个组件 —— `common/GlobalData.js`，下面的代码展示将这个组件加入ioc容器的方法：

```

    var globalComponents = {
        globalData: {
            module: 'common/GlobalData',
            scope: 'singleton',
            properties: {
                requestStrategy: {$ref: 'commonRequestStrategy'},
                ajax: {$ref: 'ajax'}
            }
        }
    };

    ioc.addComponent(globalComponents);

```
通常，我们在定义一个ioc组件的时候，这个组件会依赖其他的组件，比如上面`properties`参数里指定的。此时，我们需要把这些依赖组件也定义出来。因此，最后生成的完整代码是：

```

    var globalComponents = {
        requestStrategy: {
            module: 'ub-ria/RequestStrategy'
        },
        globalData: {
            module: 'common/GlobalData',
            scope: 'singleton',
            properties: {
                requestStrategy: {$ref: 'requestStrategy'}
            }
        }
    };

    ioc.addComponent(globalComponents);

```

系统到底需要哪些通用组件这个着实是由各自的需求决定的，而且经常是用到了再继续追加配置这样。我们这里只是举个例子。

另注：关于`ioc`组件配置的各项参数的含义，可以参考[ioc官方文档]()。

#### 模块组件

`模块组件`指的是根据模块本身动态分配的依赖组件。这类组件我们暂时不在这里做配置。之后创建模块时会提及。

### ioc组装工厂

我们把这个工厂实现类命名为`IoCActionFactory`，放在`common`下。 代码比较简单：

```
define(
    function (require) {
        var ioc = require('common/ioc');

        /**
         * @class common.IoCActionFactory
         * @extends ub-ria.mvc.IoCActionFactory
         */
        var exports = {};

        exports.constructor = function (actionComponents, options) {
            this.$super(arguments);

            this.setIocContainer(ioc);
        };

        var RIAIoCActionFactory = require('ub-ria/mvc/IoCActionFactory');
        var IoCActionFactory = require('eoo').create(RIAIoCActionFactory, exports);

        return IoCActionFactory;
    }
);

```

## 增加主入口脚本 Main.js


初始化启动入口的核心作用就是调用ub-ria模块的start方法，启动项目。但可以根据特定项目的自身需求做之前和之后的数据准备和其它处理。比如，在此实例中，我们需要在系统启动之前先加载用户数据，系统启动失败，跳转到失败页。这样`Main.js`代码是这样的：

```
define(
    function (require) {
        var u = require('./util');

        /**
         * 主入口
         *
         * @class common.Main
         */
        var exports = {};

        /**
         * 开始初始化用户常量，此时已经获取用户的全部信息
         *
         * @method common.Main#initializeUserAndSystem
         * @return {er.meta.Promise}
         */
        exports.initializeUserAndSystem = function () {
            var data = this.getGlobalData();
            return require('promise').all([data.getUser(), data.getSystem()]);
        };

        /**
         * 开始初始化系统其它部分，此时已经完成用户和系统常量初始化
         *
         * @method common.Main#initializeApplication
         */
        exports.initializeApplication = function () {
            var startSystem = function (config, ria) {
                config.indexURL = this.getIndexURL();
                // 核心逻辑，启动ub-ria
                ria.start();
            };
            // 启动系统所需要的模块，全部在`common/ioc`中配置
            var startupModules = ['erConfig', 'ria', 'systemConfig'];
            require('./ioc').getComponent(startupModules, u.bind(startSystem, this));
        };

        /**
         * 获取起始页URL
         *
         * @method common.Main#getIndexURL
         * @return {string}
         */
        exports.getIndexURL = function () {
            return '/contract/list';
        };

        /**
         * 登出
         *
         * @method common.Main#signOut
         */
        exports.signOut = function () {
            var baseURL = 'index.html';
            location.href = baseURL + location.hash;
            // 在`Promise`中，抛出异常会使其进入失败状态，
            // 一般来说跳转了就不会有下面的代码执行，这里就是防止进入成功状态
            throw new Error('Failed to redirect to index');
        };

        /**
         * 开始系统执行
         *
         * @method common.Main#start
         */
        exports.start = function () {
            // 初始化流程：
            //
            // 1. 加载当前用户信息，用户未登录会返回403，失败就跳回首页
            // 2. 初始化应用系统其它部分
            this.initializeUserAndSystem()
                .thenBind(this.initializeApplication, this)
                .fail(u.bind(this.signOut, this));
        };

        var oo = require('eoo');

        oo.defineAccessor(exports, 'globalData');

        var Main = oo.create(exports);
        return Main;
    }
);

```

脚本创建完，增加到ioc.js的通用配置中，供全局调用，当然，包括其中依赖的其他模块：

```
        main: {
            module: 'common/Main',
            auto: true,
            scope: 'singleton'
        },
        erConfig: {
            module: 'er/config',
            scope: 'static'
        },
        ria: {
            module: 'ub-ria',
            scope: 'static'
        },
        systemConfig: {
            module: 'common/config',
            scope: 'static'
        }

```

## 入口静态页main.html

一个SPA项目都具备一个入口静态页。一个典型的入口页结构如下：

```
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <title>ub-ria展示</title>
    <link rel="stylesheet" href="src/common/css/esui.css"/>
    <link rel="stylesheet" href="src/common/css/main.css">
    <link rel="icon" href="http://www.someplace.com/favicon.ico">
    <script src="src/external/esl.js"></script>
</head>
<body>
    <script>
        document.createElement('aside');
        document.createElement('footer');
        document.createElement('header');
        document.createElement('nav');
        document.createElement('section');
        document.createElement('article');
        document.createElement('figure');
        document.createElement('figcaption');
    </script>
    <!-- 标题栏 -->
    <header id="header"></header>
    <div id="page-container" class="page-container">
        <div id="main" class="page-content"></div>
    </div>
    <footer id="foot"></footer>
    <script>
        require.config({});
    </script>
    <script>
        require(
            ['common/ioc'],
            function (ioc) {
                ioc.getComponent(
                    'main'
                    function (main) {
                        main.start();
                    }
                );
            }
        );
    </script>
</body>
</html>

```

下面分开说明下一些必须的配置。

### 静态资源引入

#### 样式资源

上面提及过，由于esui的样式很大，为了节省带宽，将esui的样式与其它样式分离为两个进行加载。    

```
<link rel="stylesheet" href="src/common/css/esui.css"/>
<link rel="stylesheet" href="src/common/css/main.css">
```

#### AMD模块加载器。    

```
<script src="src/external/esl.js"></script>
```

请下载esl的最新版本，[点这里](http://github.com/ecomfe/esl)

### 页面结构规约

ER框架在渲染页面时默认会查找html中id为'main'的元素作为单个MVC模块的渲染容器。因此，必须创建一个这样的空元素。除此之外，没有额外的要求。

```
<div id="main" class="page-content"></div>
```
如果想修改渲染容器的查找id，可以修改er配置中的`mainElement`属性值。

### 依赖模块引用配置

```
    <script>
        require.config({});
    </script>
```

packages属性可以置空，之后命令行跑一次`edp project updateLoaderConfig`会自动按照`module.conf`中的配置添加依赖。

### 系统启动入口

```
    <script>
        require(
            ['common/ioc'],
            function (ioc) {
                ioc.getComponent(
                    'main',
                    function (main) {
                        main.start();
                    }
                );
            }
        );
    </script>

```
这是一个典型ioc模式下的系统入口进入方式。

至此，我们对整个系统的一个通用框架搭建就完成了。之后我们就可以创建具体的模块。

# step4: 添加模块

基于ub-ria框架的模块是以一个”实体“为单位的操作页面集合。比如对于”通讯录“模块，它对应的”实体“是一条“通讯信息”，页面包含通讯信息的“新建页“和“列表页“，每个页面都满足MVC的架构。模块通过文件夹与其它模块隔离。

因此，我们添加模块要做的第一件事是：src下创建一个模块文件夹，命名为`contacts`。

模块中一个完整的”页“由三部分组成： mvc + css + tpl。所以按照这个分类，我们在`contacts`下建立三个子文件夹：`/mvc`, `/css`, `/tpl`


## 增加枚举对象

`枚举对象是业务系统中非常普遍使用的一个类型，其基本功能是将一个数字和具体的含义对应起来。` 这个是ER中对枚举类`Enum`的定义。项目中的枚举对象是引用了这个枚举类的简单对象。

```
define(
    function (require) {
        var Enum = require('er/Enum');

        var exports = {};
        
        /**
         * 权限类型
         *
         * @enum
         */
        exports.AuthTypes = new Enum(
            /**
             * @property {number} [PERSONAL=1]
             *
             * 私有
             */
            {alias: 'PERSONAL', text: '私有', value: 1},
            /**
             * @property {number} [PUBLIC=1]
             *
             * 公开
             */
            {alias: 'PUBLIC', text: '公开', value: 2}
        );

        return exports;
    }
);
```

## 增加Data

在 ub-ria 1.0 版本中，数据的请求和处理都在Model层完成。为了更好的实现逻辑分层，ub-ria 2.0 以后数据请求部分的逻辑被从Model层抽取出来到一个新的层中实现，这个层叫`Data`，它的实现是`ub-ria/RequestManager`的实例。

之前在[ub-ria架构解析](doc/structure.md)中介绍过，每一个Model的实例都对应一个默认的Data实例，Model和Data实例映射配置我们这里先不讲，这个Data实例理论上你定义在哪儿也都无所谓，但是，我们还是走寻常路，模块化思想，把它定义在本模块下吧，命名为`ContactData.js`：

```
define(
    function (require) {
        var u = require('underscore');

        var exports = {};

        var requests = [];

        var RequestManager = require('ub-ria/mvc/RequestManager');
        var ContactData = require('eoo').create(RequestManager, exports);

        u.each(
            requests,
            function (config) {
                RequestManager.register(ContactData, config.name, config);
            }
        );

        return ContactData;
    }
);

```

上面这段代码就两个主要逻辑：定义请求；注册请求。

请求经过`RequestManager.register`注册后就可以享受`RequestManager`提供的串行、并行、冲突等智能处理，当然，你也可以选择不注册，让各种并发的ajax请求随意发起。。。

目前，`requests`变量是空的，当我们跟后端确定了请求接口以后，就可以把这个变量填充起来，这里假设我们已经跟后端确定了接口，于是：

首先我们要定义一堆ajax的请求接口供Model调用。

```
/**
 * 检索一个实体列表，返回一个分页的结果集
 *
 * @public
 * @method ContactData#search
 * @param {Object} query 查询参数
 * @return {er.meta.FakeXHR}
 */
exports.search = function (query) {
    return this.request(
        'contact/search',
        query,
        {
            method: 'GET',
            url: '/contactors'
        }
    );
};

/**
 * 根据id获取单个实体
 *
 * @public
 * @method ContactData#findById
 * @param {string} id 实体的id
 * @return {er.meta.FakeXHR}
 */
exports.findById = function (id) {
    return this.request(
        'contact/findById',
        null,
        {
            method: 'GET',
            url: '/contactors/' + id
        }
    );
};

/**
 * 保存一个实体
 *
 * @public
 * @method ContactData#save
 * @param {Object} entity 实体对象
 * @return {er.meta.FakeXHR}
 */
exports.save = function (entity) {
    return this.request(
        'contact/save',
        entity,
        {
            method: 'POST',
            url: '/contactors'
        }
    );
};

/**
 * 更新一个实体
 *
 * @public
 * @method ContactData#update
 * @param {Object} entity 实体对象
 * @return {er.meta.FakeXHR}
 */
exports.update = function (entity) {
    var submitEntity = u.omit(entity, 'id');
    return this.request(
        'contact/update',
        submitEntity,
        {
            method: 'PUT',
            url: '/contactors/' + entity.id
        }
    );
};

```
这其实就是一堆请求接口（由于ub-ria的基类默认调用了一些Data的接口，比如列表基类的`search`，表单基类的`save`，因此如果引用了这些基类，里面涉及到的接口都要实现，否则会抛'xxx method is not implemented'的异常。P），里面最核心的是`.request`方法的调用。这个接口接受重载方式：
    
     - `.request(name, data, options)`
     - `.request(name, data)`
     - `.request(name)`
     - `.request(options, data)`
     - `.request(options)`

上面的重载不是随便乱用的，挨个解释下：

第一个最高大全: 
    
    `name`代表请求名称，之后register注册的那个；`data`是请求数据；`options`是请求配置项，里面包含`method`、`url`字段。

第二个没有了options:
    
    但是，`method`和`url`是换了地方，放在之后的`register`方法中跟着注册配置一起。

第三个没了data:
    
    这个很正常，就是没后数据发送呗，比如`GET`。

第四个没了name: 
    
    这个之前提及了，就是没有跑register注册，也就是没配置请求执行策略的时候，`name`没有实际的意义，但是此时要注意options和data两个参数的顺序，也就是data的顺序不能变，options置前。

第五个没了name和data: 
    
    这个就不解释了。。。


然后我们把这些接口定义到`requests`变量中，用来后续的注册：

```

var requests = [
    {
        name: 'contact/search',
        scope: 'instance',
        policy: 'auto'
    },
    {
        name: 'contact/findById',
        scope: 'instance',
        policy: 'auto'
    },
    {
        name: 'contact/save',
        scope: 'instance',
        policy: 'auto'
    },
    {
        name: 'contact/update',
        scope: 'instance',
        policy: 'auto'
    }
];

```
看到上面这个配置，你可能又晕了，其实我很想说：去读源码吧，秒懂，但是。。。道德底线告诉我，我不能。。。 于是，我把代码里的注释扒到这里讲讲：

**name**: 这个属性很关键，是个key，先理解到这里可以了。

**scope**: 请求**配置**的作用域。默认`instance`，可选`global`。

    `instance`: 在当前的Data类型对象下，这个'name'的请求配置只能有一个，重复配置报错；
    `global`: 在全局条件下，这个'name'的请求配置都只能有一个。

**policy**: 同名请求发生冲突时的处理机制。默认`auto`, 可选`reuse`, `parallel`, `abort`

    `reuse`: 复用当前进行中的请求及它的返回结果；
    `abort`: 终止正在进行的请求，执行当前请求；
    `parallel`: 并发执行当前请求;
    `auto`: 1. 如果请求的配置/参数均没有变化，则`reuse`
            2. 如果有变化：
                1.1. 如果是GET或PUT请求，则`parallel`
                1.2. 如果是POST等非幂等的请求，则`abort`

除了上面的几个属性之外，上面也提及了，有的时候会把url和method也配置进来，这些参数统一配置在**options**属性里。这个的使用场景其实比较好理解，就是确定某个`name`的请求只有那么一种请求类型和路径。


到此，Data层就加好了，之后如果新增了接口，也照样追加进去即可。

**TIP**: Data是可以跨模块引用的，因此，本模块下理论和道德上只定义本模块相关的请求，如果需要别的请求，请尽量从别的模块中定义和获取，除非真的没有这个模块。。。

完成到这里开始，我们就可以正式开发页面mvc了。

## 增加权限声明类

ub-ria 1.0时期，框架只支持页面url级别的权限判断；2.0版本以后，BaseModel中增加了`checkPermission`接口，用以判断是否具备某一个权限。权限的赋值通过在项目模块端实现一个**权限声明类**，将权限通过 `.canDoSomething`的形式定义。

在本实例中，需要判断权限的地方有两个：1. 是否有新建联系人权限  2. 是否有批量修改联系人的权限

```
define(
    function (require) {
        /**
         * @class contact.ContactPermission
         */
        var exports = {};

        /**
         * 是否可创建
         *
         * @public
         * @method contact.ContactPermission#canCreate
         * @return {boolean}
         */
        exports.canCreate = function () {
            return this.getSystemPermission().isAllow('CONTACT_NEW');
        };

        /**
         * 是否可批量修改通讯录权限
         *
         *
         * @public
         * @method contact.ContactPermission#canBatchModifyAuth
         * @return {boolean}·
         */
        exports.canBatchModify = function () {
            return this.getSystemPermission().isAllow('CONTACT_AUTH_MODIFY');
        };

        var eoo = require('eoo');

        eoo.defineAccessor(exports, 'systemPermission');

        return eoo.create(exports);
    }
);

```

## 增加页面

这个实例中包含两个页面：列表页和表单页。

———— [点我看怎么创建列表](doc/list.md)
———— [点我看怎么创建表单](doc/form.md)

## 增加模块配置文件

mvc页面中的一些组件依赖，以及模块与URL之间的映射关系都需要单独配置。模块文件夹下增加`config.js`，里面就包含两部分内容：Action注册和组件依赖注册

### Action注册

```
var ActionFactory = require('common/IoCActionFactory');
var actions = [
    {
        path: '/contact/list',
        type: new ActionFactory('contactList'),
        title: '联系人 - 列表',
        authority: ['CONTACT_LIST_VIEW]
    },
    {
        path: '/contact/create',
        type: new ActionFactory('contactForm'),
        title: '联系人 - 新建',
        args: {formType: 'create'},
        authority: ['CONTACT_NEW']
    }
];
require('er/controller').registerAction(actions);

```

`registerAction`是ER框架的重要方法，通过调用该方法，才能将多个页面注册到一个容器中，完成从URL到Action的映射以及其它的页面管理。它的参数是一个数组，数组的元素就是创建一个页面所需要的相关配置，具体含义请查看ER文档。


### 模块组件依赖注册

`模块组件`，这个词听着熟悉吧，这个在前面讲`ioc`的时候提及过，那配置的地方，就在这里

```
var ioc = require('common/ioc');
var components = {
    contactData: {
        module: 'contact/ContactData',
        auto: true,
        properties: {
            requestStrategy: {
                $import: 'commonRequestStrategy',
                scope: 'singleton',
                args: ['contact', 'contactor']
            }
        }
    },
    contactPermission: {
        module: 'contact/ContactPermission',
        scope: 'singleton',
        auto: true
    },
    contactListModel: {
        module: 'contact/mvc/ContactListModel',
        auto: true,
        properties: {
            data: {
                $ref: 'contactData'
            },
            permission: {
                $ref: 'contactPermission'
            }
        }
    },
    contactListView: {
        module: 'contact/mvc/ContactListView',
        auto: true
    },
    contactList: {
        module: 'contact/mvc/ContactList',
        properties: {
            model: {
                $ref: 'contactListModel'
            },
            view: {
                $ref: 'contactListView'
            }
        },
        args: ['contact'],
        auto: true,
        group: 'contact'
    },
    contactFormModel: {
        module: 'contact/mvc/ContactFormModel',
        auto: true,
        properties: {
            data: {
                $ref: 'contactData'
            },
            permission: {
                $ref: 'contactPermission'
            }
        }
    },
    contactFormView: {
        module: 'contact/mvc/ContactFormView',
        auto: true
    },
    contactForm: {
        module: 'contact/mvc/ContactForm',
        properties: {
            model: {
                $ref: 'contactFormModel'
            },
            view: {
                $ref: 'contactFormView'
            }
        },
        args: ['contact'],
        auto: true,
        group: 'contact'
    }
    };

```

看到上面这堆，不知道是不是有人晕了。这里虽然看起来密密麻麻，其实也就是把类的依赖定义了一下而已。其实看着这段代码，有很多雷同的字眼出现，通常在真实的项目里，可能不同的config文件中组件配置的写法都是差不多的，此时建议在`ioc.js`中创建通用的方法来实现上面的配置。

## 添加模块引用

模块创建完，需要在通用资源配置文件`common/config.js`下增加引用。

```
require('contact/config');

```

# step5: 调试

本实例中，使用edp提供的server作为本地调试服务器。项目根目录下有这个文件：`edp-webserver-config.js`，它是edp server的配置文件，它的实现比较简单，不太符合我们的真实调试需求。下面做些补充和完善。

## 创建Mockup数据

前端调试主要是模拟后端的数据请求行为，我们使用json文件作为不同请求的返回数据容器。

1. 项目根目录下创建mockup文件夹
2. 创建模块目录名对应的子文件夹，如`contact`
3. 根据请求需求，分别创建`findById.json`,`search.json`,`roles.json`。每个文件的内容都是与后端返回一直的模拟数据格式。

```
{
    "id":1,
    "name":"莫文蔚",
    "mobile":"13511111111",
    "description":"描述一下",
    "role":1,
    "auth":0
}
```
## 自定义调试工具

`tool`下创建`edp`文件夹。具体的创建内容不详细描述，可以参考demo的源码。创建的工具的目标主要是重定向请求。

## 修改本地服务器配置

```
var path = require('path');
var fs = require('fs');

var proxyTarget = 'xx.xx.xx.xx'; // 后端的ip地址

var proxyTargetPort = 8040; // 后端端口号

exports.port = 8040; // 前端端口号
exports.directoryIndexes = true;
exports.documentRoot = __dirname;

var auto = require('./tool/edp/auto');
auto.initialize({ proxyTarget: proxyTarget, proxyTargetPort: proxyTargetPort });

var getConfig = require('./tool/edp/getConfig');

exports.getLocations = function () {
    var modules = [
        {
            name: 'login'
        },
        {
            name: 'contact'
        }
    ];

    var locations = require('./mockup/static').getConfig();

    for (var i = 0; i < modules.length; i++) {
        var module = modules[i];
        locations = locations
            .concat(getConfig(module.name, module))
            .concat(auto.config(module.name, module));
    }
    var all = { 
        location: /^.*$/, 
        handler: [
            proxy(proxyTarget, proxyTargetPort)
        ]
    };


    locations.push(all);
    return locations;
};

exports.injectRes = function (res) {
    for (var key in res) {
        global[key] = res[key];
    }
};

```
上面这段代码里，最重要的就是`modules`变量的定义，定义在这里面的模块，代表后端请求走前端mockup。如果想走后端，从`modules`中注释或删掉指定模块即可。

## 启动吧！

项目根目录下执行下面的命令：

```
edp webserver start

```

然后浏览器访问指定local地址

```
localhost:8040/main.html#/contact/list
```

GOD BLESS YOU!!!


**注**：[实例源码戳这里](demo/note) 此实例的内容叫demo中展示的略微复杂一点点，但应该不影响理解。