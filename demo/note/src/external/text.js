/**
 * ETPL (Enterprise Template)
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 加载文本
 * @author exodia
 */

define(
    function (require) {
        return {
            load: function (resourceId, req, load) {
                var xhr = window.XMLHttpRequest
                    ? new XMLHttpRequest()
                    : new ActiveXObject('Microsoft.XMLHTTP');
                xhr.open('GET', req.toUrl(resourceId), true);
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            load(xhr.responseText);
                        }

                        xhr.onreadystatechange = new Function();
                        xhr = null;
                    }
                };

                xhr.send(null);
            }
        };
    }
);
