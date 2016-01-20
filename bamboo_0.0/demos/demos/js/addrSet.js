/*==================================================
 Copyright (c) 2015.1.7 曾鹏飞
 用户标签：初始化地址 
 基础类库：jQuery1.8.3，遵循amd规范
 ==================================================*/
define(['addrJson'], function (addrAll) {
    function addrSet(opts) {
        var defaults = {
            _u: _INITDATA._R,
            s2: ["provinceV2", "cityV2", "regionV2"],
            opt02: ["==省==|", "==市==|", "==区==|"],
            errFun: function () {
                this.$provinceV2.parents("li").prev().show().find("em").html("请选择所在地。");
            },
            okFun: function () {
                this.$provinceV2.parents("li").prev().hide();
            }
        }
        this.o = $.extend(defaults, opts)
        this.init();
    }
    addrSet.prototype = {
        init: function () {
            var _t = this;
            _t.$provinceV2 = $("#" + this.o.s2[0])
            _t.$cityV2 = $("#" + this.o.s2[1])
            _t.$regionV2 = $("#" + this.o.s2[2])
            var initCode = _t.o._u.city;
            this.initAddr(initCode);
            this.$provinceV2.on({
                change: function () {
                    addrAll.change(1, _t.o.s2, _t.o.opt02);
                    var $t = $("#cityV2").parents(".b-select-all")
                    if ($("#cityV2").find("option").length > 1) {
                        $t.show()
                    } else {
                        $t.hide().next().hide()
                    }
                    var $t1 = $("#regionV2").parents(".b-select-all");
                    if ($("#regionV2").find("option").length > 1) {
                        $t1.show()
                    } else {
                        $t1.hide()
                    }
                }
            })
            this.$cityV2.on({
                change: function () {
                    addrAll.change(2, _t.o.s2, _t.o.opt02);
                    var $t = $("#regionV2").parents(".b-select-all")
                    if ($("#regionV2").find("option").length > 1) {
                        $t.show()
                    } else {
                        $t.hide()
                    }
                }
            });
        },
        //初始化地址
        initAddr: function (code) {
            addrAll.change(0, this.o.s2, this.o.opt02);
            if (code) {
                this.setAddr(code, this.o.s2, this.o.opt02);
            }
        },
        //获取地址代码
        getAddrCode: function () {
            if (!this.$regionV2.is(":hidden")) {
                return this.$regionV2.val()
            }
            return this.$cityV2.val();
        },
        //根据code设置地址
        setAddr: function (code, s, opt0) {
            var code = String(code);
            if (code.length != 6) return;
            var code1 = code.substr(0, 2) + "0000";
            var code2 = code.substr(0, 4) + "00";
            var p = document.getElementById(s[0]);
            if (p) {
                p.value = code1;
                addrAll.change(1, s, opt0);
            }
            var a = document.getElementById(s[1]);
            if (a) {
                a.value = code2;
                if (a.value == "") a.value = code; //没有339000->339003
                $(a).show();
            }
            var c = document.getElementById(s[2]); //二级联动没有此项
            if (c) {
                addrAll.change(2, s, opt0);
                if ($(c).find("option").length > 1) {
                    $(c).show();
                }
                c.value = code;
            }
        },
        //验证地址
        checkAddr: function () {
            if (this.$provinceV2.val() != "") {
                if (this.$cityV2.val() != "") {
                    if (!this.$regionV2.is(":hidden")) {//区域属性存在
                        if (this.$regionV2.val() != "") { // 被选中
                            this.o.okFun.call(this);
                            return true;
                        }
                    } else {//区域被隐藏
                        this.o.okFun.call(this);
                        return true;
                    }
                }
            }
            this.o.errFun.call(this);
            return false;
        }
    }
    return addrSet;
})