/**
 * 功能说明
 * <ul>
 * <li>创建文件描述：WKWebView管理以及代理实现类</li>
 * <li>修改文件描述：</li>
 * </ul>
 *
 * @author <ul>
 *         <li>创建者：<a href="mailto:lbh@chinaums.com">龙伯汉(Hank)</a ></li>
 *         <li>修改者：</li>
 *         </ul>
 * @version <ul>
 *          <li>创建版本：v1.0.0 日期：2017-04-25</li>
 *          <li>修改版本：</li>
 *          </ul>
 */

#import "GneteBridgeUtil.h"
#import "GneteBaseController.h"

#import <objc/runtime.h>
#import "JsServiceAction.h"


@interface GneteBridgeUtil() <WKNavigationDelegate, WKScriptMessageHandler>
{
}
@property(weak, nonatomic) id<JsBridgeDelegate> JsBridgeDelegate;
@end

@implementation GneteBridgeUtil


-(id)initWithJsDelegate:(id<JsBridgeDelegate>)delegate
{
    self = [super init];
    
    if (self) [self setJsBridgeDelegate: delegate];
    return self;
}

//创建一个WKWebView
-(WKWebView *)createWithFrame:(CGRect)frame
{
    //WKWebView相关配置 与视图
    WKWebViewConfiguration *config = [[WKWebViewConfiguration alloc] init];
    [config setPreferences: [[WKPreferences alloc] init]];
    [config.preferences setJavaScriptEnabled:YES];
    [config.preferences setMinimumFontSize:14.0f];
    [config.userContentController addScriptMessageHandler:self name:@"doAction"];
    
    WKWebView *webView = [[WKWebView alloc] initWithFrame:frame configuration:config];
    if (@available(iOS 11.0, *)) webView.scrollView.contentInsetAdjustmentBehavior = UIScrollViewContentInsetAdjustmentNever;
    
    webView.navigationDelegate = self;
    return webView;
}


//处理从原生到Js的成功回调
-(void)callSuccess:(WKWebView *)webView jsFunc:(NSString *)jsFunc RespData:(NSString *)data
{
    if (webView)
    {
        NSString *Script = [NSString stringWithFormat:@"%@('%@')", jsFunc, data];
        [webView evaluateJavaScript:Script completionHandler:nil];
    }
    
}



//处理从H5来的动作请求
-(void)jsAction:(NSDictionary *)requestDict
{
    JsRequest *Request = [[JsRequest alloc] init];
    [Request setActionName:@"alipayResponse"];
//    [Request setActionName:[requestDict objectForKey:@"ActionName"]];
//    [Request setJsCallBack:[requestDict objectForKey:@"Callback"]];
    
//    NSString *Params = [requestDict objectForKey:@"Params"];
    [Request setJsParams:requestDict];
//    if (Params != nil && Params.length > 0)
//    {
//        NSData *JsonData = [Params dataUsingEncoding:NSUTF8StringEncoding];
//        NSDictionary *ParamsDict = [NSJSONSerialization JSONObjectWithData:JsonData options:NSJSONReadingMutableContainers error:nil];
//        [Request setJsParams:ParamsDict];
//    }
    [Request setJsBridgeDelegate:self.JsBridgeDelegate];
    
    JsServiceAction *action = [JsServiceAction new];
    [action doBuz:Request];
    Request.currentAction = action;
}
    

#pragma WKNavigationDelegate
    


-(void)webView:(WKWebView *)webView didFinishNavigation:(WKNavigation *)navigation
{
    [webView evaluateJavaScript:@"document.documentElement.style.webkitUserSelect='none';" completionHandler:nil];
    [webView evaluateJavaScript:@"document.documentElement.style.webkitTouchCallout='none';" completionHandler:nil];
}

-(void)webView:(WKWebView *)webView didFailNavigation:(WKNavigation *)navigation withError:(NSError *)error
{
}

- (void)webView:(WKWebView *)webView didReceiveAuthenticationChallenge:(NSURLAuthenticationChallenge *)challenge completionHandler:(void (^)(NSURLSessionAuthChallengeDisposition, NSURLCredential * _Nullable))completionHandler
{
    if ([challenge.protectionSpace.authenticationMethod isEqualToString:NSURLAuthenticationMethodServerTrust])
    {
        NSURLCredential *card = [[NSURLCredential alloc]initWithTrust:challenge.protectionSpace.serverTrust];
        
        completionHandler(NSURLSessionAuthChallengeUseCredential,card);
    }
}




#pragma WKScriptMessageHandler  //HTML上配合此方法使用  window.webkit.messageHandlers.doAction.postMessage(str);
-(void)userContentController:(WKUserContentController *)userContentController didReceiveScriptMessage:(WKScriptMessage *)message
{
    //打印JS回调回来的参数信息
    printf("从H5传过来的参数:%s\n", [[[(NSString *)message.body stringByRemovingPercentEncoding]stringByRemovingPercentEncoding] cStringUsingEncoding:NSUTF8StringEncoding]) ;
    NSString *FormatedBody =  [message.body stringByReplacingOccurrencesOfString:@"'" withString:@"\""];
    NSData *jsonData = [FormatedBody dataUsingEncoding:NSUTF8StringEncoding allowLossyConversion:YES];
    
    NSError *jsonError;
    NSDictionary *jsonDict = [NSJSONSerialization JSONObjectWithData:jsonData options:NSJSONReadingMutableContainers error:&jsonError];

    if (jsonError)
    {
        //Json解释异常 停止继续执行并打印错误日志
        //if (DEBUG) NSLog(@"%s Json解释出错:  %@", __FUNCTION__, jsonError);
        return;
    }
    
    //数据无误 继续执行
    [self jsAction:jsonDict];
}
    
    
    

@end
