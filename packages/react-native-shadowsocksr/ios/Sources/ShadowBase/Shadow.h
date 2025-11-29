#import <Foundation/Foundation.h>

@interface Shadow : NSObject
+ (NSUserDefaults *)sharedUserDefaults;
+ (NSURL *)sharedUrl;
+ (NSURL *)sharedDefaultAclUrl;
+ (NSString *)sharedGroupIdentifier;
+ (BOOL)isBlankString:(NSString *)str;
@end

