Title: 创建基本的表单
Author: dddbear(dddbear@aliyun.com)
Date: $DATE$
Tag: 表单

按照实例一开始提出的需求，我们要开发的这个表单页需求比较简单，支持一下几个字段的编辑：

1. 姓名（输入框，必填）
2. 电话（输入框，必填）
3. 角色类别（下拉选择，必填）
4. 权限列别（下拉选择，必填）
5. 备注（多行文本，选填）

ub-ria中`Form`型基类负责实现基本的表单类页面的功能。以上需求基本没有超出基类的功能覆盖范围，因此项目端只需要继承这些基类，并少量增加自己的代码即可。

#step1：增加模板

```
<!-- target: contactForm(master = formPage) -->
<!-- content: crumb -->
    <!-- import: contactFormCrumb -->
<!-- /content -->
<!-- content: formMain -->
    <!-- import: contactFormMain -->
<!-- /content -->

<!-- target: contactFormCrumb(master = crumb) -->
<!-- content: path -->
    <!-- if: ${formType} === 'create' -->
    <span>新建联系人</span>
    <!-- elif: ${formType} === 'update' -->
    <span>修改联系人</span>
    <!-- /if -->
<!-- /content -->

<!-- target: contactFormMain(master = formView) -->
<!-- content: sections -->
<section class="form-section">
    <!-- use:
        textboxField(
            field = 'name', title = '姓名',
            required = true, length = 100
        )
    -->
    <!-- use:
        textboxField(
            field = 'telephone', title = '电话', 
            required = true, pattern = '/^((0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$/'
        )
    -->
    <!-- use:
        textareaField(
            field = 'description', title = '备注',
            required = true, length = 300
        )
    -->
    <div class="form-field-required">
        <esui-label class="form-field-label" data-ui-for-target="role-type">角色分类：</esui-label>
        <div class="form-field-value">
            <span class="form-field-value-required-star">*</span>
            <esui-select
                title="角色分类："
                data-ui-id="role-type"
                data-ui-name="roleType"
                data-ui-value="@roleType"
                data-ui-required="true"
                data-ui-validity-label="role-validity-label"
                data-ui-datasource="@roleTypes">
            </esui-select>
            <label data-ui-type="Validity" data-ui-id="role-validity-label"></label>
        </div>
    </div>
    <div class="form-field-required">
        <esui-label class="form-field-label" data-ui-for-target="auth-type">权限分类：</esui-label>
        <div class="form-field-value">
            <span class="form-field-value-required-star">*</span>
            <esui-select
                title="权限分类："
                data-ui-id="auth-type"
                data-ui-name="authType"
                data-ui-value="@authType"
                data-ui-required="true"
                data-ui-validity-label="auth-validity-label"
                data-ui-datasource="@authTypes">
            </esui-select>
            <label data-ui-type="Validity" data-ui-id="auth-validity-label"></label>
        </div>
    </div>
</section>
<!-- /content -->

```

这个模板跟之前的列表模板一样，引用了大量通用模板中的片段和框架，当然，也有完全自定义的部分，比如`角色类型`字段的设定。 

**这段代码中有一点是需要关注一下的：** 

片段`<!-- target: contactFormMain(master = formView) -->` 的内容并不是所有的场景下都需要单独的定义为一个target。**只有当这个表单有可能以内嵌的方式显示在一个弹出层或者一个其他什么容器中的时候才需要这么定义（因为内嵌在其他容器中时，一般不需要Crumb面包屑部分，所以才专门释放一个纯内容体）**，并且规定：target的名字必须是**主片段**名追加’Main‘，在这里就是`'contactForm' + 'Main'`。


#step2：增加Model

```
define(
    function (require) {
        var u = require('underscore');
        var datasource = require('er/datasource');

        var authTypes = require('../enum').AuthTypes.toArray(
            'PERSONAL',
            'PUBLIC'
        );

        /**
         * 表单数据模型类
         *
         * @class mvc.ContactFormModel
         * @extends ub-ria.mvc.FormModel
         */
        var exports = {};

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
        exports.prepare = function () {
            this.$super(arguments);
            var roleTypes = this.get('roleTypes');

            roleTypes = u.map(
                roleTypes, 
                function (item) {
                    return {
                        text: item.name,
                        value: item.id
                    };
                }
            );
            roleTypes.unshift({name: '请选择', id: ''});

            this.set('roleTypes', roleTypes);

        };

        var eoo = require('eoo');
        var ContactFormModel = eoo.create(require('ub-ria/mvc/FormModel'), exports);
        return ContactFormModel;
    }
);

```
这段代码应该不需要多解释了，就是定义数据源，处理数据源。 这里注意一下`model.data().getRoles();` 这里面调用了一个之前Data层未定义的接口，用上面讲述的方式追加进去。

#step3：增加View

```
define(
    function (require) {
        require('tpl!../tpl/contactForm.tpl.html');

        var u = require('underscore');
        var URL = require('er/URL');

        /**
         * 视图
         *
         * @class mvc.ContactFormView
         * @extends ub-ria.mvc.FormView
         */
        var exports = {};

        /**
         * @override
         */
        exports.template = 'contactForm';
        var ContactFormView = require('eoo').create(require('ub-ria/mvc/FormView'), exports);
        return ContactFormView;
    }
);

```

#step4：增加Action

```
define(
    function (require) {
        var u = require('underscore');

        /**
         * 表单Action
         *
         * @class mvc.ContactForm
         * @extends ub-ria.mvc.FormAction
         */
        var exports = {};

        /**
         * @override
         */
        exports.entityDescription = '联系人';

        var ContactForm = require('eoo').create(require('ub-ria/mvc/FormAction'), exports);
        return ContactForm;
    }
);
```
