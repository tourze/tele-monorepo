/**
 * 功能说明
 * <ul>
 * <li>创建文件描述：可控制器基类</li>
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


#import <UIKit/UIKit.h>

#import "GneteBridgeUtil.h"
#import "JsRequest.h"

@interface GneteBaseController : UIViewController


@property(nonatomic, strong) GneteBridgeUtil * _Nonnull WebComponent;
@property(nonatomic, strong) WKWebView * _Nullable WebView;


/**
 初始化WebView并加载页面
 */
- (void)initWebView:(NSString * _Nonnull)url inFrame:(CGRect)frame isLocal:(BOOL)local;
- (void)initWebView:(NSString * _Nonnull)url inFrame:(CGRect)frame isLocal:(BOOL)local withParams:(NSDictionary * _Nullable)params;


/**
 弹出消息框
 @param message 提示的消息内容
 @param cancelHandler 点击确定的处理Block
 */
- (void)alertMessage:(NSString *_Nullable)message handler:(void (^ __nullable)(UIAlertAction * _Nullable action))cancelHandler;

/**
 弹出确定框
 @param message 提示的消息内容
 @param cancelHandler 点击取消的处理Block
 @param confirmHandler 点击确定的处理Block
 */
- (void)alertConfirm:(NSString *_Nullable)message cancalHandler:(void (^ __nullable)(UIAlertAction * _Nullable action))cancelHandler confirmHandler:(void (^ __nullable)(UIAlertAction * _Nullable action))confirmHandler;



@end
