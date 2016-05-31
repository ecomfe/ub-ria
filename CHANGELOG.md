# 变更说明

## 3.0变更

1. 以下组件暂时移除，如有需要再重新实现：

    - `mvc/ReadAction`、`mvc/ReadModel`、`mvc/ReadView`
    - `ui/Uploader`
    - `mvc/EntityValidator`及`mvc/checker/*`

2. 以下less已经移除：

    - `ui/css/main.less`
    - UI相关的除`Warn.less`以外的less文件

3. 以下方法均改为访问器属性实现：

    - `BaseAction`的`entityName`、`entityDescription`、`group`、`category`、`packageName`
    - `FormAction`的`cancelConfirmMessage`和`submitConfirmMessage`
    - `ListModel`的`defaultArgs`、`defaultStatusValue`、`statusTransitions`
    - `ListView`的`tableFields`

    修改为访问器属性意味着原有的`getXxx`方法会被移除，需要使用`.xxx`直接访问。

    `.xxx`会对应一个访问器，如果你需要重写访问器的逻辑，可以在子类中实现：

    ```javascript
    class MyForm extends FormAction {
        /**
         * @override
         */
        get defaultArgs() {
            return {
                // ...
            };
        }
    }
    ```

    大部分情况下，你只需要设置属性即可，而不需要对`get`的重写：

    ```javascript
    class MyForm extends FormAction {
        defaultArgs = {
            // ...
        };
    }
    ```

4. 表单的错误处理流程变化，`Data`层返回错误时必须转换对象，不能直接把`FakeXHR`返回。

    转换的对象要有`errorType`属性，其中验证错误时为`"validationConflict"`，可以参考如下实现：

    ```javascript
    class BaseData extends RequestManager {
        determineError(xhr) {
            if (xhr.status === 409) {
                let conflict = {errorType: 'validationConflict'};
                return u.extend(conflict, JSON.parse(xhr.responseText));
            }
            else {
                return {
                    errorType: 'serverError',
                    response: xhr.responseText
                };
            }
        }

        save(entity) {
            let requesting = this.request(
                '$entity/save',
                entity,
                {method: 'POST', url: '/$entity'}
            );
            return requesting.catch((xhr) => throw this.determineError(xhr));
        }

        update(entity) {
            let requesting = this.request(
                '$entity/update',
                entity,
                {method: 'PUT', url: '/$entity/' + entity.id}
            );
            return requesting.catch((xhr) => throw this.determineError(xhr));
        }
    }
    ```

5. 移除了对`er/events`的硬依赖，BaseAction / BaseModel / BaseView增加了`eventBus`属性，需要IoC来注入，可以默认使用`er/events`
6. `ListModel`不再通过`canBatchModify`这一属性判断是否可批量更新实体，需要使用`Permission`对象提供`canBatchModify()`方法
7. `ListView#commandHandler`改为`ListView#handleTableCommand`
8. 不再存在`RequestManager.register`方法，`register`函数作为`mvc/RequestManager`模块的命名导出存在，可以使用以下语句获取：

    ```javascript
    import {register} from 'ub-ria/mvc/RequestManager';
    ```

    如果同时需要用到`RequestManager`和`register`函数，可以：

    ```javascript
    import {default as RequestManager, register} from 'ub-ria/mvc/RequestManager';
    ```

9. `Warn`控件的`defaultProperties`属性已经移除，使用`OverrideDefaults`扩展代替
10. `Table`上扩展的渲染单元格的各个方法已经移除，使用`ui/tableUtil`模块代替：

    ```javascript
    import {status, slideOperatos} from 'ub-ria/ui/tableUtil';

    tableFields = [
        {
            name: '状态',
            content: function (entity) {
                return status(entity.status);
            }
        },
        {
            name: '操作',
            content: function (entity) {
                let config = {
                    // ...
                };
                return slideOperatos(config);
            }
        }
    ]
    ```

11. `RequestManager`不再默认使用`er/ajax`作为请求核心，强制需要外部提供
12. 不再依赖`promise`和`uioc`库，如果需要系统需自行引入。通常情况下有`babel`的shim存在，不需要引入`promise`库了
13. `RequestManager`的`getEntityName()`和`getBackendEntityName()`已经移除，构造函数的`entityName`和`backendEntityName`参数也同时移除，这2个属性在默认实现中完全没有使用到
14. `BaseView`的`addUIEvents`和`addUIProperties`方法已经移除，使用对应的decorator代替，同时原有的`UIView`的`uiProperties`和`uiEvents`功能已经无效

    使用decorator的写法如下：

    ```javascript
    import {bindControlEvent as on, uiProperty as propert} from 'ub-ria/mvc/decorator';

    @property('uploader', 'extraArgs', {autoPush: 1}) // 给控件的属性设值
    @property('uploader', {fileType: 1, accept: 'image'}) // 批量设值
    class MyFormView extends FormView {
        // 一堆方法

        @on('uploader', 'change') // 关联方法和控件的事件
        [Symbol('onUploaderChange')](e) { // 注意这里使用Symbol作为key，且要给Symbol一个名字
            // ...
        }

        // 也可同时关联多个
        @on('save-draft', 'click')
        @on('save', 'click')
        [Symbol('onSaveDraftClick')](e) {
            // ...
        }
    }
    ```

## 4.0变更

1. 调整了目录结构，更加符合bundle的概念，各个模块的路径有所变化
2. 移除了`PartialForm`控件
3. `tpl`插件改为多个Named exports以适应babel 6的编译结果
4. 移除`update`模块，使用`diffy-update`库可以代替
5. 移除了`ReadAction`、`ReadModel`和`ReadView`
6. `Action`的`entityName`和`entityDescription`、`category`必须使用`get`声明，不能使用属性，`group`和`packageName`保持属性
7. 移除了`BaseChildView`
8. 移除`uiProperties`相关内容，所有东西都附加在`Model`上
9. `BaseModel`不再继承`ef.UIModel`，转而继承`emc.Model`
10. `ListModel`的`defaultArgs`必须通过`get`声明，且不再自动添加`status`参数，需自行写明或用`super.defaultArgs`后再扩展
11. `ListModel`的`getFilters`修改为`get filters`
12. `ListModel`的`getFiltersInfo`修改为`get filtersInfo`
13. `tableFields`配置移到`Model`中实现
14. 引入了`loader`机制代替原有的`datasource`
15. 移除了`SingleEntityModel`
16. 默认添加了基于`JSON Schema`的校验，使用`jsen`库
