//
//  NotificationSettings.m
//  ZooniverseMobile
//
//  Created by Robin Schaaf on 11/3/16.
//  Copyright © 2016 Zooniverse. All rights reserved.
//

#import "NotificationSettings.h"
#import "RCTLog.h"
#import <Pusher/Pusher.h>

@implementation NotificationSettings

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(subscribe:(NSString *)interest)
{
  
  AppDelegate *appDelegate = [[UIApplication sharedApplication] delegate];
  
  RCTLogInfo(@"Pretending to subscribe to interest %@", interest);
  
  self.pusher = appDelegate.pusher;
  [[[self pusher] nativePusher] subscribe:interest];
  
  RCTLogInfo(@"Supposedly subscribed to interest %@", interest);
}


RCT_EXPORT_METHOD(unsubscribe:(NSString *)interest)
{
  
  AppDelegate *appDelegate = [[UIApplication sharedApplication] delegate];
  
  RCTLogInfo(@"Pretending to UNsubscribe FROM interest %@", interest);
  
  self.pusher = appDelegate.pusher;
  [[[self pusher] nativePusher] unsubscribe:interest];
  
  RCTLogInfo(@"Supposedly UNsubscribed FROM interest %@", interest);
}


@end
