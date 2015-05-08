基础搭建
========

## 源码结构模板

一个基于UB-RIA的业务系统的源码结构如下：

    /src
        /common
            /css
                main.less    项目所有less的引用入口
                extern.less  dep中外部less的引用入口
                其它通用less文件
            /img
                通用图片、Flash等资源文件
            /tpl
                通用模板
            Main.js [初始化启动入口](doc/Main.md)
            config.js [资源配置加载入口](doc/config.md)
            tpl.js  [模板加载插件](doc/tpl.md)
            ioc.js  [全局ioc容器](doc/ioc.md)
            其他通用脚本
        /external
            esl.js esl脚本
            其他外部脚本
        /error
            通用错误Action等模块
        /ui
            /css
                控件less文件
            /img
                控件使用的资源文件
            /extension
                自定义ESUI Extension
            控件模块
        其它业务模块
    /tool
        /scaffold
            /tpl
                脚手架模板
            脚手架脚本
        工具文件
    /doc
        /guide
            新手入门文档
        /common
            通用模块文档
        /how-to
            开发步骤及最佳实践文档
        /ui
            控件文档
        /business-interface
            业务接口文档
        其它业务模块
    /mockup
        测试数据，按业务模块分
    /demo
        /ui
            控件演示页面
        核心功能演示页面
    /test
        单元测试脚本
    /dep
        packages.manifest 引入包配置
        依赖第三方模块，该文件夹不要手工修改
    /[output]
        编译输出，不进入SVN
    module.conf 第三方依赖包配置
    edp-build-config.js build配置
    edp-webserver-config.js 本地webserver配置
    copyright.txt 版权声明，用于加在编译后的脚本和CSS头部，每个项目一变
    *.html 各静态页
