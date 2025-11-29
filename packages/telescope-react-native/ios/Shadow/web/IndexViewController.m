/**
 * 功能说明
 * <ul>
 * <li>创建文件描述：首页控制器</li>
 * <li>修改文件描述：</li>
 * </ul>
 *
 * @author <ul>
 *         <li>创建者：<a href="mailto:lbh@chinaums.com">龙伯汉(Hank)</a ></li>
 *         <li>修改者：</li>
 *         </ul>
 * @version <ul>
 *          <li>创建版本：v1.0.0 日期：2017-07-26</li>
 *          <li>修改版本：</li>
 *          </ul>
 */

#import "IndexViewController.h"

#define kScreenW [UIScreen mainScreen].bounds.size.width
#define kScreenH [UIScreen mainScreen].bounds.size.height
#define KIsiPhoneX ([UIScreen instancesRespondToSelector:@selector(currentMode)] ? CGSizeEqualToSize(CGSizeMake(1125, 2436), [[UIScreen mainScreen] currentMode].size) : NO)

@interface IndexViewController () <WKNavigationDelegate>

@property(nonatomic, strong) NSString *WebUrl;
@property(nonatomic, assign) BOOL Local;
/**
 用于判断是否刷新页面
 */
@property (nonatomic, strong) NSString *lastData;

@property (nonatomic, strong) UIActivityIndicatorView *indicator;;

@end

@implementation IndexViewController

- (id)initWithUrl:(NSString *)url isLocal:(BOOL)local
{
    self = [super init];
    if (self)
    {
        self.WebUrl = url;
        self.Local = local;
        self.lastData = @"";
    }
    
    return self;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    
    CGRect Frame = CGRectMake(0, 64, kScreenW, kScreenH - 64);
    if (KIsiPhoneX)
    {
        Frame = CGRectMake(0, 74, kScreenW, kScreenH - 74);
    }
    [self initWebView:self.WebUrl inFrame:Frame isLocal:self.Local];
    self.WebView.navigationDelegate = self;
    [self setUpActivityIndicatorView];
    

}

- (void)setUpActivityIndicatorView
{
    _indicator = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleGray];
    
    _indicator.center = self.view.center;
    _indicator.backgroundColor = [UIColor clearColor];
    [_indicator startAnimating];
    
    [self.view addSubview:_indicator];
}
- (void)viewDidAppear:(BOOL)animated
{

}


#pragma JsRequestDelegate
-(void)callbackToJs:(NSString *)func RespData:(NSString *)data;
{
    [self.WebComponent callSuccess:self.WebView jsFunc:func RespData:data];
}



#pragma mark - WKNavigationDelegate
- (void)webView:(WKWebView *)webView decidePolicyForNavigationAction:(WKNavigationAction *)navigationAction decisionHandler:(void (^)(WKNavigationActionPolicy))decisionHandler {
    
    if ([navigationAction.request.URL.scheme isEqualToString:@"alipay"]) {
            //  1.以？号来切割字符串
            NSArray *urlBaseArr = [navigationAction.request.URL.absoluteString componentsSeparatedByString:@"?"];
            NSString *urlBaseStr = urlBaseArr.firstObject;
            NSString *urlNeedDecode = urlBaseArr.lastObject;
            //  2.将截取以后的Str，做一下URLDecode，方便我们处理数据
            NSMutableString *afterDecodeStr = [NSMutableString stringWithString:[IndexViewController decoderUrlEncodeStr:urlNeedDecode]];
            //  3.替换里面的默认Scheme为自己的Scheme
            NSString *afterHandleStr = [afterDecodeStr stringByReplacingOccurrencesOfString:@"alipays" withString:@"alipayreturn.company.com"];
            //  4.然后把处理后的，和最开始切割的做下拼接，就得到了最终的字符串
            NSString *finalStr = [NSString stringWithFormat:@"%@?%@",urlBaseStr, [IndexViewController urlEncodeStr:afterHandleStr]];
            
            dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                //  判断一下，是否安装了支付宝APP（也就是看看能不能打开这个URL）
                if ([[UIApplication sharedApplication] canOpenURL:[NSURL URLWithString:finalStr]]) {
                    NSDictionary *options = @{UIApplicationOpenURLOptionUniversalLinksOnly :@YES};

                    [[UIApplication sharedApplication] openURL:[NSURL URLWithString:finalStr] options:options completionHandler:^(BOOL success) {
                        
                    }];
                } else {
                    //未安装支付宝, 自行处理
                }
            });
            
            decisionHandler(WKNavigationActionPolicyCancel);
            return;
        }
    
//    NSString *urlStr = navigationAction.request.URL.absoluteString;
//    if ([urlStr hasPrefix:@"alipays://"] || [urlStr hasPrefix:@"alipay://"] || [urlStr hasPrefix:@"weixin"]) {
//
//        NSURL *alipayURL = [NSURL URLWithString:urlStr];
//        if (@available(iOS 10.0, *)) {
//            [[UIApplication sharedApplication] openURL:alipayURL options:@{UIApplicationOpenURLOptionUniversalLinksOnly: @NO} completionHandler:^(BOOL success) {
//            }];
//        } else {
//            // Fallback on earlier versions
//            [[UIApplication sharedApplication] openURL:alipayURL];
//        }
//    }
    
    decisionHandler(WKNavigationActionPolicyAllow);
}
- (void)webView:(WKWebView *)webView didStartProvisionalNavigation:(null_unspecified WKNavigation *)navigation
{
}

- (void)webView:(WKWebView *)webView didFailProvisionalNavigation:(null_unspecified WKNavigation *)navigation withError:(NSError *)error
{
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.4 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        [self->_indicator stopAnimating];
    });
    
}

- (void)webView:(WKWebView *)webView didFinishNavigation:(null_unspecified WKNavigation *)navigation
{
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.4 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        [self->_indicator stopAnimating];
    });
    self.title = webView.title;
}

- (void)webView:(WKWebView *)webView didFailNavigation:(null_unspecified WKNavigation *)navigation withError:(NSError *)error
{
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.4 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        [self->_indicator stopAnimating];
    });
}

- (void)webView:(WKWebView *)webView didReceiveAuthenticationChallenge:(NSURLAuthenticationChallenge *)challenge completionHandler:(void (^)(NSURLSessionAuthChallengeDisposition, NSURLCredential * _Nullable))completionHandler
{
    if ([challenge.protectionSpace.authenticationMethod isEqualToString:NSURLAuthenticationMethodServerTrust])
    {
        NSURLCredential *card = [[NSURLCredential alloc]initWithTrust:challenge.protectionSpace.serverTrust];
        
        completionHandler(NSURLSessionAuthChallengeUseCredential,card);
    }
}


#pragma mark - Encode\Decode
//urlEncode编码
+ (NSString *)urlEncodeStr:(NSString *)input {
    NSString *charactersToEscape = @"?!@#$^&%*+,:;='\"`<>()[]{}/\\| ";
    NSCharacterSet *allowedCharacters = [[NSCharacterSet characterSetWithCharactersInString:charactersToEscape] invertedSet];
    NSString *upSign = [input stringByAddingPercentEncodingWithAllowedCharacters:allowedCharacters];
    return upSign;
}
//urlEncode解码
+ (NSString *)decoderUrlEncodeStr: (NSString *) input {
    NSMutableString *outputStr = [NSMutableString stringWithString:input];
    [outputStr replaceOccurrencesOfString:@"+" withString:@"" options:NSLiteralSearch range:NSMakeRange(0,[outputStr length])];
    return [outputStr stringByRemovingPercentEncoding];
}

@end
