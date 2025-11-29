/**
 * 功能说明
 * <ul>
 * <li>创建文件描述：控制器基类</li>
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


#import "GneteBaseController.h"

@interface GneteBaseController ()<JsBridgeDelegate>

@end

@implementation GneteBaseController

- (void)viewDidLoad
{
    [super viewDidLoad];
//    [self setAutomaticallyAdjustsScrollViewInsets:NO];
//    [self.navigationController.navigationBar setHidden: YES];
    [self.view setBackgroundColor:[UIColor colorWithRed:27/255.0f green:130/255.0f blue:210/255.0f alpha:1.0f]];
    
    self.view.backgroundColor = [UIColor whiteColor];
    self.WebComponent = [[GneteBridgeUtil alloc] initWithJsDelegate:self];
    self.WebView = [self.WebComponent createWithFrame:CGRectZero];
    self.WebView.scrollView.showsVerticalScrollIndicator = NO;
    [self.view addSubview:self.WebView];
}


//初始化WKWebView
- (void)initWebView:(NSString *)url inFrame:(CGRect)frame isLocal:(BOOL)local
{
    [self initWebView:url inFrame:frame isLocal:local withParams:nil];
}


//初始化WKWebView
- (void)initWebView:(NSString *)url inFrame:(CGRect)frame isLocal:(BOOL)local withParams:(NSDictionary *)params
{
    self.WebView.frame = frame;
    NSURL* Url = [NSURL URLWithString:url];
    [self.WebView loadRequest:[NSURLRequest requestWithURL:Url]];
    
}

//获取到HTML的路径 因为有些Url包含了参数在里头
-(NSString *)findUrlStr:(NSString *)originalUrl
{
    NSRange range = [originalUrl rangeOfString:@"?"];
    if (range.location != NSNotFound) return [originalUrl substringToIndex:range.location];
    return originalUrl;
}

//获取到在URL里的参数字符串
-(NSString *)findParamStr:(NSString *)originalUrl
{
    NSRange range = [originalUrl rangeOfString:@"?"];
    
    if (range.location != NSNotFound) return [originalUrl substringFromIndex:range.location];
    return @"?";
}

//拼接字典参数
-(NSString *)combindUrlParams:(NSString *)base Other:(NSDictionary *)params
{
    NSString *ResultStr = [NSString stringWithFormat:@"%@", (base.length == 1)?base :[base stringByAppendingString:@"&"]];
    for (NSString *Key in [params allKeys])
    {
        if ([@"title" isEqual:Key] || [@"url" isEqual:Key]) continue; //过滤Title与Url字段
        ResultStr = [ResultStr stringByAppendingFormat:@"%@=%@&", Key, [params objectForKey:Key]];
    }
    
    return [[ResultStr substringToIndex:ResultStr.length - 1] stringByAddingPercentEncodingWithAllowedCharacters: [NSCharacterSet URLHostAllowedCharacterSet]];
//    return [[ResultStr substringToIndex:ResultStr.length - 1] stringByAddingPercentEscapesUsingEncoding: NSUTF8StringEncoding];
}

//弹出消息框
- (void)alertMessage:(NSString *)message handler:(void (^ __nullable)(UIAlertAction *action))cancelHandler
{
    UIAlertController *alert = [UIAlertController alertControllerWithTitle:@"应用提示" message:message preferredStyle:UIAlertControllerStyleAlert];
    [alert addAction:[UIAlertAction actionWithTitle:@"确定" style:UIAlertActionStyleCancel handler:cancelHandler]];
    [self presentViewController:alert animated:YES completion:nil];
}

//弹出确定框
- (void)alertConfirm:(NSString *)message cancalHandler:(void (^ __nullable)(UIAlertAction *action))cancelHandler confirmHandler:(void (^ __nullable)(UIAlertAction *action))confirmHandler
{
    UIAlertController *alert = [UIAlertController alertControllerWithTitle:@"应用提示" message:message preferredStyle:UIAlertControllerStyleAlert];
    [alert addAction:[UIAlertAction actionWithTitle:@"取消" style:UIAlertActionStyleCancel handler:cancelHandler]];
    [alert addAction:[UIAlertAction actionWithTitle:@"确定" style:UIAlertActionStyleDefault handler:confirmHandler]];
    [self presentViewController:alert animated:YES completion:nil];
}

#pragma JsBridgeDelegate  Native与H5交互代理
-(void)callbackToJs:(NSString *)func RespData:(NSString *)data
{
//    if (DEBUG) NSLog(@"%s  %@", __FUNCTION__, @"请在对应的业务控制器覆盖此方法！");
}





@end
