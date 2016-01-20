/*
 @Name：bambooUI集合
 @Author：sinbad
 @version: 0.0
 @License：LGPL       
 */

(function ($) {
    var win = window;
    var $win = $(window);
    var $doc = $(document);
    var $body = $("body");
    if (win.bamboo) {
        throw new Error("全局变量bamboo重名了");
        return;
    }
    if (!win.console || !win.console.log) {
        win.console = {};
        win.console.log = function () { }
        throw new Error("该浏览器不支持console.log");
    }

    win.bamboo = {
        version: '0.0',
        ie6: !!win.ActiveXObject && !win.XMLHttpRequest
    }
    // cookie相关
    bamboo.cookie = function (key, value, options) {
        options = $.extend({}, options);
        // 写入cookie
        if (typeof options.expires == 'number') {
            expires = new Date();
            expires.setTime(expires.getTime() + options.expires * 24 * 60 * 60 * 1000);
        }
        if (arguments.length > 1) {
            return (document.cookie = [
                encodeURIComponent(key), '=', encodeURIComponent(value),
                options.exipres ? '; expires=' + options.expires.toUTCString() : '',
                options.path ? ';path=' + options.path : '',
                options.domain ? ';domain=' + options.domain : '',
                options.secure ? ';secure' : '',
            ].join(' '));
        }
        // 读取cookie
        var result = key ? undefined : {};
        var cookies = document.cookie ? document.cookie.split('; ') : [];
        for (var i = 0, l = cookies.length; i < l; i++) {
            var parts = cookies[i].split('=');
            var name = decodeURIComponent(parts.shift());
            var cookie = decodeURIComponent(parts.join(''));
            if (key && key === name) {
                result = decodeURIComponent(cookie);
                break;
            }
            if (!key) {
                result[name] = cookie;
            }
        }
        return result;
    }
    bamboo.removeCookie = function (key, options) {
        if (bamboo.cookie(key) == undefined) {
            return false;
        }
        bamboo.cookie(key, '', $.extend({}, options, { expires: -1 }));
        return !bamboo.cookie(key)
    }

    // placeholder全兼容
    bamboo.placeholder = function (opts) {
        var defaults = {
            denyBind: false
        };
        var o = $.extend(defaults, opts);
        if(!o.denyBind){
            $(document).on("focus.placeholder", "input, textarea", function () {
                var $t = $(this);
                setTimeout(function(){ $t.next("div.extraIntro").hide();},50)
            }).on("blur.placeholder", "input, textarea", function () {
                if ($.trim($(this).val()) == "") {
                    $(this).next("div.extraIntro").show();
                }
            })
            $(document).on("click.placeholder", "div.extraIntro", function () {
                $(this).hide();
                $(this).prev().focus();
            })
        }
        $("div.extraIntro").each(function (i, n) {
            var $d = $(n);
            $d.parent().css("position", "relative");
            $d.css({
                left: "12px",
                top: ($d.prev().height() / 2 - $d.height() / 2) + "px"
            })
            if ($.trim($d.prev().val()) == "" && $d.prev().is(":visible")) {
                $d.show();
            } else {
                $d.hide();
            }
        })
    }


    /*
    * 节流函数
    * 频率控制 返回函数连续调用时，fn 执行频率限定为每多少时间执行一次
    * @param fn {function}  需要调用的函数
    * @param delay  {number}    延迟时间，单位毫秒
    * @param immediate  {bool} 给 immediate参数传递false 绑定的函数先执行，而不是delay后后执行。
    * @return {function}实际调用函数
    */
    bamboo.throttle = function (fn, delay, immediate, debounce) {
        var curr = +new Date(),//当前事件
            last_call = 0,
            last_exec = 0,
            timer = null,
            diff, //时间差
            context,//上下文
            args,
            exec = function () {
                last_exec = curr;
                fn.apply(context, args);
            };
        return function () {
            curr = +new Date();
            context = this,
            args = arguments,
            diff = curr - (debounce ? last_call : last_exec) - delay;
            clearTimeout(timer);
            if (debounce) {
                if (immediate) {
                    timer = setTimeout(exec, delay);
                } else if (diff >= 0) {
                    exec();
                }
            } else {
                if (diff >= 0) {
                    exec();
                } else if (immediate) {
                    timer = setTimeout(exec, -diff);
                }
            }
            last_call = curr;
        }
    };
    bamboo.debounce = function (n, delay, immediate) {
        return bamboo.throttle(fn, delay, immediate, true);
    }

    //json转化，完全引用：https://github.com/douglascrockford/JSON-js/blob/master/json2.js
    if (typeof JSON !== 'object') {
        JSON = {};
    }
    (function () {
        'use strict';

        var rx_one = /^[\],:{}\s]*$/,
            rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
            rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
            rx_four = /(?:^|:|,)(?:\s*\[)+/g,
            rx_escapable = /[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

        function f(n) {
            // Format integers to have at least two digits.
            return n < 10
                ? '0' + n
                : n;
        }

        function this_value() {
            return this.valueOf();
        }

        if (typeof Date.prototype.toJSON !== 'function') {

            Date.prototype.toJSON = function () {

                return isFinite(this.valueOf())
                    ? this.getUTCFullYear() + '-' +
                            f(this.getUTCMonth() + 1) + '-' +
                            f(this.getUTCDate()) + 'T' +
                            f(this.getUTCHours()) + ':' +
                            f(this.getUTCMinutes()) + ':' +
                            f(this.getUTCSeconds()) + 'Z'
                    : null;
            };

            Boolean.prototype.toJSON = this_value;
            Number.prototype.toJSON = this_value;
            String.prototype.toJSON = this_value;
        }

        var gap,
            indent,
            meta,
            rep;


        function quote(string) {

            // If the string contains no control characters, no quote characters, and no
            // backslash characters, then we can safely slap some quotes around it.
            // Otherwise we must also replace the offending characters with safe escape
            // sequences.

            rx_escapable.lastIndex = 0;
            return rx_escapable.test(string)
                ? '"' + string.replace(rx_escapable, function (a) {
                    var c = meta[a];
                    return typeof c === 'string'
                        ? c
                        : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                }) + '"'
                : '"' + string + '"';
        }


        function str(key, holder) {

            // Produce a string from holder[key].

            var i,          // The loop counter.
                k,          // The member key.
                v,          // The member value.
                length,
                mind = gap,
                partial,
                value = holder[key];

            // If the value has a toJSON method, call it to obtain a replacement value.

            if (value && typeof value === 'object' &&
                    typeof value.toJSON === 'function') {
                value = value.toJSON(key);
            }

            // If we were called with a replacer function, then call the replacer to
            // obtain a replacement value.

            if (typeof rep === 'function') {
                value = rep.call(holder, key, value);
            }

            // What happens next depends on the value's type.

            switch (typeof value) {
                case 'string':
                    return quote(value);

                case 'number':

                    // JSON numbers must be finite. Encode non-finite numbers as null.

                    return isFinite(value)
                        ? String(value)
                        : 'null';

                case 'boolean':
                case 'null':

                    // If the value is a boolean or null, convert it to a string. Note:
                    // typeof null does not produce 'null'. The case is included here in
                    // the remote chance that this gets fixed someday.

                    return String(value);

                    // If the type is 'object', we might be dealing with an object or an array or
                    // null.

                case 'object':

                    // Due to a specification blunder in ECMAScript, typeof null is 'object',
                    // so watch out for that case.

                    if (!value) {
                        return 'null';
                    }

                    // Make an array to hold the partial results of stringifying this object value.

                    gap += indent;
                    partial = [];

                    // Is the value an array?

                    if (Object.prototype.toString.apply(value) === '[object Array]') {

                        // The value is an array. Stringify every element. Use null as a placeholder
                        // for non-JSON values.

                        length = value.length;
                        for (i = 0; i < length; i += 1) {
                            partial[i] = str(i, value) || 'null';
                        }

                        // Join all of the elements together, separated with commas, and wrap them in
                        // brackets.

                        v = partial.length === 0
                            ? '[]'
                            : gap
                                ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                                : '[' + partial.join(',') + ']';
                        gap = mind;
                        return v;
                    }

                    // If the replacer is an array, use it to select the members to be stringified.

                    if (rep && typeof rep === 'object') {
                        length = rep.length;
                        for (i = 0; i < length; i += 1) {
                            if (typeof rep[i] === 'string') {
                                k = rep[i];
                                v = str(k, value);
                                if (v) {
                                    partial.push(quote(k) + (
                                        gap
                                            ? ': '
                                            : ':'
                                    ) + v);
                                }
                            }
                        }
                    } else {

                        // Otherwise, iterate through all of the keys in the object.

                        for (k in value) {
                            if (Object.prototype.hasOwnProperty.call(value, k)) {
                                v = str(k, value);
                                if (v) {
                                    partial.push(quote(k) + (
                                        gap
                                            ? ': '
                                            : ':'
                                    ) + v);
                                }
                            }
                        }
                    }

                    // Join all of the member texts together, separated with commas,
                    // and wrap them in braces.

                    v = partial.length === 0
                        ? '{}'
                        : gap
                            ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                            : '{' + partial.join(',') + '}';
                    gap = mind;
                    return v;
            }
        }

        // If the JSON object does not yet have a stringify method, give it one.

        if (typeof JSON.stringify !== 'function') {
            meta = {    // table of character substitutions
                '\b': '\\b',
                '\t': '\\t',
                '\n': '\\n',
                '\f': '\\f',
                '\r': '\\r',
                '"': '\\"',
                '\\': '\\\\'
            };
            JSON.stringify = function (value, replacer, space) {

                // The stringify method takes a value and an optional replacer, and an optional
                // space parameter, and returns a JSON text. The replacer can be a function
                // that can replace values, or an array of strings that will select the keys.
                // A default replacer method can be provided. Use of the space parameter can
                // produce text that is more easily readable.

                var i;
                gap = '';
                indent = '';

                // If the space parameter is a number, make an indent string containing that
                // many spaces.

                if (typeof space === 'number') {
                    for (i = 0; i < space; i += 1) {
                        indent += ' ';
                    }

                    // If the space parameter is a string, it will be used as the indent string.

                } else if (typeof space === 'string') {
                    indent = space;
                }

                // If there is a replacer, it must be a function or an array.
                // Otherwise, throw an error.

                rep = replacer;
                if (replacer && typeof replacer !== 'function' &&
                        (typeof replacer !== 'object' ||
                        typeof replacer.length !== 'number')) {
                    throw new Error('JSON.stringify');
                }

                // Make a fake root object containing our value under the key of ''.
                // Return the result of stringifying the value.

                return str('', { '': value });
            };
        }


        // If the JSON object does not yet have a parse method, give it one.

        if (typeof JSON.parse !== 'function') {
            JSON.parse = function (text, reviver) {

                // The parse method takes a text and an optional reviver function, and returns
                // a JavaScript value if the text is a valid JSON text.

                var j;

                function walk(holder, key) {

                    // The walk method is used to recursively walk the resulting structure so
                    // that modifications can be made.

                    var k, v, value = holder[key];
                    if (value && typeof value === 'object') {
                        for (k in value) {
                            if (Object.prototype.hasOwnProperty.call(value, k)) {
                                v = walk(value, k);
                                if (v !== undefined) {
                                    value[k] = v;
                                } else {
                                    delete value[k];
                                }
                            }
                        }
                    }
                    return reviver.call(holder, key, value);
                }


                // Parsing happens in four stages. In the first stage, we replace certain
                // Unicode characters with escape sequences. JavaScript handles many characters
                // incorrectly, either silently deleting them, or treating them as line endings.

                text = String(text);
                rx_dangerous.lastIndex = 0;
                if (rx_dangerous.test(text)) {
                    text = text.replace(rx_dangerous, function (a) {
                        return '\\u' +
                                ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                    });
                }

                // In the second stage, we run the text against regular expressions that look
                // for non-JSON patterns. We are especially concerned with '()' and 'new'
                // because they can cause invocation, and '=' because it can cause mutation.
                // But just to be safe, we want to reject all unexpected forms.

                // We split the second stage into 4 regexp operations in order to work around
                // crippling inefficiencies in IE's and Safari's regexp engines. First we
                // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
                // replace all simple value tokens with ']' characters. Third, we delete all
                // open brackets that follow a colon or comma or that begin the text. Finally,
                // we look to see that the remaining characters are only whitespace or ']' or
                // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

                if (
                    rx_one.test(
                        text
                            .replace(rx_two, '@')
                            .replace(rx_three, ']')
                            .replace(rx_four, '')
                    )
                ) {

                    // In the third stage we use the eval function to compile the text into a
                    // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
                    // in JavaScript: it can begin a block or an object literal. We wrap the text
                    // in parens to eliminate the ambiguity.

                    j = eval('(' + text + ')');

                    // In the optional fourth stage, we recursively walk the new structure, passing
                    // each name/value pair to a reviver function for possible transformation.

                    return typeof reviver === 'function'
                        ? walk({ '': j }, '')
                        : j;
                }

                // If the text is not JSON parseable, then a SyntaxError is thrown.

                throw new SyntaxError('JSON.parse');
            };
        }
    }());

    // 添加script
    bamboo.addScriptToBody = function(varSrc, varInnerHTML) {
        var varScript = document.createElement("script");
        if (varSrc != "") {
            varScript.src = varSrc;
        }
        varScript.language = "javascript";
        varScript.type = "text/javascript";
        if (varInnerHTML != "") {
            varScript.text = varInnerHTML;
        }
        document.body.appendChild(varScript);
    }
    //百度统计
    bamboo.bdStatic = function () {
        var _bdhmProtocol = (("https:" == document.location.protocol) ? "https://" : "http://");
        bamboo.addScriptToBody(_bdhmProtocol + unescape("hm.baidu.com/h.js%3Fa4fa2a41b865534a782ceef2185fffaf"), "");
    }

    // 拖拽
    function Drag(o) {
        var defaults = {
            // $tar: null, // 拖动的元素, 必须
            // $drag: null, // 拖动触发的元素, 默认同$tar
            // noTriggerClass, // 不允许触发的部分的class（在和resize同时使用时）
            // moveEnd: null, // 拖动释放后的回调
            // movingCall: null // 移动时候的回调
            moveType: 1, // 拖拽方式。默认 0：留阴影拖拽；1：无阴影直接拖拽
            moveOut: 0, // 是否允许拖出窗口外面。0：不允许；1：允许
            $moveLimit: $win // 限制移动的范围。默认$(window)
        }
        var isMove;
        Drag.index++;
        var t = this;
        var opts = t.opts = $.extend(defaults, o);
        // 拖动的元素设置默认的定位方式（position:absolute）
        var positionType = opts.$tar.css("position");
        if (positionType !== "absolute" || positionType !== "fixed") {
            opts.$tar.css("position", "absolute");
        }
        opts.moveO = opts.$tar;
        if (!opts.$drag) opts.$drag = opts.$tar;
        opts.$drag.addClass("_b-drag-temp-" + Drag.index);
        if (opts.$tar[0]) {
            // 释放后的回调函数
            function moveupCall() {
                var moveO = opts.moveO, mgleft = parseInt(moveO.css('margin-left'));
                var lefts = parseInt(opts.move.css('left'));
                if (moveO.css('position') !== 'fixed') {
                    opts.setY = 0;
                }
                moveO.css({ left: lefts, top: parseInt(opts.move.css('top')) - opts.setY });
            }
            $(document).off("mousedown.drag" + Drag.index).on('mousedown.drag' + Drag.index, "._b-drag-temp-" + Drag.index, function (M) {
                if (opts.noTriggerClass) {
                    if ($(M.target).closest("." + opts.noTriggerClass)[0]) {
                        return;
                    }
                }
                M.preventDefault();
                var pO = opts.moveO.position();
                var xx = pO.left, yy = pO.top, ww = opts.moveO.outerWidth() - 6, hh = opts.moveO.outerHeight() - 6;
                if (!$('#b-layer-moves')[0]) {
                    opts.$tar.after('<div id="b-layer-moves" class="b-layer-moves" style="left:' + xx + 'px; top:' + yy + 'px; width:' + ww + 'px; height:' + hh + 'px; z-index:2147483584"></div>');
                }
                opts.move = $('#b-layer-moves');
                var pO1 = opts.move.position();
                opts.moveType && opts.move.css({ visibility: 'hidden' });
                opts.moveX = M.pageX - pO1.left;
                opts.moveY = M.pageY - pO1.top;
                opts.moveO.css('position') !== 'fixed' || (opts.setY = $win.scrollTop());
                isMove = true;
            });
            $(document).off("mousemove.drag" + Drag.index).on("mousemove.drag" + Drag.index, function (M) {
                if (isMove) {
                    var offsetX = M.pageX - opts.moveX, offsetY = M.pageY - opts.moveY;
                    M.preventDefault();
                    //控制元素不被拖出窗口外
                    if (!opts.moveOut) {
                        try{
                            var po = opts.$moveLimit.position();
                        }catch(e){
                            var po = {left:0, top: 0}
                        }
                        var limitL = po.left;
                        var limitR = opts.$moveLimit.outerWidth() - opts.moveO.outerWidth() + po.left + opts.$moveLimit.scrollLeft();
                        var limitT = po.top;
                        console.log(opts.moveO.outerHeight())
                        var limitB = opts.$moveLimit.outerHeight() - opts.moveO.outerHeight() + po.top + opts.$moveLimit.scrollTop();
                        // 左边界
                        offsetX < limitL && (offsetX = limitL);
                        // 右边界
                        offsetX > limitR && (offsetX = limitR);
                        // 上边界
                        offsetY < limitT && (offsetY = limitT);
                        // 下边界
                        offsetY > limitB && (offsetY = limitB);
                    }
                    opts.move.css({ left: offsetX, top: offsetY });
                    opts.movingCall && opts.movingCall(offsetX, offsetY);
                    opts.moveType && moveupCall(offsetX, offsetY);
                    offsetX = offsetY = setTop = null;
                }
            }).off("mouseup.drag" + Drag.index).on("mouseup.drag" + Drag.index, function () {
                if (isMove) {
                    moveupCall();
                    opts.move.remove();
                    opts.moveEnd && opts.moveEnd();
                }
                isMove = false;
            })
        }
    }
    Drag.index = 0;
    bamboo.drag = function (o) {
        new Drag(o)
    }
    // 缩放
    function Resize(o) {
        Resize.index++;
        var defaults = {
            //$resize: null, //触发的元素
            //$tar: null, //resize的对象，必须
            // movingCall, // 移动时候的回调
            //maxWidth: 1000, 
            //maxHeight: 1000,
            xresizeUnit: 1, // 水平方向缩放倍率
            yresizeUnit: 1, // 垂直方向缩放倍率
            lockRate: false, // 是否固定缩放比，默认false
            minWidth: 50,
            minHeight: 50,
            $limit: $win // 限制移动的范围。
        }
        var t = this;
        var isResize = false;
        var opts = this.opts = $.extend(defaults, o);
        if (!opts.$tar[0]) return;

        // 创建四边触发元素
        !opts.$resize ? (function(){
            // 无触发的元素
            var direct = opts.lockRate ? ["nw", "ne", "sw", "se"] : ["nw", "n", "ne", "w", "e", "sw", "s", "se"];
            var str = '';
            for (var i = 0; i < direct.length; i++) {
                str += '<div data-tag="' + direct[i] + '" class="b-trigger-resize b-trigger-resize-' + ((opts.lockRate ? (function () { var a = [0, 2, 5, 7]; return a[i] }()) : i) + 1) + '"></div>';
            }
            opts.$tar.append(str);
            opts.$resize = opts.$tar.find(".b-trigger-resize");
        })() : (function () {
            // 有触发的元素
        })()
        // 固定缩放比时，计算缩放比例
        var rate = opts.lockRate ? opts.$tar.width() / opts.$tar.height() : false;
        // 得到目标元素宽高
        function _getWH(info, isWest, isNorth) {
            var tag = opts._tag;
            var w = isWest ? (info.w - info.x * opts.xresizeUnit) : (info.w + info.x * opts.xresizeUnit);
            var h = isNorth ? (info.h - info.y) : (info.h + info.y);
            
            h = (tag.indexOf("n") < 0 && tag.indexOf("s") < 0) ? false : h;
            w = (tag.indexOf("w") < 0 && tag.indexOf("e") < 0) ? false : w;
            
            // 固定缩放比
            if (opts.lockRate) {
                var h = w / rate;
            }
            if (isWest && (opts._tempLeft + info.x) <= 0) {
                w = opts._tempLeft + opts._tempWidth;
                opts.$tar.css("left", opts._tempWidth - opts.minWidth); // 移动快的时候left会大于0。强制等于0 
            }
            if (isNorth && (opts._tempTop + info.y) <= 0) {
                h = opts._tempTop + opts._tempHeight;
                opts.$tar.css("top", opts._tempHeight - opts.minHeight); // 移动快的时候top会大于0。强制等于0
            }
            
            return { w: w, h: h }
        }
        // 设置目标元素大小，位置，区域限制在这里处理
        function setSizePosition(whlt, info, isWest, isNorth) {
            var offsetX = info.x;
            var offsetY = info.y;
            if (!whlt) return;
            // 基本判断，存在并且大于0（上边界，左边界）
            var w = whlt.w !== undefined ? (whlt.w < 0 ? 0 : whlt.w) : false;
            var h = whlt.h !== undefined ? (whlt.h < 0 ? 0 : whlt.h) : false;
            var l = whlt.l !== undefined ? (whlt.l < 0 ? 0 : whlt.l) : false;
            var t = whlt.t !== undefined ? (whlt.t < 0 ? 0 : whlt.t) : false;
            var limitW = opts.$limit.width();
            var limitH = opts.$limit.height();
            // 右边界限定
            if (l !== false && w !== false && (l+w > limitW)) {
                w = limitW  - l;
            }
            // 下边界限定
            if (t !== false && h !== false && (t+h > limitH)) {
                h = limitH - t;
            }
            // 最小边，最大边限制
            if (h !== false && h < opts.minHeight) {
                // 有宽高比限制时
                if (opts.lockRate) {
                    if (rate >= 1) { // 长度 大于 高度
                        w = rate * opts.minWidth;
                    }
                }
                h = opts.minHeight;
            }
            if (h !== false && h > opts.maxHeight) {
                h = opts.maxHeight;
            }
            if (w !== false && w < opts.minWidth) {
                // 有宽高比限制时
                if (opts.lockRate) {
                    if (rate <= 1) { // 长度 大于 高度
                        h = opts.minWidth/rate;
                    }
                }
                w = opts.minWidth;
            }
            if (w !== false && w > opts.maxWidth) {
                w = opts.maxWidth;
            }
            // 有宽高比限制时,限制宽高
            if (opts.lockRate) {
                // 长宽相等
                if (rate == 1) {
                    w > h ? w = h : h = w;
                }
                // 长 > 宽
                if (rate > 1) {
                    if (w / h < rate) { // h太大，以w为准
                        h = w / rate;
                    }
                    if (w / h > rate) { // w太大，以h为准
                        w = h * rate;
                    }
                }
                // 长 < 宽
                if (rate < 1) {
                    if (w / h < rate) { // h太大，以w为准
                        h = w / rate;
                    }
                    if (w / h > rate) { // w太大，以h为准
                        w = h * rate;
                    }
                }
            }
            if (isWest && (opts._tempWidth - info.x <= opts.minWidth)) {
                l = opts._tempLeft + opts._tempWidth - opts.minWidth;
            }
            if (isWest && (opts._tempWidth - info.x) >= opts.maxWidth) {
                l = opts._tempLeft + opts._tempWidth - opts.maxWidth;
            }
            if (isNorth && (opts._tempHeight - info.y <= opts.minHeight)) {
                t = opts._tempTop + opts._tempHeight - opts.minHeight;
            }
            if (isNorth && (opts._tempHeight - info.y >= opts.maxHeight)) {
                t = opts._tempTop + opts._tempHeight - opts.maxHeight;
            }
           
            if (w !== false) opts.$tar.css({ width: w + "px" });
            if (h !== false) opts.$tar.css({ height: h + "px" });
            if (t !== false) { opts.$tar.css({ top: t + "px" }); }
            if (l !== false) opts.$tar.css({ left: l + "px" });
        }
        // 移动鼠标触发函数
        function moveResize(M) {
            if (isResize) {
                var w = opts.$tar.width(), h = opts.$tar.height();
                var offsetX = M.pageX - opts.moveX, offsetY = M.pageY - opts.moveY;
                var info = { w: opts._tempWidth, h: opts._tempHeight, x: offsetX, y: offsetY };
                var wh = {};
                var pO = { t: false, l: false };
                var isWest;
                var isNorth;
                switch (opts._tag) {
                    case "nw":
                        isWest = true; isNorth = true;
                        wh = _getWH(info, isWest, isNorth);
                        pO = { t: opts._tempTop - (wh.h - info.h), l: opts._tempLeft + offsetX };
                        break;
                    case "n":
                        isWest = false; isNorth = true;
                        wh = _getWH(info, isWest, isNorth);
                        pO = { t: opts._tempTop + offsetY, l: opts._tempLeft };
                        break;
                    case "ne":
                        isWest = false; isNorth = true;
                        wh = _getWH(info, isWest, isNorth);
                        pO = { t: opts._tempTop - (wh.h - info.h), l: opts._tempLeft };
                        break;
                    case "w":
                        isWest = true; isNorth = false;
                        wh = _getWH(info, isWest, isNorth);
                        pO = {t: opts._tempTop, l: opts._tempLeft + offsetX };
                        break;
                    case "e":
                        isWest = false; isNorth = false;
                        wh = _getWH(info, isWest, isNorth);
                        pO = { t: opts._tempTop, l: opts._tempLeft };
                        break;
                    case "sw":
                        isWest = true; isNorth = false;
                        wh = _getWH(info, isWest, isNorth);
                        pO = { l: opts._tempLeft + offsetX, t: opts._tempTop }
                        break;
                    case "s":
                        isWest = false; isNorth = false;
                        wh = _getWH(info, isWest, isNorth);
                        pO = { t: opts._tempTop, l: opts._tempLeft };
                        break;
                    case "se":
                        isWest = false; isNorth = false;
                        wh = _getWH(info, isWest, isNorth);
                        pO = { t: opts._tempTop, l: opts._tempLeft };
                        break;
                }
                setSizePosition($.extend(wh, pO), info, isWest, isNorth);
                opts.movingCall && opts.movingCall(offsetX, offsetY, opts);
            }
        }
        // 点击鼠标
        opts.$resize.off().on("mousedown", function (M) {
            M.preventDefault();
            opts._tempWidth = opts.$tar.width();
            opts._tempHeight = opts.$tar.height();
            opts._tempLeft = opts.$tar.position().left;
            opts._tempTop = opts.$tar.position().top;
            opts._dragLeft = opts.$resize.position().left,
            opts._dragTop = opts.$resize.position().top,
            t.opts._tag = $(this).attr("data-tag");
            opts.moveX = M.pageX;
            opts.moveY = M.pageY;
            isResize = true;
        })
        // 移动鼠标
        $(document).off("mousemove.resize" + Resize.index).on("mousemove.resize" + Resize.index, moveResize);
        // 松起鼠标
        $(document).off("mouseup.resize" + Resize.index).on("mouseup.resize" + Resize.index, function (M) {
            isResize = false;
        })
    }
    Resize.index = 0;
    bamboo.resize = function (o) {
        new Resize(o)
    }
    /*
    ！ layer弹出层组件
     @ date: 2015/12/14
    */
    function Layer(opts) {
        this.opts = $.extend({}, this.opts, opts);
        this.index = ++Layer.index;
        this.init();
    }
    Layer.index = 0;
    Layer.pt = Layer.prototype;

    //默认配置
    var ready = {
        types: ['dialog', 'page', 'iframe', 'loading'],
        anim: ['b-anim', 'b-anim-01', 'b-anim-02', 'b-anim-03', 'b-anim-04', 'b-anim-05', 'b-anim-06']
    }

    Layer.pt.opts = {
        type: 0,
        index: 0,
        fix: true,
        shade: 0.3,
        move: ".b-layer-title",
        title: '&#x4FE1;&#x606F;',
        offset: 'auto',
        area: 'auto',
        closeBtn: 1,
        time: 0, //0表示不自动关闭
        zIndex: 99,
        maxWidth: 360,
        shift: 0,
        icon: -1,
        scrollbar: true, //是否允许浏览器滚动条
        iframeAuto: false // 只有在type为2时起作用。方法是定时器轮询监测高度的变化（不建议使用）
    };
    //创建基础骨架
    Layer.pt.init = function () {
        var t = this, opts = t.opts;
        var times = t.index;
        var zIndex = times + opts.zIndex;
        var titype = typeof opts.title == "object";
        var conType = typeof opts.content === 'object';
        var ismax = opts.maxmin && (opts.type === 1 || opts.type === 2);
        // 初始化遮罩层
        opts.$shade = opts.shade ? $('<div class="b-layer-shade"  id="b-layer-shade' + times + '" times="' + times + '" style="z-index:' + (zIndex - 1) + ';background-color:' + (opts.shade[1] || '#000') + ';opacity:' + (opts.shade[0] || opts.shade) + '; filter:alpha(opacity=' + (opts.shade[0] * 100 || opts.shade * 100) + ');"></div>') : null;
        if (opts.shade) {
            opts.$shade.appendTo($body);
        }
        // 初始化内容
        if (typeof opts.area === 'string') {
            opts.area = opts.area === 'auto' ? ['', ''] : [opts.area, ''];
        }
        switch (opts.type) {
            case 0:
                break;
            case 2:
                var content = opts.content = conType ? opts.content : [opts.content || 'http://www.huitu.com', 'auto'];
                opts.content = '<iframe scrolling="' + (opts.content[1] || 'auto') + '" allowtransparency="true"  onload="this.className=\'\';" class="b-layer-load" frameborder="0" src="' + opts.content[0] + '"></iframe>';
                break;
            case 3:
                opts.title = false;
                opts.closeBtn = false;
                opts.icon === -1 && (optsig.icon === 0);
                t.closeAll('loading');
                break;
            case 4:
                break;
        }
        var titleHTML = (opts.title ? '<div class="b-layer-title" style="' + (titype ? opts.title[1] : '') + '">' + (titype ? opts.title[0] : opts.title) + '</div>' : '');
        t.layero = $('<div type=' + ready.types[opts.type] + ' times=' + times + ' class="b-layer ' + (ready.anim[opts.shift] || '') + (' b-layer-' + ready.types[opts.type]) + ' ' + (opts.skin || '') + '" id="b-layer' + times + '" style="z-index: ' + zIndex + '; width:' + opts.area[0] + ';height:' + opts.area[1] + (opts.fix ? '' : ';position:absolute;') + ';display:' + ((opts.type == 2 && opts.iframeAuto) ? "none" : "block") + '">'
                // title
                + (conType && opts.type != 2 ? '' : titleHTML)
                // content
                + '<div class="b-layer-content' + ((opts.type == 0 && opts.icon !== -1) ? ' b-layer-padding' : '') + (opts.type == 3 ? ' b-layer-loading' + opts.icon : '') + '">'
                    + (opts.type == 0 && opts.icon !== -1 ? '<i class="b-layer-ico b-layer-ico' + opts.icon + '"></i>' : '')
                    + (opts.type == 1 && conType ? '' : (opts.content || ''))
                + '</div>'
                // 最大化最小化
                + '<span class="b-layer-setwin">' + function () {
                    var closebtn = ismax ? '<a class="b-layer-min" href="javascript:;"><cite></cite></a><a class="b-layer-ico b-layer-max" href="javascript:;"></a>' : '';
                    opts.closeBtn && (closebtn += '<a class="b-layer-close b-layer-close' + (opts.title ? opts.closeBtn : (opts.type == 4 ? '1' : '2')) + '" href="javascript:;">×</a>');
                    return closebtn;
                }() + '</span>'
                // 按钮
                + (opts.btn ? function () {
                    var button = '';
                    typeof opts.btn === 'string' && (opts.btn = [opts.btn]);
                    for (var i = 0, len = opts.btn.length; i < len; i++) {
                        button += '<a class="b-layer-btn' + i + '">' + opts.btn[i] + '</a>'
                    }
                    return '<div class="b-layer-btn">' + button + '</div>'
                }() : '')
            + '</div>');
        conType ? function () {
            if (!opts.content.parents(".b-layer")[0]) {
                t.layero.find(".b-layer-content").html(opts.content)
            }
        }() : function () { };
        t.layero.appendTo($body);

        t.auto(times)
        opts.iframeAuto ? (function () { })() : t.offset();
        if(opts.move){
            bamboo.drag({
                $drag: t.layero.find(opts.move),
                $tar: t.layero,
                moveType: 1
            });
        }
        t.callback();

        if (opts.fix) {
            $win.on('resize', function () {
                t.offset();
                (/^\d+%$/.test(opts.area[0]) || /^\d+%$/.test(opts.area[1])) && t.auto(times);
            });
        }
        // 指定时间消失
        opts.time <= 0 || setTimeout(function () {
            t.close(t.index)
        }, opts.time);
    }

    // 位置调整
    Layer.pt.auto = function (index) {
        var t = this, opts = t.opts, layero = $('#b-layer' + index);
        if (opts.area[0] === '' && opts.maxWidth > 0) {
            //为了修复IE7下一个让人难以理解的bug
            if (/MSIE 7/.test(navigator.userAgent) && opts.btn) {
                layero.width(layero.innerWidth());
            }
            layero.outerWidth() > opts.maxWidth && layero.width(opts.maxWidth);
        }
        var area = [layero.innerWidth(), layero.innerHeight()];
        var titHeight = layero.find(".b-layer-title").outerHeight() || 0;
        var btnHeight = layero.find('.b-layer-btn').outerHeight() || 0;
        function setHeight(elem) {
            elem = layero.find(elem);
            elem.height(area[1] - titHeight - btnHeight - 2 * (parseFloat(elem.css('padding')) | 0));
        }
        switch (opts.type) {
            case 2:
                setHeight('iframe');
                if (opts.iframeAuto) {
                    layero.find('iframe').on("load", function () {
                        setInterval(function () {
                            (typeof opts.iframeAuto == "object" && opts.iframeAuto[1]) ? t.offset() : function () { };
                            t.iframeAuto(index);
                        }, 200);
                        t.offset();
                        setTimeout(function () { t.offset() }, 205)
                        layero.show();
                    });
                }
                break;
            default:
                if (opts.area[1] === '') {
                    if (opts.fix && area[1] >= $win.height()) {
                        area[1] = win.height();
                        setHeight('.b-layer-content');
                    }
                } else {
                    //setHeight('.b-layer-content');
                }
                break;
        }
        return t;
    }
    //计算坐标
    Layer.pt.offset = function () {
        var t = this, opts = t.opts, layero = t.layero;
        var area = [layero.outerWidth(), layero.outerHeight()];
        var type = typeof opts.offset === 'object';
        t.offsetTop = ($win.height() - area[1]) / 2;
        t.offsetLeft = ($win.width() - area[0]) / 2;
        if (type) {
            t.offsetTop = opts.offset[0];
            t.offsetLeft = opts.offset[1] || t.offsetLeft;
        } else if (opts.offset !== 'auto') {
            t.offsetTop = opts.offset;
            if (opts.offset === 'rb') { //右下角
                t.offsetTop = $win.height() - area[1];
                t.offsetLeft = $win.width() - area[0];
            }
        }
        if (!opts.fix) {
            t.offsetTop = /%$/.test(t.offsetTop) ?
                $win.height() * parseFloat(t.offsetTop) / 100
            : parseFloat(t.offsetTop);
            t.offsetLeft = /%$/.test(t.offsetLeft) ?
                $win.width() * parseFloat(t.offsetLeft) / 100
            : parseFloat(t.offsetLeft);
            t.offsetTop += $win.scrollTop();
            t.offsetLeft += $win.scrollLeft();
        }
        layero.css({ top: t.offsetTop, left: t.offsetLeft });
    };
    
    Layer.pt.callback = function () {
        var t = this, layero = t.layero, opts = t.opts;
        // 成功后回调
        if (opts.success) {
            if (opts.type == 2) {
                layero.find('iframe').on('load', function () {
                    opts.success(t);
                });
            } else {
                opts.success(t);
            }
        }
        // 点击按钮后的回调
        layero.find(".b-layer-btn").children('a').on('click', function () {
            var index = $(this).index();
            opts['btn' + (index + 1)] && opts['btn' + (index + 1)](t);
            opts['btn' + (index + 1)] || t.close(t.index);
        });
        //取消
        function cancel() {
            var close = opts.cancel && opts.cancel(t.index);
            close === false || t.close(t.index);
        }
        //右上角关闭回调
        layero.find('.b-layer-close').on('click', cancel);
        //点遮罩关闭
        if (opts.shadeClose) {
            $('#b-layer-shade' + t.index).on('click', function () {
                t.close(t.index);
            });
        }
    };
    //关闭当前layer
    Layer.pt.close = function (index) {
        var layero = $('#b-layer' + index), type = layero.attr('type');
        if (!layero[0]) return;
        if (type === ready.types[1] && layero.attr('conType') === 'object') {
            layero.children(':not(.b-layer-content)').remove();
            for (var i = 0; i < 2; i++) {
                layero.find('.b-layer-wrap').unwrap().hide();
            }
        } else {
            //低版本IE 回收 iframe
            if (type === ready.types[2]) {
                try {
                    var iframe = $('#b-layer-iframe' + index)[0];
                    iframe.contentWindow.document.write('');
                    iframe.contentWindow.close();
                    layero.find('.b-layer-content')[0].removeChild(iframe);
                } catch (e) { }
            }
            layero[0].innerHTML = '';
            layero.remove();
        }
        $('#b-layer-moves, #b-layer-shade' + index).remove();
        //  bamboo.ie6 && ready.reselect();
        //   ready.rescollbar(index);
        //   $(document).off('keydown', ready.enter);
        // typeof ready.end[index] === 'function' && ready.end[index]();
        //  delete ready.end[index];
    };
    //关闭所有层
    Layer.pt.closeAll = function (type) {
        var t = this;
        $.each($('.b-layer'), function () {
            var othis = $(this);
            var is = type ? (othis.attr('type') === type) : 1;
            is && t.close(othis.attr('times'));
            is = null;
        });
    };
    //iframe层自适应宽高
    Layer.pt.iframeAuto = function (index) {
        var t = this, o = t.opts;
        if (!index) return;
        var layero = $("#b-layer" + index);
        var $iframeHtml = layero.find("iframe").contents().find("html");
        if (o.iframeAuto) $iframeHtml.css("overflow", "hidden");
        var heg = $iframeHtml.outerHeight();
        var titHeight = layero.find(".b-layer-title").outerHeight() || 0;
        var btnHeight = layero.find('.b-layer-btn').outerHeight() || 0;
        layero.css({ height: heg + titHeight + btnHeight });
        layero.find('iframe').css({ height: heg });
    };
    bamboo.layer = function (opts) {
        return new Layer(opts);
    };


    /*
    ！ select自定义选择框组件
        @ date: 2015/12/24
    */
    function Select(_el, opts) {
        this.$el = _el;
        this.index = ++Select.index;
        this.opts = $.extend({}, this.opts, opts);
        this.init();
    }
    Select.index = 0;
    Select.pt = Select.prototype;
    Select.pt.opts = {
        initNum: 9,
        success: function () { },
        //onChange: function(){},
        area: ["170px", "35px"]
    }
    // 创建基础骨架
    Select.pt.init = function () {
        var t = this, opts = t.opts;
        t.initSelfSelect();
        t._bind(t.index);
        t._callback();
    }
    Select.pt.initSelfSelect = function () {
        var t = this, opts = t.opts;
        // 包裹select
        opts._$selectOldWrap = $('<div class="b-select-all" times="' + t.index + '" id="b-select-' + t.index + '"><div style="height: 0px; overflow: hidden; position: absolute;" class="b-select-old-wrap"></div></div>');
        if ($("#b-select-" + t.index).length == 0) {
            t.$el.wrap(opts._$selectOldWrap);
        }
        // 初始化自定义select
        var content = '';
        if (t.$el[0] && t.$el[0].tagName.toLowerCase() == "select") {
            var $options = t.$el.find("option");
            $.each($options, function (i, n) {
                var $option = $(n);
                var selectedClass = "";
                if ($option.prop("selected")) {
                    selectedClass = "b-select-selected";
                };
                content += '<li class="' + selectedClass + '" data-value="' + $(n).prop("value") + '">' + $(n).html() + '</li>';
            })
        }
        if (opts._$selectNew) opts._$selectNew.remove();
        opts._$selectNew = $('<div tabindex="0" times=' + t.index + ' class="b-select-content ' + (opts.skin || '') + '" style="width:' + opts.area[0] + ';" tabindex="0">' +
                '<div class="b-select-text">' +
                    '<span class="b-select-icon"></span>' +
                    '<div class="b-select-title">' +
                        ($options[0] ? $options.filter(":selected").html() : "") +
                    '</div>' +
                '</div>' +
                '<div class="b-select-child" style="position:absolute;z-index:20;display:none;overflow:auto;width: ' + opts.area[0] + ';max-height:' + parseInt(opts.area[1]) * opts.initNum + 'px;top:' + (parseInt(opts.area[1]) - 1) + 'px">' +
                    '<ul>' +
                        content +
                    '</ul>' +
                '</div>' +
            '</div>');
        $("#b-select-" + t.index).append(opts._$selectNew);
        t.$inp = opts._$selectNew.find(".b-select-text");
        t.$child = opts._$selectNew.find(".b-select-child");
    }
    // 绑定元素事件
    Select.pt._bind = function (_index) {
        var t = this;
        var opts = t.opts;
        function setVal(index, pos) {
            var $w = $("#b-select-" + index);
            var txt = $w.find("select option").eq(pos).prop("selected", "selected").html();
            $w.find(".b-select-title").html(txt);
            $w.find(".b-select-child li").removeClass("b-select-selected").eq(pos).addClass("b-select-selected");
            $w.find("select").change();
        }
        function showChild() {
            t.$child.show();
        }
        function hideChild(index) {
            $("#b-select-" + index).find(".b-select-child").hide();
        }
        function scrollToNeeded(upOrDown, index, pos) {
            var $child = $("#b-select-" + index).find(".b-select-child");
            var $li = $child.find("li");
            var perLen = $li.eq(0).height();
            var $c = $li.eq(pos);
            var position = $c.position();
            var cH = $child.height();
            var scrollTop = $child.scrollTop();
            if (upOrDown === false) {
                $child.scrollTop(perLen * (pos + 1) - cH < 0 ? 0 : perLen * (pos + 1) - cH);
            }
            upOrDown == 40 ? (function () { // 下
                (position.top + perLen) > cH ? (function () {
                    $child.scrollTop(scrollTop + (perLen * Math.ceil(opts.initNum / 2)));
                })() : (function () { })()
            })() : (function () { // 上
                (position.top) < 0 ? (function () {
                    $child.scrollTop(scrollTop - (perLen * Math.ceil(opts.initNum)));
                })() : (function () { })()
            })()
        }

        // 点击li
        $(document).off("click.b-li").on("click.b-li", ".b-select-child li", function () {
            var $t = $(this);
            var $w = $t.parents(".b-select-all");
            var pos = $w.find("select option:selected").index();
            setVal($t.parents(".b-select-all").attr("times"), $t.index());
        });
        // 键盘事件
        $(document).off("keydown.select").on("keydown.select", ".b-select-content", function (e) {
            var code = e.keyCode;
            var $t = $(this);
            var $w = $t.parents(".b-select-all");
            var index = $w.attr("times");
            if (code == 13) {
                hideChild(index);
                return;
            }
            var pos = $w.find("select option:selected").index();
            if (code == 40 || code == 38) {
                code == 40 ? (function () {
                    // 下
                    var len = $t.parents(".b-select-all").find(".b-select-child li").length;
                    pos >= len ? (function () { }) : (function () {
                        pos >= (len - 1) ? function () { } : pos++;
                        scrollToNeeded(40, index, pos);
                    })();
                })() : (function () {
                    // 上
                    pos <= 0 ? (function () { }) : (function () {
                        pos > 0 ? pos-- : function () { };
                        scrollToNeeded(38, index, pos);
                    })();
                })();
                setVal(index, pos);
            }
        })

        // select onChange事件
        t.$el.on("change", function () {
            opts.onChange ? opts.onChange.call(t) : function () { };
        })

        // 点击其它地方关闭
        $(document).off("click.select").on("click.select", function (e) {
            var $c = $(e.target).parents(".b-select-content");
            var $icon = $c.find(".b-select-icon");
            if (!$c[0]) {// 点击空白关闭所有
                $(".b-select-child").hide();
                $(".b-select-icon").removeClass("b-select-icon-hover");
            } else {
                var $child = $c.find(".b-select-child");
                $(".b-select-icon").removeClass("b-select-icon-hover");
                $child.is(":visible") ? (function () {// 显示时候需关闭
                    $child.hide();
                })() : (function () {// 隐藏时限关闭所有再打开当前
                    $(".b-select-child").hide();
                    var $w = $c.parents(".b-select-all");
                    $child.show();
                    $icon.addClass("b-select-icon-hover");
                    $w.data("firstInit") != "1" ? (function () {
                        scrollToNeeded(false, $w.attr("times"), $w.find("select option:selected").index());// 初始化即执行
                        $w.data("firstInit", "1");
                    })() : (function () { });
                })();

            }
        })
    }
    Select.pt._callback = function () {
        var t = this, opts = t.opts;
        if (opts.success) {
            opts.success.call(t, t)
        }
    }
    bamboo.select = function ($el, opts) {
        if ($el.length == 1) {
            return new Select($el, opts);
        }
    }

    /*
    ！ Page分页组件
        @ date: 2015/12/29
    */
    function Page(opts) {
        var t = this;
        t.opts = $.extend(t.opts, opts);
        t.init();
    }
    Page.pt = Page.prototype;
    Page.pt.opts = {
        $e: $("#page"),
        pages: 0, // 总页数，如果是返回的是总个数，需转换成总页数
        groups: 5, // 一屏显示的页数
        curr: 1, // 当前页数
        //skip: false,
        first: "首页",
        last: "尾页",
        prev: "上一页",
        next: "下一页"

    }
    Page.pt.init = function () {
        var t = this, opts = t.opts;
        t.render(true);
        t.bind();
    }
    Page.pt.getView = function () {
        var t = this, opts = t.opts;
        var view = [], dict = {};
        if (opts.pages <= 0) return;
        if (opts.groups > opts.pages) { opts.groups = opts.pages; }

        //计算当前组
        dict.index = Math.ceil((opts.curr + ((opts.groups > 1 && opts.groups !== opts.pages) ? 1 : 0)) / (opts.groups === 0 ? 1 : opts.groups));
        // 当前非首页，显示上一页
        if (opts.curr > 1 && opts.prev) {
            view.push('<a href="javascript:;" class="b-page-prev" data-page="' + (opts.curr - 1) + '">' + opts.prev + '</a>');
        }
        //当前组非首组，则输出首页
        if (dict.index > 1 && opts.first && opts.groups !== 0) {
            view.push('<a href="javascript:;" class="b-page-first" data-page="1">' + opts.first + '</a><span>&#x2026;</span>');
        }
        //输出当前页组
        dict.poor = Math.floor((opts.groups - 1) / 2);
        dict.start = dict.index > 1 ? opts.curr - dict.poor : 1;
        dict.end = dict.index > 1 ? (function () {
            var max = opts.curr + (opts.groups - dict.poor - 1);
            return max > opts.pages ? opts.pages : max;
        }()) : opts.groups;
        if (dict.end - dict.start < opts.groups - 1) { //最后一组状态
            dict.start = dict.end - opts.groups + 1;
        }
        for (; dict.start <= dict.end; dict.start++) {
            if (dict.start === opts.curr) {
                view.push('<span class="b-page-curr" ' + (/^#/.test(opts.skin) ? 'style="background-color:' + opts.skin + '"' : '') + '>' + dict.start + '</span>');
            } else {
                view.push('<a href="javascript:;" data-page="' + dict.start + '">' + dict.start + '</a>');
            }
        }
        //总页数大于连续分页数，且当前组最大页小于总页，输出尾页
        if (opts.pages > opts.groups && dict.end < opts.pages && opts.last && opts.groups !== 0) {
            view.push('<span>&#x2026;</span><a href="javascript:;" class="b-page-last" data-page="' + opts.pages + '">' + opts.last + '</a>');
        }
        //当前页不为尾页时，输出下一页
        dict.flow = !opts.prev && opts.groups === 0;
        if (opts.curr !== opts.pages && opts.next || dict.flow) {
            view.push((function () {
                return (dict.flow && opts.curr === opts.pages)
                ? '<span class="page_nomore" title="&#x5DF2;&#x6CA1;&#x6709;&#x66F4;&#x591A;">' + opts.next + '</span>'
                : '<a href="javascript:;" class="b-page-next" data-page="' + (opts.curr + 1) + '">' + opts.next + '</a>';
            }()));
        }
        return '<div class="b-page-main ' + (opts.skin ? opts.skin : "") + '" id="b-page-' + t.opts.item + '">' + view.join('') + function () {
            return opts.skip
            ? '<span class="b-page-total"><label>&#x5230;&#x7B2C;</label><input type="text" value="' + opts.curr + '" onkeyup="this.value=this.value.replace(/\\D/g, \'\');" class="b-page-_skip"><label>&#x9875;</label>'
            + '<button type="button" class="b-page-_btn">\&#x786e;&#x5b9a</button></span>'
            : '';
        }() + '</div>';
    }

    // 渲染分页
    Page.pt.render = function (isFirst) {
        var t = this, opts = t.opts;
        var view = t.getView();
        opts.$e.html(view);
        opts.jump && opts.jump(t, isFirst);
    };

    // 分页事件绑定
    Page.pt.bind = function () {
        var t = this, opts = t.opts;
        opts.$e.on("click", "a", function () {
            var $t = $(this), curr = $t.attr("data-page");
            if (!curr) return;
            opts.curr = parseInt(curr);
            t.render();
        })
        if (opts.skip) {
            opts.$e.on("click", "button", function () {
                var curr = $.trim($(this).parent().find("input").val()).replace(/\s|\D/g, '');
                if (curr > opts.pages) curr = opts.pages
                if (curr) {
                    opts.curr = curr;
                    t.render();
                }
            })
        }
    };

    bamboo.page = function (opts) {
        return new Page(opts);
    }



    /*
    ！ 图片操作层（拖动，缩放，预览等）
        @ date: 2016/01/05
    */
    function ImgCorper(opts) {
        var t = this;
        t.opts = $.extend(t.opts, opts);
        t.init();
    }
    ImgCorper.pt = ImgCorper.prototype;
    ImgCorper.pt.opts = {
        //imgSrc: "", //操作的图片
        //$con: null, 
        //$viewDiv: null, 预览的div,
        //$resizeBg: null, // 缩放背景图
    }
    ImgCorper.pt.init = function () {
        var t = this, opts = t.opts;
        $('<img style="display:none" />').on("load", function () {
            var $t = $(this);
            var w = $t.width(), h = $t.height();
            // 创建基础骨架
            var _$html = $('<div class="b-ic-wrap" style="position:relative;">' +
                    '<img style="position: absolute; left: 0px; top: 0px;opacity:0.3;filter:(opacity=30)" src="' + opts.imgSrc + '">' +
                    '<div class="b-ic-drg" style="width:200px;height:200px;position: absolute;left:0;top:0;  background-image:url(' + opts.imgSrc + ')">' +
                        '<div class="b-ic-drag-area" style="cursor:move;width:184px;height:184px;position：absolute;left:8px;top:8px;position:absolute;"></div>' +
                    '</div>' +
                '</div>');
            opts.$con.html(_$html);
            // 预览div
            opts.$viewDiv[0] && opts.$viewDiv.html('<div class="b-ic-view" style="width:200px;height:200px;overflow:hidden; background-image:url(' + opts.imgSrc + ')"></div>')
            var $drag = _$html.find(".b-ic-drg");
            // 缩放背景图
            opts.$resizeBg[0] && opts.$resizeBg.html('<div class="b-ic-resizebg">' +
                            '<div class="b-ic-track-val-wrap"><span class="b-ic-track-val">1</span></div>' +
                            '<div class="b-ic-track">' +
                                '<div class="b-ic-track-line"></div>' +
                                '<div data-tag="se" class="b-ic-track-drag"></div>' +
                            '</div>' +
                        '</div>');
            var $track = opts.$resizeBg.find(".b-ic-track-drag");
            var $bgimg = _$html.find("img");
            bamboo.resize({
                $tar: $bgimg,
                xresizeUnit: w/200,
                minWidth: 200,
                maxWidth: w,
                minHeight: 200,
                maxHeight: h,
                lockRate: true,
                movingCall: function (x, y, o) {
                    var l = o._dragLeft + x;
                    if (l < 0) l = 0;
                    if (l > 184) l = 184;
                    // 拖动区域偏离时位置修正(top值)
                    if (($drag.position().top + $drag.height()) > $bgimg.height()) {
                        $drag.css({ top: ($bgimg.height() - $drag.height()) + "px" })
                        $drag.css('background-position', '-' + $drag.position().left + 'px -' + $drag.position().top + 'px');
                        opts.$viewDiv.find(".b-ic-view").css('background-position', '-' + $drag.position().left + 'px -' + $drag.position().top + 'px');
                    }
                    // 拖动区域偏离时位置修正(left值)
                    if (($drag.position().left + $drag.width()) > $bgimg.width()) {
                        $drag.css({ left: ($bgimg.width() - $drag.width()) + "px" })
                        $drag.css('background-position', '-' + $drag.position().left + 'px -' + $drag.position().top + 'px');
                        opts.$viewDiv.find(".b-ic-view").css('background-position', '-' + $drag.position().left + 'px -' + $drag.position().top + 'px');
                    }
                    // 设置track位置
                    $track.css("left", l + "px");
                    // 拖动区域背景
                    $drag.css("background-size", $bgimg.width() + "px", $bgimg.height() + "px");
                    // 预览图背景
                    opts.$viewDiv.find(".b-ic-view").css("background-size", $bgimg.width() + "px", $bgimg.height() + "px");
                 }
            });

            // 拖动
            bamboo.drag({
                $drag: _$html.find(".b-ic-drag-area"),
                $tar: $drag,
                $moveLimit: _$html.find("img"),
                moveType: 1,
                movingCall: function (x, y) {
                    $drag.css('background-position', '-' + x + 'px -' + y + 'px');
                    opts.$viewDiv.find(".b-ic-view").css('background-position', '-' + x + 'px -' + y + 'px');
                }
            });
            
            // 缩放拖动区域
            bamboo.resize({
                $tar: $drag,
                //  minWidth: 200,
                //  maxWidth: 200,
                //   minHeight: 200,
                //  maxHeight: 200,
                // lockRate: true,
                $limit: _$html.find("img"),
                movingCall: function () {
                    var x = $drag.position().left, y = $drag.position().top, w = $drag.width(), h = $drag.height();
                    $drag.css('background-position', '-' + x + 'px -' + y + 'px');
                    opts.$viewDiv.find(".b-ic-view").css({ 'background-position': '-' + x + 'px -' + y + 'px', width: w + "px", height: h + "px" });
                    _$html.find(".b-ic-drag-area").css({ width: (w - 16) + "px", height: (h - 16) + "px" });
                }
            });
            $t.remove();
        }).appendTo("body").attr("src", opts.imgSrc);
    }

    bamboo.imgcorper = function (opts) {
        return new ImgCorper(opts);
    }

    // 图片轮播

    // 图片懒加载

    // 文件上传

    // 自定义滚动条
}($))


