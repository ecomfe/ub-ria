Title: 创建基本的列表
Author: dddbear(dddbear@aliyun.com)
Date: $DATE$
Tag: 列表

按照实例一开始提出的需求，我们要开发的这个列表页要可以：

1. 列表基本操作（分页查看）
2. 批量删除多个通讯信息
3. 批量修改多个通讯信息的使用状态
4. 根据指定条件搜索通讯信息
5. 有信件通讯信息的入口

以上这些功能基本都是ub-ria的基类默认提供的。因此项目端只需要继承这些基类，并增加自己的代码即可。

#step1：增加模板

在`tpl`子文件夹下创建`contactList.tpl.html`。

```
<!-- target: contactList(master = listPage) -->
<!-- content: crumb -->
    <!-- import: contactListCrumb -->
<!-- /content -->
<!-- content: main -->
<!-- import: contactListMain -->
<!-- /content -->

<!-- target: contactListCrumb(master = crumb) -->
<!-- content: path -->
    <span>联系人</span>
<!-- /content -->

<!-- target: contactListMain(master = listView) -->
<!-- content: actionButtons -->
    <a data-ui-type="Link" data-ui-id="create" data-ui-skin="add" data-ui-href="#/contact/create">新建联系人</a>
    <!-- /if -->
<!-- /content -->
<!-- content: bacthOperation -->
    <esui-button class="list-remove" data-ui-skin="link"
        data-ui-type="Button" data-ui-id="remove"
        data-ui-group="batch" data-ui-data-status="0"
        data-ui-extension-data-type="CustomData">删除</esui-button>
    <!-- /if -->
<!-- /content -->
<!-- content: filter -->
    <esui-button data-ui-id="filter-switch" data-ui-skin="select">筛选</esui-button>
<!-- /content -->
<!-- content: searchbox -->
    <!-- use: listSearchBox(placeholder = '请输入联系人名称') -->
<!-- /content -->
<!-- content: listFilter -->
    <!-- import: contactListFilters -->
<!-- /content -->
<!-- content: table -->
    <!-- use: listTable(useCommand = true) -->
<!-- /content -->

<!--target: contactListFilters(master = listFilter) -->
<!-- content: filters -->
    <!-- use:
    listFilterSelect(
        title = '角色类型：',
        id = 'role-type',
        name = 'roleType',
        datasource = 'roleTypes',
        field = 'roleType'
    )
    -->
    <!-- use:
    listFilterSelect(
        title = '权限类型：',
        id = 'auth-type',
        name = 'authType',
        datasource = 'authTypes',
        field = 'authype'
    )
    -->
<!-- /content -->
<!-- content: filterResults -->
    <!-- use: filterResult(title = '角色类型：', filter = ${filtersInfo.filters.roleType}) -->
    <!-- use: filterResult(title = '权限类型：', filter = ${filtersInfo.filters.authType}) -->
<!-- /content -->

```
这个模板的内容应该不难理解，它勾画出了一个列表页的整个结构。其中，`target: contactList` 就是它的主片段。比较不容易理解的应该是最后一段的`contactListFilters`部分，这段模板就是用来渲染筛选区的，包括**筛选条件选择**和**筛选结果**两部分，其中分别利用了通用模板中的`listStatusFilter`和`filterResult`。

#step2：增加Model

`mvc`子文件夹下创建`ContactListModel.js`，定义数据模型。

```
define(
    function (require) {
        var u = require('underscore');
        var datasource = require('er/datasource');
        var filterHelper = require('ub-ria/mvc/filterHelper');

        /**
         * 把Type枚举值转化成数组，并增加”全部“的元素，方便下拉选择控件直接使用
         *
         * @type {Array}
         */
        var authTypes = require('../enum').AuthTypes.toArray(
            {text: '全部', value: 'all'},
            'PERSONAL',
            'PUBLIC'
        );

        /**
         * 角色类型，动态的，需要从后端获取
         *
         * @type {Object}
         */
        var ROLE_TYPE_DATASOURCE = {
            roleTypes: function (model) {
                return model.data().getRoles();
            }
        };

        /**
         * 权限类型，静态的，从枚举变量获取
         *
         * @type {Object}
         */
        var AUTH_TYPE_DATASOURCE = {
            authTypes: datasource.constant(authTypes)
        };

        /**
         * @class contact.mvc.ContactListModel
         * @extends ub-ria.mvc.ListModel
         */
        var exports = {};

        /**
         * @override
         */
        exports.constructor = function () {
            this.$super(arguments);
            this.putDatasource(ROLE_TYPE_DATASOURCE, 0);
            this.putDatasource(AUTH_TYPE_DATASOURCE, 0);
        };

        /**
         * @override
         */
        exports.defaultArgs = {
            orderBy: 'contactId',
            order: 'desc'
        };

        /**
         * @override
         */
        exports.getFilters = function () {
            return {
                roleType: {
                    value: this.get('roleType'),
                    text: filterHelper.select.getText,
                    datasource: this.get('roleTypes')
                },
                authType: {
                    value: this.get('authType'),
                    text: filterHelper.select.getText,
                    datasource: this.get('authTypes')
                }
            };
        };

        var ListModel = require('ub-ria/mvc/ListModel');
        var ContactListModel = require('eoo').create(ListModel, exports);
        return ContactListModel;
    }
);

```

上面这段代码涉及到的内容也不多，主要包括下面几个使用点：

## 设置默认查询参数

```
exports.defaultArgs = {
    orderBy: 'contactId',
    order: 'desc'
};

```

这个的意思应该比较好理解，就是设置默认的获取列表数据时需要的参数。这个参数会传给后端，但并不会显示在URL中，提高用户体验。

## 数据源定义

```
        var ROLE_TYPE_DATASOURCE = {
            roleTypes: function (model) {
                return model.data().getRoles();
            }
        };

        var AUTH_TYPE_DATASOURCE = {
            roleTypes: datasource.constant(roleTypes)
        };

```

`数据源`是`Model`的核心。从获取来源上可以分为：常量数据源和远程数据源。上面的两个第一个就是远程数据源，第二个是常量数据源。

## 数据源绑定

```
    this.putDatasource(FILTER_DATASOURCE, 0);

```

在很久很久以前，数据源被定义完成后都是直接通过对`this.datasource`的赋值简单粗暴的实现与Model的绑定的。但是使用这种方式实现数据源的继承相当的蛋疼，而且不容易控制不同数据的加载顺序。因此ub-ria做了这方面的升级，开放`putDatasource`接口，通过参数控制数据源加载的执行顺序。比如，在上面的例子中，如果我们又定义了两个数据源，一个要求跟`FILTER_DATASOURCE`并行执行加载，另一个在`FILTER_DATASOURCE`之后执行。那么可以这样配置：

```
    this.putDatasource(FILTER_DATASOURCE, 0);
    this.putDatasource(FILTER_DATASOURCE_1, 0);
    this.putDatasource(FILTER_DATASOURCE_2, 1);

```

## 数据源进行预处理

**预处理**指对已经加载完成的数据源中的数据进行二次加工和处理的地方，主要包括对业务逻辑中各种数据组合、计算的操作等。这个处理通过实现基类提供的`prepare`接口实现。

## 过滤器配置

这个是列表页的特有方法，用来定义筛选区的字段。

```
        exports.getFilters = function () {
            return {
                roleType: {
                    value: this.get('roleType'),
                    text: filterHelper.select.getText,
                    datasource: this.get('roleTypes')
                },
                authType: {
                    value: this.get('authType'),
                    text: filterHelper.select.getText,
                    datasource: this.get('authTypes')
                }
            };
        };

```

#step3：增加View

`mvc`子文件夹下创建`ContactListView.js`，定义视图类。

```
define(
    function (require) {
        require('tpl!../tpl/contactList.tpl.html');

        var AuthTypes = require('../enum').AuthTypes;

        /**
         * @class company.mvc.ContactListView
         * @extends ub-ria.mvc.ListView
         */
        var exports = {};

        /**
         * @override
         */
        exports.template = 'contactList';

        /**
         * @override
         */
        exports.getTableFields = function () {
            var tableFields = [
                {
                    title: '姓名',
                    field: 'name',
                    sortable: true,
                    resizable: false,
                    width: 120,
                    stable: false,
                    content: 'name'
                },
                {
                    title: '电话',
                    field: 'phone',
                    sortable: true,
                    resizable: false,
                    width: 120,
                    stable: false,
                    content: 'phone'
                },
                {
                    title: '权限类型',
                    field: 'authType',
                    sortable: true,
                    resizable: false,
                    width: 80,
                    stable: true,
                    content: function (item) {
                        return AuthTypes.getTextFromValue(item.authType);
                    }
                },
                {
                    title: '角色类型',
                    field: 'roleTypeName',
                    sortable: true,
                    resizable: false,
                    width: 80,
                    stable: true,
                    content: 'roleTypeName'
                },
                {
                    title: '备注',
                    field: 'description',
                    width: 300,
                    sortable: false,
                    resizable: false,
                    content: 'description'
                },
                {
                    title: '操作',
                    field: 'operation',
                    sortable: false,
                    resizable: false,
                    width: 50,
                    stable: true,
                    content: function (item) {
                        var config = [
                            {
                                text: '修改',
                                command: 'modify',
                                type: 'modify',
                                auth: item.canModify,
                                args: item.id
                            },
                            '|',
                            {
                                command: 'remove',
                                type: 'remove',
                                args: item.id,
                                text: '删除',
                                auth: item.canDelete
                            }
                        ];

                        var Table = require('esui/Table');
                        return Table.slideOperations(config);
                    }
                }
            ];

            return tableFields;
        };

        var eoo = require('eoo');

        var ListView = require('ub-ria/mvc/ListView');
        var ContactListView = require('eoo').create(ListView, exports);
        return ContactListView;
    }
);

```
Again，ub-ria基类覆盖了我们这个实例中的大部分功能实现，因此`View`基本也没有做什么额外的操作，除了：

1. 引入模板 `require('tpl!../tpl/contactList.tpl.html');`
2. 设定视图模板片段 `.template`
3. 设定列表字段 `.getTableFields`

#step4: 增加Action

`mvc`子文件夹下创建`ContactList.js`, 定义控制中枢。

```
define(
    function (require) {
        /**
         * @class contact.mvc.ContactList
         * @extends ub-ria.mvc.ListAction
         */
        var exports = {};

        /**
         * @override
         */
        exports.entityDescription = '联系人';

        var ListAction = require('ub-ria/mvc/ListAction');
        var ContactList = require('eoo').create(ListAction, exports);
        return ContactList;
    }
);

```
上面这段代码灰常的简单，基本上就是配置了自己的`entityDescription`，然后继承`ub-ria/mvc/ListAction`。没办法，因为我们的需求太简单，基类已经完全覆盖掉了，因此不需要额外增加任何代码。

到此，一个列表就开发完了。