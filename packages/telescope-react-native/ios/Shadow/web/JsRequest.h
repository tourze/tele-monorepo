/**
 * 功能说明
 * <ul>
 * <li>创建文件描述：H5与原生交互对象实体类</li>
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

//预声明一个类
@class JsRequest;

@protocol JsBridgeDelegate <NSObject>

@required
-(void)callbackToJs:(NSString *)func RespData:(NSString *)data;

@end

@interface JsRequest : NSObject

@property(nonatomic, weak) id currentService;

@property(nonatomic, strong) NSDictionary *jsParams;
@property(nonatomic, strong) NSString *jsCallBack;
@property(nonatomic, strong) NSString *actionName;

@property(nonatomic, strong) id currentAction;

@property(nonatomic, weak) id<JsBridgeDelegate> jsBridgeDelegate;


@end
