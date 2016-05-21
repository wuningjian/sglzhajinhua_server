/**
 * Created by wuningjian on 4/27/16.
 * 专门用来执行签名逻辑的服务器
 */

var crypto = require('crypto');
//var XXTEA = require('./xxtea.js');
//var xhr = require('xmlhttprequest');
//var request = require('request');
var appId ='8013417603';
var appSec = "tYW1inAO5SmRoUVngCMy5kXLro8pTAfa";

module.exports = function(app){
    return new Sign(app);
};

var Sign = function(app){
    this.app =app;
};

Sign.prototype.get_sign_url = function(msg,session,next){
    console.log("here is get_sign_url handler");

    // 比如需要这样的格式 yyyy-MM-dd hh:mm:ss
    //var date = new Date();
    //var Y = date.getFullYear() + '-';
    //var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    //var D = date.getDate() + '';
    //var h = date.getHours() + ':';
    //var m = date.getMinutes() + ':';
    //var s = date.getSeconds();
    //var mydate = Y+M+D+h+m+s;
    //console.log(mydate.toString());

    //var data = "timeStamp=2016-04-2715:22:23&userId=13667187839&price=0.01&quantity=0.01" +
    //    "&outOrderNo=555&paymodeId=7&bankId=ALIPAY&isOnly=false";

    // 客户端订单信息
    //var price = '0.01';
    //var outOrderNo = '1*13667187839';
    //var userId = '13667187839';
    //var quantity = '0.01';
    //
    //var timeStamp = mydate.toString();
    //
    //var paymodeId = '7';
    //var channelId = '15102207';
    //var bankId = 'ALIPAY';
    //// 订单号是否唯一，true表示唯一
    //var isOnly = "true";
    // 客户端类型，这里为app客户端
    //var clientType = "30010";
    //// 请求的返回类型
    //var format = "json";
    //// 支付中心接口版本
    //var version = "v1.0";

    //var data = "paymodeId=" + paymodeId + "&price=" + price
    //    + "&timeStamp=" + timeStamp + "&channelId=" + channelId
    //    + "&outOrderNo=" + outOrderNo + "&userId=" + userId
    //    + "&isOnly=" + isOnly + "&quantity=" + quantity
    //    + "&bankId=" + bankId;
    //AppID: 8013417603    AppSecret: tYW1inAO5SmRoUVngCMy5kXLro8pTAfa
    //var appId = '8013417603';
    //var appSecret = "tYW1inAO5SmRoUVngCMy5kXLro8pTAfa";

    //进行XXTea加密
    //var param = XXTEA.encryptToBase64(data, appSecret);

    //// 签名算法
    //String sign = ByteFormat.bytesToHexString(
    //    HMAC_SHA1.getHmacSHA1(cpId + clientType + format + version
    //        + paras, "beFQpznnXQtsjAbbUtBXxlRR")).toUpperCase();
    //String payURL = "http://vip.189.cn/oc/front/api/general/pay";
    ////String payURL = "http://testvip.21cn.com/oc/front/api/general/pay";
    //payURL += "?cpId=" + cpId + "&clientType=" + clientType
    //    + "&format=" + format + "&version=" + version + "&sign="
    //    + sign + "&paras=" + paras;

    // 客户端类型，这里为app客户端
    var clientType = "30010";
    // 请求的返回类型
    var format = "json";
    // 支付中心接口版本
    var version = "v1.0";
    //签名
    //msg.param是进行过xxtea加密的结果
    var args = appId + clientType + format + version + msg.param;
    var sign=crypto.createHmac('sha1', appSec).update(args).digest().toString('base64');
    sign = sign.toString().toUpperCase();

    console.log("sign:"+sign);

    var post_data = "cpId=" + appId + "&clientType=" + clientType
        + "&format=" + format + "&version=" + version + "&sign="
        + sign + "&paras=" + msg.param;

    //var xhr = new XMLHttpRequest();
    var PAY_URL="http://vip.189.cn/oc/front/api/general/pay";

    next(null,{
        post_data:post_data,
        PAY_URL:PAY_URL
    });

    ////request.post();
    //xhr.open("POST",PAY_URL);
    //xhr.send(post_data);
    //xhr.onreadystatechange=function(){
    //    console.log("xhr.readyState:"+xhr.readyState);
    //    console.log("xhr.status:"+xhr.status);
    //    if(xhr.readyState&&xhr.status==200){
    //        var response = xhr.responseText;
    //        console.log("xhr.responseText:"+response);
    //        next(null,{
    //            //msg:"sign_hmac_sha1 receive successful"
    //            msg:response
    //        });
    //    }else{
    //        var response = xhr.responseText;
    //        console.log("xhr.responseText:"+response);
    //        next(null,{
    //            //msg:"sign_hmac_sha1 receive successful"
    //            msg:'pay error'
    //        });
    //    }
    //
    //};
};

Sign.prototype.get_timestamp = function(msg,session,next){
    console.log("enter get_timestamp");

    // 比如需要这样的格式 yyyy-MM-dd hh:mm:ss
    var date = new Date();
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    var D = date.getDate() + '';
    var h = date.getHours() + ':';
    var m = date.getMinutes() + ':';
    var s = date.getSeconds();
    var mydate = Y+M+D+h+m+s;
    console.log(mydate.toString());

    next(null,{
        timeStamp:mydate.toString()
    });
};

Sign.prototype.get_appId_appSec = function(msg,session,next){
    console.log("enter get_appId_appSec");
    if(msg.payInfo = 'pay'){
        next(null,{
            appId:appId,
            appSec:appSec
        });
    }else{
        next(null,{
            appId:null,
            appSec:null
        });
    }

};

//var args="app_id=123&access_token=abc";
//var app_secret="123456";
//var sign=crypto.createHmac('sha1', app_secret).update(args).digest().toString('base64');
//console.log('----------crypto---------:'+sign);
