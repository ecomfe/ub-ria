/**
 * DEMO
 *
 * @file 全局ioc 容器
 * @exports common.ioc
 * @author exodia(dengxinxin@baidu.com)
 *         shenbin(bobshenbin@gmail.com)
 */
define(
    function (require) {
        var u = require('common/util');

        var IoC = require('uioc');
        var ioc = new IoC();

        var globalComponents = {
            ajax: {
                module: 'common/Ajax',
                scope: 'singleton'
            },
            globalData: {
                module: 'common/GlobalData',
                scope: 'singleton',
                properties: {
                    requestStrategy: {$ref: 'commonRequestStrategy'},
                    ajax: {$ref: 'ajax'}
                }
            },
            templateEngine: {
                module: 'etpl',
                scope: 'static'
            },
            eventBus: {
                module: 'er/events',
                scope: 'static'
            },
            redirectSubmitHanlder: {
                module: 'common/handler/RedirectSubmitHandler',
                properties: {
                    redirectOptions: {
                        global: true,
                        force: true,
                        childFormSubmitRedirect: false
                    }
                }
            },
            submitHandler: {
                module: 'common/handler/ToastSubmitHandler',
                properties: {
                    nextSubmitHandler: {
                        $ref: 'redirectSubmitHanlder'
                    }
                }
            },
            requestManager: {
                module: 'ub-ria/mvc/RequestManager',
                auto: true
            },
            systemPermission: {
                module: 'er/permission',
                scope: 'static'
            },
            baseModel: {
                module: 'ub-ria/mvc/BaseModel',
                properties: {
                    data: {
                        $ref: 'requestManager'
                    },
                    permission: {
                        $ref: 'systemPermission'
                    }
                },
                auto: true
            },
            commonRequestStrategy: {
                module: 'common/RequestStrategy'
            },
            main: {
                module: 'common/Main',
                auto: true,
                scope: 'singleton'
            },
            erConfig: {
                module: 'er/config',
                scope: 'static'
            },
            globalPermission: {
                module: 'er/permission',
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
        };

        ioc.addComponent(globalComponents);

        return ioc;
    }
);
