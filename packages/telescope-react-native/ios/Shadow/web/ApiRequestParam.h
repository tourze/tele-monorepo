/**
 * 功能说明
 * <ul>
 * <li>创建文件描述：配置文件参数实体类</li>
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

@interface ApiRequestParam : NSObject

@property(nonatomic, strong) NSString *Desc;
@property(nonatomic, strong) NSString *Key;
@property(nonatomic, strong) NSString *Value;
@property(nonatomic, strong) NSMutableArray *MultiValue;

@property(nonatomic, assign) BOOL IsNeed;
@property(nonatomic, assign) NSInteger MinLength;
@property(nonatomic, assign) NSInteger MaxLength;
@property(nonatomic, strong) NSString *ValidateClass;

@end
