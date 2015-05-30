/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 请求处理策略类
 * @author otakustay
 */

/**
 * 请求处理策略类
 *
 * 该类用于按一定规则处理请求时的URL、请求名称、请求参数等，通常每个项目会根据自身的前后端接口约定有一个通用的实现
 *
 * 默认实现是不对输入进行任何处理，添加`"json"`作为默认响应格式
 *
 * @class mvc.RequestStrategy
 */
export default class RequestStrategy {
    /**
     * 处理请求名称，具体业务可以使用此方法对请求名称进行一些替换操作，如可以根据当前对象的`entityName`属性为请求名称加上前缀等
     *
     * @protected
     * @method mvc.RequestStrategy#formatName
     * @param {string} name 当前请求的名称
     * @param {Object} options 请求的配置，此配置为调用{@link mvc.RequestManager#request}时提供的初始配置
     * @return {string}
     */
    formatName(name, options) {
        return name;
    }

    /**
     * 处理请求的URL，具体业务可以使用此方法对请求的URL进行一些替换操作，
     * 如可以根据当前对象的`entityName`来生成通用的URL等
     *
     * @protected
     * @method mvc.RequestStrategy#formatURL
     * @param {string} url 当前请求的URL
     * @param {Object} options 请求的配置，此配置为已经被处理过的完整的配置
     * @return {string}
     */
    formatURL(url, options) {
        return url;
    }

    /**
     * 处理请求参数
     *
     * @protected
     * @method mvc.RequestStrategy#formatOptions
     * @param {Object} options 请求的参数
     * @return {Object}
     */
    formatOptions(options) {
        // 默认使用JSON作为响应格式
        if (!options.dataType) {
            options.dataType = 'json';
        }

        return options;
    }
}
