//
//  NotificationSettings.m
//  ZooniverseMobile
//
//  Created by Robin Schaaf on 11/2/16.
//  Copyright © 2016 Zooniverse. All rights reserved.
//

#import "NotificationSettings.h"
#import "RCTLog.h"


@implementation NotificationSettings

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(subscribe:(NSString *)interest)
{
  RCTLogInfo(@"Pretending to subscribe to interest %@", interest);
  [[[self pusher] nativePusher] subscribeWithInterestName:@"donuts"];
}

@end
