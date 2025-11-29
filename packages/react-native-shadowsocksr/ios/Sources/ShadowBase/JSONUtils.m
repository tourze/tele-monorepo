#import "JSONUtils.h"

@implementation NSDictionary (JSON)
- (NSString *)jsonString {
  NSError *error = nil;
  NSData *data = [NSJSONSerialization dataWithJSONObject:self options:NSJSONWritingPrettyPrinted error:&error];
  if (!data) return @"";
  return [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding] ?: @"";
}
@end

