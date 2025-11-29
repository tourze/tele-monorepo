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

#import <Foundation/Foundation.h>
#import <WebKit/WebKit.h>
#import "JsRequest.h"

@class GneteBaseController;


@interface GneteBridgeUtil : NSObject


/**
 初始化GneteWebViewUtil
 @param delegate  回调代理
 */
-(id)initWithJsDelegate:(id<JsBridgeDelegate>)delegate;


/**
 创建一个WKWebView并设置代理
 @param frame  页面框
 */
-(WKWebView *)createWithFrame:(CGRect)frame;


/**
 统一原生到WKWebView的成功回调接口
 @param jsFunc   JS方法
 @param data     响应内容
 */
-(void)callSuccess:(WKWebView *)webView jsFunc:(NSString *)jsFunc RespData:(NSString *)data;


@end
