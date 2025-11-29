#import "Shadow.h"

@implementation Shadow

+ (NSUserDefaults *)sharedUserDefaults {
  static NSUserDefaults *ud; static dispatch_once_t once;
  dispatch_once(&once, ^{ ud = [[NSUserDefaults alloc] initWithSuiteName:[self sharedGroupIdentifier]]; });
  return ud ?: [NSUserDefaults standardUserDefaults];
}

+ (NSURL *)sharedUrl {
  NSURL *container = [[NSFileManager defaultManager] containerURLForSecurityApplicationGroupIdentifier:[self sharedGroupIdentifier]];
  if (!container) container = [NSURL fileURLWithPath:NSTemporaryDirectory()];
  return container;
}

+ (NSURL *)sharedDefaultAclUrl {
  return [[self sharedUrl] URLByAppendingPathComponent:@"default.acl"];
}

+ (NSString *)sharedGroupIdentifier { return @"group.com.example.ssr"; }

+ (BOOL)isBlankString:(NSString *)str {
  if (!str) return YES; if ((NSNull *)str == [NSNull null]) return YES;
  return [[str stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]] length] == 0;
}

@end

