//JS调用方法 以及操作说明
//function doAction(jsRequest)
//{
//    var jsRequest = {"ActionName":"scanQRCode", "Callback":"Callback", "Params":"{}"};
//    JsAction.doAction(jsRequest);
//}

//-1、安卓系统返回按钮点击，在Js实现全局Js方法：keyBack，处理返回上一个页面，在无法返回时执行09方法退出应该
//
//00、推送ID： {"ActionName":"getJPushRegId", "Callback":"Js回调方法名称", "Params":"{}"}
//01、获取定位：{"ActionName":"getLocation", "Callback":"Js回调方法名称", "Params":"{}"}
//02、打开地图：{"ActionName":"openMap", "Callback":"", "Params":"{'longitude':'经度', 'latitude':'纬度', 'title':'标题'}"}
//03、打开连接：{"ActionName":"openLink", "Callback":"", "Params":"{'url':'将要打开的连接'}"}
//04、微信分享：{"ActionName":"wechatShare", "Callback":"", "Params":"{'title':'标题', 'desc':'描述', 'url':'连接', 'type':'SESSION-聊天/MOMENTS-朋友圈'}"}
//05、QQ分享： {"ActionName":"qqShare", "Callback":"", "Params":"{{'title':'标题', 'desc':'描述', 'url':'连接', 'type':'SESSION-聊天/MOMENTS-QQ空间'}"}
//06、保存屏幕：{"ActionName":"saveScreen", "Callback":"", "Params":"{}"}
//07、扫描二维码：{"ActionName":"scanQRCode", "Callback":"", "Params":"{}"}
//08、下载文件：{"ActionName":"downloadFile", "Callback":"", "Params":"{'url':'文件路径', 'name':'保存文件名'}"}
//09、退出应用：{"ActionName":"exitApp", "Callback":"", "Params":"{}"}
//11、集合支付：{"ActionName":"pingPay", "Callback":"回调方法的参数返回支付结果", "Params":"请求聚合支付服务器返回的Json"}
//支付处理返回值
//    * "success" - 支付成功
//    * "fail"    - 支付失败
//    * "cancel"  - 取消支付
//    * "invalid" - 支付插件未安装（一般是微信客户端未安装的情况）
//    * "unknown" - app进程异常被杀死(一般是低内存状态下,app进程被杀死)
//


#import "JsServiceAction.h"


@interface JsServiceAction ()

@property (nonatomic, strong) JsRequest *request;

@end


@implementation JsServiceAction

- (void)doBuz:(JsRequest *)request
{
    self.request = request;
    NSString *ActionName = self.request.actionName;
    SEL sele = NSSelectorFromString(ActionName);
    if ([self respondsToSelector:sele]) {
        [self performSelectorOnMainThread:sele withObject:nil waitUntilDone:NO];
    }
    else {
        NSLog(@"对不到对应的实现函数%@,请在类中实现", ActionName);
    }

}

#pragma mark - Function
- (void)alipayResponse {
    //发送通知
    NSNumber *code = [self.request.jsParams objectForKey:@"code"];
    [[NSNotificationCenter defaultCenter] postNotificationName:@"ALIPAY_RESPONSE" object:@{@"code": code}];
}
@end

